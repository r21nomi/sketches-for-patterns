const NUM_FRAMES = 100;
const SPEED_OFFSET = 0.5;

let normalizedFrame = [0];
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;
let isDebug = false;
let items = [];
let colors;
let bgGraphic;
let characters = "コンピューターは最高の画家";

let gridNumX = 0, gridNumY = 0;
let gridSize;

const init = () => {
    const isSP = min(width, height) < 700;
    bgGraphic = createGraphics(windowWidth, windowHeight);

    const noiseNum = isSP ? 500 : 8000;
    for (let i = 0; i < noiseNum; i++) {
        bgGraphic.stroke(`#000`);
        bgGraphic.point(width * random(), height * random());
    }

    let num = 40;
    if (isSP) {
        num = 20;
    }
    gridSize = min(width, height) / num;
    for (let x = 0; x < width; x += gridSize) {
        gridNumX++;
        for (let y = 0; y < height; y += gridSize) {
            if (x === 0) {
                gridNumY++;
            }
            items.push(
                new Char(
                    createVector(x + gridSize / 2, y + gridSize / 2),
                    createVector(gridSize, gridSize),
                    colors
                )
            );
        }
    }

    textAlign(CENTER, CENTER);
};

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    colors = getHexColors(0);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    normalizedFrame[0] = (SPEED_OFFSET * (currentTime[0] - 1) % NUM_FRAMES) / NUM_FRAMES;

    background(colors[0]);
    image(bgGraphic, 0, 0);

    push();
    translate(-(gridNumX * gridSize - width) / 2, -(gridNumY * gridSize - height) / 2);

    const m = max(width, height);
    const hypotenuse = sqrt(pow(m / 2, 2) + pow(m / 2, 2));

    const center = createVector(width / 2, height / 2);
    let i = 0;
    for (let item of items) {
        const pos = item.getPos();
        const d = dist(pos.x, pos.y, center.x, center.y);
        let dd = abs(floor((map(d, hypotenuse, 0, 0, characters.length)) + normalizedFrame[0] * characters.length)) % characters.length;
        dd = floor(
            (sin(pos.y * 0.5 + cos(pos.x * 0.01) + getFrameAsTAU())) * characters.length + pos.y % characters.length
        );
        item.update(characters[dd]);
        item.draw();
        i++;
    }

    pop();
};

const randomChar = (seed) => {
    const c = ';l?></.*!"^%#&@';
    return c.charAt(floor(noise(floor(frameCount * 0.1 + seed * 100)) * c.length));
};

class Char {
    constructor(
        _pos,
        _size,
        _colors
    ) {
        this.pos = _pos;
        this.size = _size;
        this.char = "a";
        this.colors = _colors;
        this.seed = random();
    }
    getPos() {
        return createVector(this.pos.x, this.pos.y);
    }
    update(char) {
        this.char = char;
    }
    draw() {
        push();
        translate(this.pos.x, this.pos.y);

        if (isDebug) {
            stroke(`#000`);
            rect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        }

        noFill();
        stroke(`#fff`);
        textSize(min(this.size.x, this.size.y) * 0.8);
        if (this.char) {
            noStroke();
            fill(`#000`);
        }
        text(this.char || randomChar(this.seed), 0, 0);
        pop();
    }
}

// windowResized=()=>{
//     resizeCanvas(windowWidth, windowHeight);
// }

const getHexColors = (colorId = 0, shouldShuffle = true) => {
    const colorPalettes = [
        "https://coolors.co/757780-d2cca1-387780-dbd4d3-e83151"
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

const getFrameAsTAU = () => {
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