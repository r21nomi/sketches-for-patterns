let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;

let cl = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    init();
    drawingContext.shadowOffsetX = 8;
    drawingContext.shadowOffsetY = 8;
    drawingContext.shadowBlur = 2;
    drawingContext.shadowColor = color(25, 120, 150);
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount % 360;
    }
    background(230, 210, 190);
    noStroke();

    push();
    const m = min(width, height);
    const hypotenuse = sqrt(pow(m / 2, 2) + pow(m / 2, 2));
    if (m === width){
        translate(0, height / 2 - m / 2);
    } else {
        translate(width / 2 - m / 2, 0);
    }
    const center = createVector(m / 2, m / 2);
    for (let item of cl) {
        const pos = item.getPos();
        const d = dist(pos.x, pos.y, center.x, center.y);
        let dd = map(d, 0, hypotenuse, 0, 16.0);
        const sizeOffset = sin(radians(currentTime[0])*2 + dd) * 0.5 + 0.5;
        let shadowOffset = map(d, 0, hypotenuse, 8, 12) * sizeOffset;
        drawingContext.shadowOffsetX = shadowOffset;
        drawingContext.shadowOffsetY = shadowOffset;
        item.update(sizeOffset);
        item.draw();
    }
    pop();
};

windowResized=()=>{
    resizeCanvas(windowWidth, windowHeight);
}

const init = () => {
    const count = 18;
    for (let gridX = 0; gridX < count; gridX++) {
        for (let gridY = 0; gridY < count; gridY++) {
            let size = min(width, height) / count;
            let posX = size * gridX;
            let posY = size * gridY;
            cl.push(new C(posX, posY, size));
        }
    }
}

class C {
    constructor(x, y, size) {
        this.pos = createVector(x, y);
        this.gridSize = size;
        this.size = size;
        this.sizeOffset = 0.1;
        this.color = color(random(50, 255), 40, 50);
    }

    getPos() {
        return createVector(this.pos.x + this.gridSize / 2, this.pos.y + this.gridSize / 2)
    }

    update(_offset) {
        this.sizeOffset = _offset;
    }

    draw() {
        push();
        translate(this.gridSize / 2, this.gridSize / 2);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size * this.sizeOffset, this.size * this.sizeOffset);
        pop();
    }
}

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