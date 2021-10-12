let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;

let ls = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(230, 230, 230);

    for (let item of ls) {
        push();
        item.update();
        item.draw();
        pop();
    }
};

windowResized=()=>{
    init();
    resizeCanvas(windowWidth, windowHeight);
}

const init = () => {
    rectMode(CENTER);

    ls = [];
    const area = min(width, height) * 0.75;
    const count = floor(max(3, area / 80));
    const mw = width - area;
    const mh = height - area;
    let size = area / count;
    for (let ix = 0; ix < count; ix++) {
        for (let iy = 0; iy < count; iy++) {
            const x = mw / 2 + size * ix  + size / 2;
            const y = mh / 2 + size * iy  + size / 2;
            ls.push(new L(
              createVector(x, y),
              createVector(size, size),
              random(1, 500),
              parseInt(random(2, 5)),
              color(random(220, 255), random(210, 255), 0),
              color(0, 30, 120)
            ));
        }
    }
};

const getTimeForP = () => {
    const speed = 0.035;
    return (currentTime[0] * speed) % 360;
};

class L {
    constructor(pos, size, randomOffset, pointNum, fillColor, strokeColor) {
        this.pos = pos;
        this.size = size;
        this.pSize = 10;
        this.ps = [];
        this.padding = 20;
        this.randomOffset = randomOffset;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        for (let i = 0; i < pointNum; i++) {
            this.ps.push(new P(
              createVector(this.padding, this.padding),
              createVector(size.x - this.padding * 2, size.y - this.padding *2),
              250 * i + randomOffset)
            );
        }
    }

    update() {
        for (let item of this.ps) {
            item.update(1);
        }
    }

    draw() {
        stroke(this.strokeColor);
        push();
        translate(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2);

        beginShape();
        for (let item of this.ps) {
            vertex(item.pos.x, item.pos.y);
        }
        noFill();
        endShape();

        fill(this.fillColor);
        for (let item of this.ps) {
            ellipse(item.pos.x, item.pos.y, this.pSize, this.pSize);
        }

        pop();
    }
}

class P {
    constructor(pos, size, delay) {
        this.initialPos = createVector(pos.x, pos.y);
        this.pos = createVector(0, 0);
        this.size = size;
        this.delayOffset = 0;
        this.delay = delay;
    }

    update(speed) {
        const fluidity = 0.5;
        let time = getTimeForP();
        let d = this.delay + this.delayOffset;
        this.pos.x = this.initialPos.x + this.size.x * smoothstep(-fluidity, fluidity, cos(time + d));
        this.pos.y = this.initialPos.y + this.size.y * smoothstep(-fluidity, fluidity, sin(time + d));
    }
}

const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t );
}

const clamp = (x, min, max) => {
    if (x < min) {
        x = min
    } else if (x > max) {
        x = max
    }
    return x
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