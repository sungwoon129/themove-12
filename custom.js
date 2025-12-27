function MyViewer() { };
MyViewer.prototype = {
    current: 1,
    total: document.querySelectorAll(".center-img").length,
    load: function (dest) {

        if (this.unValid(dest)) return;
        document.getElementById(`page${dest}`).style.display = "block";
        this.updateIdx(dest);
    },
    off: function () {
        document.getElementById(`page${this.current}`).style.display = "none";
    },
    updateIdx: function (n) {
        document.getElementById("pageSelector").value = n;
        this.current = n;
    },
    next: function () {
        if (this.current < this.total) {
            this.off();
            this.load(++this.current);
        }                
    },
    prev: function () {
        if (this.current > 1) {
            this.off();
            this.load(--this.current);
        }
    },
    unValid: function (n) {
        if ((n > this.total) || n < 1) return false;
        return isNaN(n);
    }
}


// 모바일 스와이프 페이지 넘김
let startX = 0;
let endX = 0;

document.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
    endX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const distance = startX - endX;

    if (Math.abs(distance) < 60) return; // 너무 짧은 스와이프 무시

    if (distance > 0) {
        viewer.next();   // 왼쪽으로 밀면 다음 페이지
        rustle.play();
    } else {
        viewer.prev();   // 오른쪽으로 밀면 이전 페이지
        rustle.play();
    }
}


const viewer = new MyViewer();
const rustle = new Audio('audio/rustle.wav');

document.getElementById("pagelength").textContent = viewer.total;
viewer.load(1);

document.getElementById("next").addEventListener("click", function () {
    viewer.next();
    rustle.play();
});
document.getElementById("prev").addEventListener("click", function () {
    viewer.prev();
    rustle.play();
});
document.getElementById("start").addEventListener("click", function () {
    viewer.off()
    viewer.load(1);
    rustle.play();
});
document.getElementById("end").addEventListener("click", function () {
    viewer.off()
    viewer.load(viewer.total);
    rustle.play();
});
document.getElementById("pageSelector").addEventListener("blur", function (e) {
    if (viewer.unValid(e.target.value)) return;
    viewer.off()
    viewer.load(e.target.value);
    rustle.play();
})
