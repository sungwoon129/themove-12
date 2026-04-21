const container = document.getElementById('scroll-container');
const viewers = {};

const config = {
    totalPages: 80,
    imageWidth: 1024,
    imageHeight: 1256,
    tileSize: 512,
    basePath: "../images/202604"
};

// --- 비디오 오버레이 UI 생성 ---
const videoOverlay = document.createElement('div');
videoOverlay.id = 'video-overlay';
Object.assign(videoOverlay.style, {
    display: 'none',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: '9999',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
});

videoOverlay.innerHTML = `
    <div style="position:relative; width:80%; max-width:1000px;">
        <button id="close-video-btn" style="position:absolute; top:-40px; right:0; background:none; border:none; color:white; font-size:40px; cursor:pointer;">&times;</button>
        <video id="overlay-video-player" controls muted playsinline style="width:100%; height:auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);"></video>
    </div>
`;
document.body.appendChild(videoOverlay);

const overlayVideoPlayer = document.getElementById('overlay-video-player');
const closeVideoBtn = document.getElementById('close-video-btn');

closeVideoBtn.addEventListener('click', () => {
    videoOverlay.style.display = 'none';
    overlayVideoPlayer.pause();
    overlayVideoPlayer.src = '';
    document.body.style.overflow = ''; // 스크롤 재개
});
// -----------------------------


async function init() {
    let linkData = [];
    let videoData = [];
    const page = location.pathname.split('/').pop();
    const pageId = page.replace(/\.html(\.js)?$/, '');

    if (pageId) {
        try {
            const linkModule = await import(`./link/${pageId}.js`);
            linkData = linkModule || [];
        } catch (e) { }
        try {
            const vData = await import(`./video/${pageId}.js`);
            videoData = vData.default || [];
        } catch (e) { }
    }

    const playedVideos = new Set();
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.pageNum);
                const vConf = videoData.find(v => v.page === pageNum);

                // 해당 페이지에 비디오 설정이 있고 아직 재생하지 않았다면
                if (vConf && !playedVideos.has(pageNum)) {
                    playedVideos.add(pageNum); // 한 번만 자동재생되도록 기록

                    // 오버레이 표시 및 비디오 재생
                    videoOverlay.style.display = 'flex';
                    overlayVideoPlayer.src = vConf.video;
                    overlayVideoPlayer.play().catch(e => console.log("자동 재생이 차단되었습니다:", e));

                    // 스크롤 정지
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }, { threshold: 0.6 }); // 페이지가 60% 이상 보일 때 트리거

    for (let i = 1; i <= config.totalPages; i++) {
        const padNum = String(i).padStart(3, '0');
        const wrapper = document.createElement('div');
        wrapper.className = 'page-wrapper';
        wrapper.dataset.pageNum = i;
        wrapper.dataset.padNum = padNum;

        // [이전 답변의 레이어 구조 적용]
        wrapper.innerHTML = `
            <div class="thumbnail-placeholder" style="background-image: url('../images/${pageId}/thumbnails/page_${padNum}_thumb.webp')"></div>
            <div id="osd-page-${i}" class="osd-canvas"></div>
            <div class="click-layer"></div>
        `;

        container.appendChild(wrapper);

        // 비디오 옵저버에 등록
        videoObserver.observe(wrapper);

        // 클릭 이벤트 등록 
        wrapper.querySelector('.click-layer').addEventListener('click', () => {
            if (linkData && linkData.default) {
                const urlPage = linkData.default.find(({ page }) => page == i);
                if (urlPage) {
                    location.href = urlPage.url;
                }
            }
        });
    }

    function initOSD(entry) {
        const wrapper = entry.target;
        const pageNum = wrapper.dataset.pageNum;
        const padNum = wrapper.dataset.padNum;

        if (viewers[pageNum]) return;

        const viewer = OpenSeadragon({
            id: `osd-page-${pageNum}`,
            prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
            tileSources: {
                width: config.imageWidth,
                height: config.imageHeight,
                tileSize: config.tileSize,
                tileOverlap: 0,
                getTileUrl: (level, x, y) => {
                    const columns = Math.ceil(config.imageWidth / config.tileSize);
                    return `../images/${pageId}/tiles/page_${padNum}/tile_${(y * columns) + x}.webp`;
                }
            },

            // 제스처 설정
            mouseNavEnabled: false,
            showNavigationControl: false,
            gestureSettingsTouch: {
                dragToPan: false,
                pinchToZoom: false,
                clickToZoom: false,
                dblClickToZoom: false
            },
            gestureSettingsMouse: {
                dragToPan: false,
                scrollToZoom: false,
                clickToZoom: false,
                dblClickToZoom: false
            },

            defaultZoomLevel: 0,
            minZoomLevel: 0,
            maxZoomLevel: 4,
            visibilityRatio: 1.0,
            homeFillsViewer: true,

            // 터치 이벤트가 부모 스크롤 컨테이너로 전달되도록 허용
            stopTouchPropagation: false
        });

        viewers[pageNum] = viewer;

        viewer.addHandler('open', () => {
            if (viewer.innerTracker) {
                // 휠 핸들러를 제거하면 마우스 환경에서도 브라우저 줌/스크롤이 우선됩니다.
                viewer.innerTracker.scrollHandler = null;
            }
            wrapper.classList.add('loaded');
            // 로딩 즉시 가장 완벽한 비율로 정렬
            viewer.viewport.goHome(true);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const pageNum = entry.target.dataset.pageNum;
            if (entry.isIntersecting) {
                initOSD(entry);
            } else {
                if (viewers[pageNum]) {
                    viewers[pageNum].destroy();
                    delete viewers[pageNum];
                    entry.target.querySelector('.osd-canvas').innerHTML = "";
                    entry.target.classList.remove('loaded');
                }
            }
        });
    }, { rootMargin: '200px' });

    document.querySelectorAll('.page-wrapper').forEach(p => observer.observe(p));
}

init();
