let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;

let vz = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(250, 65, 80);

    for (let item of vz) {
        item.update();
        item.draw();
    }
};

windowResized=()=>{
    // resizeCanvas(windowWidth, windowHeight);
}

const init = () => {
    const count = 5;
    const area = min(width, height) * 0.75;
    const mw = width - area;
    const mh = height - area;
    let size = area / count;
    for (let ix = 0; ix < count; ix++) {
        for (let iy = 0; iy < count; iy++) {
            const x = mw / 2 + size * ix  + size / 2;
            const y = mh / 2 + size * iy  + size / 2;
            vz.push(
                new T(
                    createVector(x, y),
                    createVector(size, size),
                    floor(random(1, 8)),
                    4
                ));
        }
    }
};

const getTime = () => {
    const speed = 1.0;
    return (currentTime[0] * speed) % 360;
};

const getTime2 = (delay) => {
    const speed = 2.0;
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

class T {
    constructor(pos, size, count, padding) {
        this.graphics = createGraphics(size.x, size.y);
        this.pos = pos;
        this.size = size;
        this.padding = padding;
        this.count = count;
        this.boxColor = color(255, 210, 0);
        const seed = floor(random(7));
        if (seed % 3 === 0) {
            this.boxColor = color(0, 80, 220);
        } else if (seed % 5 === 0) {
            this.boxColor = color(250, 250, 250);
        }
        this.rand = random(0, 500);
    }

    update() {
        this.boxColor.setGreen(map(sin(radians(getTime2(this.rand))), -1, 1, 120, 255));
    }

    draw() {
        this.graphics.clear();
        this.graphics.push();
        this.graphics.fill(this.boxColor);
        this.graphics.strokeWeight(2);
        let sx = this.size.x / this.count;
        let sy = this.size.y / this.count;
        for (let ix = 0; ix < this.count; ix++) {
            for (let iy = 0; iy < this.count; iy++) {
                const x = sx * ix;// + sx / 2;
                const y = sy * iy;// + sy / 2;
                this.graphics.rect(
                    x + this.padding,
                    y + this.padding,
                    sx - this.padding * 2,
                    sy - this.padding * 2
                );
            }
        }
        image(this.graphics, this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2);
        this.graphics.pop();
    }
}