let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;

let qs = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(190, 210, 250);

    push();
    translate(0, yyy);

    for (let item of qs) {
        item.update();
        item.draw();
    }

    pop();
};

windowResized=()=>{
    // resizeCanvas(windowWidth, windowHeight);
}

let yyy = 0;

const init = () => {
    qs = [];
    const count = 25;
    const area = min(width, height) * 0.75;
    const marginW = width - area;
    const marginH = height - area;
    let size = createVector(area, (area / count) * 4);
    for (let iy = count - 1; iy >= 0; iy--) {
        const x = width / 2;
        const y = marginH / 2 + size.y * iy + size.y / 2;
        const stepY = y * 0.25;
        qs.push(new Q(
            createVector(x, stepY),
            size
        ));
        if (iy === count - 1) {
            const actualHeight = (marginH / 2 + stepY);
            yyy = height / 2 - actualHeight / 2;
        }
    }
};

const getTime = (delay) => {
    const speed = 2 * 2;
    return ((currentTime[0] + delay) * speed) % 360;
};

const createImage = (canvas, fileName, index) => {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    let indexText = index;
    if (index < 10) {
        indexText = `000${index}`;
    } else if (index < 100) {
        indexText = `00${index}`;
    } else if (index < 1000) {
        indexText = `0${index}`;
    }
    link.href = image;
    link.download = `${fileName}_${indexText}.png`;
    link.click();
};

const generateImage = () => {
    draw();
    createImage(canvas, "img_1", imageIndex);

    if (currentTime[0] !== 0 && currentTime[0] > 359) {
        console.log("fin");
        return;
    }

    currentTime[0] += span;
    setTimeout(() => {
        imageIndex++;
        draw();
        generateImage();
    }, timeoutSpan);
};

const generateImageButton = document.getElementById("generateImageButton");
if (showGenerateImageButton) {
    generateImageButton.addEventListener("click", () => {
        currentTime[0] = 0;
        isImageGenerationMode = true;
        generateImage();
    });
} else {
    generateImageButton.remove();
}

class Q {
    constructor(pos, size) {
        this.graphics = createGraphics(size.x, size.y);
        this.pos = pos;
        this.size = size;
        this.offsetY = 0;
        this.fillColor = color(random(60, 255), 90, 150);
        this.delay = random(24);
    }

    update() {
        this.offsetY = map(sin(radians(getTime(this.delay))) * -1, -1, 1, 1, 0.2) * this.size.y / 2;
    }

    draw() {
        this.graphics.clear();
        this.graphics.fill(this.fillColor);
        this.graphics.strokeWeight(2);
        this.graphics.push();
        this.graphics.translate(this.size.x / 2, this.size.y / 2);
        const m = 10;
        this.graphics.quad(
            -this.size.x / 2 + m, this.offsetY,
            this.size.x / 2 - m, this.offsetY,
            this.size.x / 3 - m, 0,
            -this.size.x / 3 + m, 0
        );
        image(this.graphics, this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2);
        this.graphics.pop();
    }
}