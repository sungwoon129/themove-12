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
