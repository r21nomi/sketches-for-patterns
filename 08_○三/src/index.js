let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;

let cs = [];
const cCount = 20;

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    const s = min(width, height);
    for (let i = 0; i < cCount; i++) {
        createC();
    }
};

const createC = () => {
    const s = min(width, height);
    const size = random(s * 0.05, s * 0.16);
    const x = random(size, width - size);
    const y = random(size, height - size);
    let isOver = false;
    for (let item of cs) {
        if (dist(x, y, item.pos.x, item.pos.y) < size * 2) {
            isOver = true;
            break;
        }
    }
    if (!isOver) {
        cs.push(new C(x, y, size, color(20, 60, random(180, 235))));
        return;
    }
    createC();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount % 360;
    }
    background(`#fff`);

    for (let item of cs) {
        item.draw();
    }
};

windowResized=()=>{
    // resizeCanvas(windowWidth, windowHeight);
}

class C {
    constructor(x, y, size, _color) {
        this.drawArea = createVector(size * 1.2, size * 1.2);
        this.graphics = createGraphics(this.drawArea.x, this.drawArea.y);
        this.pos = createVector(x, y);
        this.size = size;
        this.color = _color;
        this.lineOffset = createVector(random(1, 6), 0);
        this.lineCount = parseInt(random(3, 7));
        this.lineWeight = parseInt(size * 0.1);
        this.lineDir = parseInt(random(0, 2)) || -1;
        this.graphics.drawingContext.shadowOffsetX = size * 0.1;
        this.graphics.drawingContext.shadowOffsetY = size * 0.1;
        this.graphics.drawingContext.shadowBlur = 2;
        this.graphics.drawingContext.shadowColor = color(`#33ff88`);
        this.rSeed = random();
    }

    draw() {
        // this.graphics.background(`#ffcc00`);
        this.graphics.fill(this.color);
        this.graphics.noStroke();
        push();
        translate(8 * sin(radians(currentTime[0] + this.rSeed * 500)), 0);
        this.graphics.ellipse(this.drawArea.x / 2, this.drawArea.y / 2, this.size, this.size);
        image(this.graphics, this.pos.x - this.drawArea.x / 2, this.pos.y - this.drawArea.y / 2);
        pop();

        stroke(`#ff1155`);
        strokeCap(PROJECT);

        const offsetX = this.lineOffset.x;
        for (let i = 0; i < this.lineCount; i++) {
            strokeWeight(this.lineWeight * rand(radians(floor(currentTime[0] * (i + 1) * this.rSeed))));
            const seed = (noise(offsetX * i + radians(currentTime[0] * 0.01)) * 2 - 1) * 30;
            const offsetY = 0;
            let y = map(rand(50 * radians(floor(currentTime[0] * 0.3 + i))), 0, 1, this.pos.y - (this.size / 2 - offsetY), this.pos.y + (this.size / 2 - offsetY));
            const xw = this.size * 0.7;
            push();
            translate(this.size * 0.4 * this.lineDir, 0);
            line(
                this.pos.x - xw / 2 + seed,
                y,
                this.pos.x + xw / 2 + seed,
                y
            );
            pop();
        }
    }
}

const rand = (n) => {
    return (sin(n) * 43758.5453123) % 1 * 0.5 + 0.5;
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