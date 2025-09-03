class Controls {
  constructor() {
    this.left = false;
    this.right = false;
    this.engine = false;
    this.throttle = 0;

    // desktop controls
    const engineCheckbox = document.getElementById("engine");
    const throttleSlider = document.getElementById("throttle");
    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    if (engineCheckbox) {
      engineCheckbox.addEventListener("change", e => {
        this.engine = e.target.checked;
      });
    }
    if (throttleSlider) {
      throttleSlider.addEventListener("input", e => {
        this.throttle = parseInt(e.target.value);
      });
    }
    if (btnLeft) {
      btnLeft.addEventListener("mousedown", () => this.left = true);
      btnLeft.addEventListener("mouseup", () => this.left = false);
    }
    if (btnRight) {
      btnRight.addEventListener("mousedown", () => this.right = true);
      btnRight.addEventListener("mouseup", () => this.right = false);
    }

    // keyboard support
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") this.left = true;
      if (e.key === "ArrowRight") this.right = true;
      if (e.key === " ") this.engine = true;
    });
    window.addEventListener("keyup", e => {
      if (e.key === "ArrowLeft") this.left = false;
      if (e.key === "ArrowRight") this.right = false;
      if (e.key === " ") this.engine = false;
    });
  }
}
