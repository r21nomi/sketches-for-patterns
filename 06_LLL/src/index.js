let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;

let ls = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    strokeCap(PROJECT);
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 12;
    drawingContext.shadowBlur = 2;
    drawingContext.shadowColor = color(255, 200, 160);

    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(255, 230, 190);

    for (const item of ls) {
        item.draw();
    }
};

windowResized=()=>{
    //resizeCanvas(windowWidth, windowHeight);
}

const init = () => {
    const tileCount = 20;
    for (let gridY = 0; gridY < tileCount; gridY++) {
        for (let gridX = 0; gridX < tileCount; gridX++) {
            let posX = width / tileCount * gridX;
            let posY = height / tileCount * gridY;
            ls.push(new L(posX, posY, width / tileCount, height / tileCount));
        }
    }
}

class L {
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);
        this.dir = parseInt(random(0, 2));
        this.weight = 6;
        this.color = color(35, 0, random(50, 255));
        this.speedOffset = parseInt(random(10, 200));
    }

    draw() {
        strokeWeight(this.weight);
        stroke(this.color);
        let t = (currentTime[0] + this.speedOffset) * 0.03;
        let o = map(sin(t + sin(t + sin(t))), -1, 1, 0.1, 1);
        if (this.dir == 0) {
            line(this.pos.x, this.pos.y, this.pos.x + this.size.x * o, this.pos.y + this.size.y * o);
        } else {
            line(
                this.pos.x,
                this.pos.y + this.size.y,
                this.pos.x + this.size.x * o,
                this.pos.y + this.size.y * (1 - o)
            );
        }
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

    if (currentTime[0] !== 0 && currentTime[0] > 500) {
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