const NUM_FRAMES = 100;
const SPEED_OFFSET = 0.5;

let normalizedFrame = [0];
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;

let ls = [];
let bgColor;

const colorList = [
    "d7263d-02182b-0197f6-448fa3-68c5db"
];

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    normalizedFrame[0] = (SPEED_OFFSET * (currentTime[0] - 1) % NUM_FRAMES) / NUM_FRAMES;

    background(bgColor);

    for (let item of ls) {
        push();
        item.update();
        item.draw();
        pop();
    }
};

// windowResized=()=>{
//     init();
//     resizeCanvas(windowWidth, windowHeight);
// }

const init = () => {
    frameRate(60);
    rectMode(CENTER);

    ls = [];
    const area = min(width, height) * 0.75;
    const count = floor(max(3, area / 100));
    const mw = width - area;
    const mh = height - area;
    let size = area / count;
    const _color = shuffle(getColor(0));
    bgColor = _color[1];
    for (let ix = 0; ix < count; ix++) {
        for (let iy = 0; iy < count; iy++) {
            const x = mw / 2 + size * ix  + size / 2;
            const y = mh / 2 + size * iy  + size / 2;
            ls.push(new L(
              createVector(x, y),
              createVector(size, size),
              random(1, 500),
              parseInt(random(2, 5)),
              _color[floor(random(2, 4))],
              _color[0],
              _color[4]
            ));
        }
    }
};

const getColor = (id) => {
    return colorList[id % colorList.length].split("-").map(c => `#${c}`);
};

const getTimeForP = () => {
    const speed = 0.03;
    return (currentTime[0] * speed) % 360;
};

const getRadiansFromFrame = () => {
    return TWO_PI * normalizedFrame[0];
};

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

class L {
    constructor(pos, size, randomOffset, pointNum, fillColor, strokeColor, rectColor) {
        this.pos = pos;
        this.size = size;
        this.pSize = 14;
        this.ps = [];
        this.padding = 20;
        this.randomOffset = randomOffset;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.rectColor = rectColor;
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
        fill(this.rectColor);
        square(this.pos.x, this.pos.y, this.size.x - this.padding * 3.5);
        translate(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2);

        beginShape();
        for (let item of this.ps) {
            vertex(item.pos.x, item.pos.y);
        }
        noFill();
        endShape();

        let i = 0;
        for (let item of this.ps) {
            push();
            translate(item.pos.x, item.pos.y);
            rotate(radians(45));
            fill(this.fillColor);

            const sSize = this.pSize * 1.8;
            if (i % 2 === 0) {
                ellipse(0, 0, this.pSize, this.pSize);
                noFill();
                ellipse(0, 0, sSize, sSize);
            } else {
                square(0, 0, this.pSize);
                noFill();
                square(0, 0, sSize);
            }

            pop();
            i++;
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
        const fluidity = 0.7;
        let time = getRadiansFromFrame();
        let d = this.delay + this.delayOffset;
        this.pos.x = this.initialPos.x + this.size.x * smoothstep(-fluidity, fluidity, cos(time + d));
        this.pos.y = this.initialPos.y + this.size.y * smoothstep(-fluidity, fluidity, sin((time + d) * 2.0));
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

    if (currentTime[0] === NUM_FRAMES / SPEED_OFFSET) {
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
    generateImageButton.style.display = `block`;
    generateImageButton.addEventListener("click", () => {
        currentTime[0] = 0;
        isImageGenerationMode = true;
        generateImage();
    });
} else {
    generateImageButton.remove();
}