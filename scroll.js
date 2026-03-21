const container = document.getElementById('scroll-container');
const viewers = {};

const config = {
    totalPages: 80,
    imageWidth: 1024,
    imageHeight: 1256,
    tileSize: 512,
    basePath: "../images/202603"
};


async function init() {
    let linkData = [];
    const page = location.pathname.split('/').pop();
    const pageId = page.replace(/\.html(\.js)?$/, '');
    if(pageId) linkData = await import(`./link/${pageId}.js`);

    for (let i = 1; i <= config.totalPages; i++) {
    const padNum = String(i).padStart(3, '0');
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.pageNum = i;
    wrapper.dataset.padNum = padNum;

    // [이전 답변의 레이어 구조 적용]
    wrapper.innerHTML = `
        <div class="thumbnail-placeholder" style="background-image: url('${config.basePath}/thumbnails/page_${padNum}_thumb.webp')"></div>
        <div id="osd-page-${i}" class="osd-canvas"></div>
        <div class="click-layer"></div>
    `;

    // 3. 이제 container가 null이 아니므로 에러 없이 추가됩니다
    container.appendChild(wrapper);

    // 클릭 이벤트 등록 
    wrapper.querySelector('.click-layer').addEventListener('click', () => {
        const urlPage = linkData.default.find(({page}) => page == i);

        if(urlPage) {
            location.href = urlPage.url;
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
                    return `${config.basePath}/tiles/page_${padNum}/tile_${(y * columns) + x}.webp`;
                }
            },
            
            // 제스처 설정

        
            /*
            gestureSettingsTouch: { clickToZoom: false, dblClickToZoom: false, pinchToZoom: true, scrollToZoom: false },
            gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: false, scrollToZoom: true },
            */
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
            //constrainDuringPan: true,
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

