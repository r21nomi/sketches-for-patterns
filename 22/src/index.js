const NUM_FRAMES = 100;
const SPEED_OFFSET = 0.5;

let normalizedFrame = [0];
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = true;
const span = 1;
let timeoutSpan = 100;
let isDebug = false;
let items = [];
let colors;
let bgGraphic;

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    colors = getHexColors(0);
    bgGraphic = createGraphics(windowWidth, windowHeight);
    for (let i = 0; i < 8000; i++) {
        bgGraphic.fill(`#000`);
        bgGraphic.point(width * random(), height * random());
    }

    const count = 4;
    const size = min(width, height) / count;
    for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
            items.push(
                new Wave(
                    createVector(x + size / 2, y + size / 2),
                    createVector(size, size),
                    random(0.1, 0.5),
                    random(0.5, 2),
                    floor(random(8, 20)),
                    0.3,
                    createVector(20, 20),
                    random(0, 0),
                    colors[1],
                    colors[2]
                )
            );
        }
    }
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    normalizedFrame[0] = (SPEED_OFFSET * (currentTime[0] - 1) % NUM_FRAMES) / NUM_FRAMES;

    background(colors[0]);
    image(bgGraphic, 0, 0);

    for (let item of items) {
        item.draw();
    }
};

class Wave {
    constructor(
        _pos,
        _size,
        _speedOffset = 0.05,
        _frequency = 2,
        _strokeWeight = 4,
        _heightScale = 1,
        _margins = createVector(20, 20),
        _startOffset = 0,
        _color1,
        _color2
    ) {
        this.pos = _pos;
        this.size = _size;
        this.speedOffset = _speedOffset;
        this.margins = _margins;
        this.frequency = _frequency;
        this._heightScale = _heightScale;
        this._strokeWeight = _strokeWeight;
        this.startOffset = _startOffset;
        this._color1 = _color1;
        this._color2 = _color2;
    }
    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        if (isDebug) {
            rect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        }

        const time = getFrame();

        strokeCap(ROUND);
        beginShape();
        const len = this.size.x;
        const circles = [];
        for (let i = 0; i < len; i += 2) {
            stroke(this._color1);
            noFill();
            const t = map(i, 0, len, 0, TAU * this.frequency);
            const x = map(i, 0, len, -this.size.x / 2 + this.margins.x, this.size.x / 2 - this.margins.x);
            const y = (this.size.y * 0.5 * this._heightScale - this.margins.y) * sin(t + time + this.startOffset);
            strokeWeight(this._strokeWeight);
            vertex(x, y);

            if (i % 20 === 0) {
                const _size = 10;
                const _height = this._strokeWeight + this._strokeWeight * _size * 0.06;
                let _t = t + time + this.startOffset;
                const moveYOffset = sin(_t) * _height;
                let sizeOffset = sin(_t * 0.5);
                // To make the visual of overlapping point natural.
                if (abs(sizeOffset) < 0.2) {
                    sizeOffset = 0;
                }
                circles.push({
                    x: x - 1,
                    y: y + moveYOffset,
                    size: sizeOffset * _size
                });
            }
        }
        endShape();
        for (let c of circles) {
            noStroke();
            fill(this._color2);
            circle(c.x, c.y, c.size);
        }
        pop();
    }
}

// windowResized=()=>{
//     resizeCanvas(windowWidth, windowHeight);
// }

const getHexColors = (colorId = 0, shouldShuffle = true) => {
    const colorPalettes = [
        "https://coolors.co/ff6700-ebebeb-c0c0c0-3a6ea5-004e98"
    ];
    const _colors = colorPalettes[colorId % colorPalettes.length].split("/")[3].split("-").map(c => `#${c}`);
    return shouldShuffle ? shuffle(_colors) : _colors;
};

const cross = (v1, v2) => {
    return createVector(v1.x * v2.y - v1.y * v2.x);
};

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const getFrame = () => {
    return TAU * normalizedFrame[0];
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