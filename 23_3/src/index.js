const NUM_FRAMES = 100;
const SPEED_OFFSET = 1.0;

let normalizedFrame = [0];
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;
let isDebug = false;
let items = [], movers = [];
let colors;
let bgGraphic;
let characters = "#(- $\_+*],{%^.?/'";

let gridNumX = 0, gridNumY = 0;
let gridSize;
let bgColor, contentsColor;
let isSP;

const init = () => {
    isSP = min(width, height) < 700;
    bgGraphic = createGraphics(windowWidth, windowHeight);
    bgColor = color(colors[0]);
    contentsColor = getContentsColor();

    const noiseNum = isSP ? 500 : 8000;
    for (let i = 0; i < noiseNum; i++) {
        bgGraphic.stroke(contentsColor);
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

    const mSize = min(width, height) * 0.3;
    const mCount = 6;
    for (let i = 0; i < mCount; i++) {
        const mSpeed = isSP ? floor(random(1, 4)) : floor(random(4, 10));
        movers.push(
            new Mover(
                createVector(
                    map(random(), 0, 1, mSize, width - mSize),
                    map(random(), 0, 1, mSize, height - mSize)
                ),
                createVector(mSize, mSize),
                createVector(
                    mSpeed * (floor(random() * 2) === 0 ? 1 : -1),
                    mSpeed * (floor(random() * 2) === 0 ? 1 : -1)
                )
            )
        );
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

    background(bgColor);
    image(bgGraphic, 0, 0);

    for (let item of movers) {
        item.update();
    }

    push();
    translate(-(gridNumX * gridSize - width) / 2, -(gridNumY * gridSize - height) / 2);

    const m = max(width, height);
    const hypotenuse = sqrt(pow(m / 2, 2) + pow(m / 2, 2));

    let i = 0;
    for (let item of items) {
        const pos = item.getPos();
        let dd = -1;
        for (let k = 0; k < movers.length; k++) {
            const m = movers[k];
            if (m.isInclude(pos)) {
                const target = m.pos;
                const d = dist(pos.x, pos.y, target.x, target.y);
                const frequency = isSP ? 1.1 : 1.6;
                dd = floor(map(d, hypotenuse, 0, 0, characters.length * frequency) + k + normalizedFrame[0] * characters.length) % characters.length;
            }
        }
        if (dd >= characters.length) {
            dd = characters.length - 1;
        }
        item.update(characters[dd]);
        item.draw();
        i++;
    }

    pop();
};

const randomChar = (seed) => {
    let c = characters;
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

        noStroke();
        fill(contentsColor)
        textSize(min(this.size.x, this.size.y) * 0.6);
        if (this.char) {
            // noStroke();
            // fill(`#000`);
            textSize(min(this.size.x, this.size.y) * 0.8);
            stroke(contentsColor);
        }
        text(this.char || randomChar(this.seed), 0, 0);
        pop();
    }
}

class Mover {
    constructor(_pos, _size, _speed) {
        this.pos = _pos;
        this.size = _size;
        this.speed = _speed;
    }
    update() {
        if ((this.pos.x - this.size.x / 2) < 0 || (this.pos.x + this.size.x / 2) > width) {
            this.speed.x *= -1;
        }
        if ((this.pos.y - this.size.y / 2) < 0 || (this.pos.y + this.size.y / 2) > height) {
            this.speed.y *= -1;
        }
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;

        // ellipse(this.pos.x, this.pos.y, this.size.x);
    }
    isInclude(p) {
        return dist(p.x, p.y, this.pos.x, this.pos.y) < min(this.size.x, this.size.y) / 2;
    }
}

// windowResized=()=>{
//     resizeCanvas(windowWidth, windowHeight);
// }

const getHexColors = (colorId = 0, shouldShuffle = true) => {
    const colorPalettes = [
        "https://coolors.co/dbc2cf-9fa2b2-3c7a89-2e4756-16262e"
    ];
    const _colors = colorPalettes[colorId % colorPalettes.length].split("/")[3].split("-").map(c => `#${c}`);
    return shouldShuffle ? shuffle(_colors) : _colors;
};

/**
 * https://stackoverflow.com/a/3943023
 */
const getContentsColor = () => {
    const c = bgColor.levels;
    if (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114 > 186) {
        return `#000000`;
    } else {
        return `#ffffff`;
    }
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
    return radians(360 * normalizedFrame[0]);
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

    if (currentTime[0] === NUM_FRAMES / SPEED_OFFSET * 10) {
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