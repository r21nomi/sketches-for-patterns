/**
 * Reference
 * https://openprocessing.org/sketch/1171341
 */

let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 0.015;
let timeoutSpan = 100;

let colors = ["#ff2233", "#222", "#1166aa", "#33aaff", "#fff"];
let tiles = [];
let s;

const init = () => {
    let n = 8;
    s = width / n;
    tiles = [];

    for (let x = 0; x < width; x += s) {
        for (let y = 0; y < height; y += s) {
            let num = floor(random(1, 4));
            // num = 2;
            tiles.push(new Tile(num, createGraphics(s, s), createVector(x, y)));
        }
    }
};

setup=()=>{
    createCanvas(windowWidth, windowHeight);
    // createCanvas(1920, 1080);
    init();
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] += span;
    }
    background(230, 230, 230);

    for (let item of tiles) {
        item.update();
        item.draw();
    }
};

const ease_in_out_cubic = (x) => {
    let t=x; let b=0.; let c=1.; let d=1.;
    if ((t/=d/2.) < 1.) return c/2.*t*t*t + b;
    return c/2.*((t-=2.)*t*t + 2.) + b;
};

class Tile {
    constructor(_type, _graphic, _pos) {
        this.type = _type;
        this.graphic = _graphic;
        this.pos = _pos;
        this.offset1 = 0;
        this.offset2 = 0;
        this.rand = random(0, 360);
    }

    update() {
        const m = currentTime[0];
        let t = ease_in_out_cubic(m % 1) * 360;
        this.offset1 = sin(t * PI / 180) * 8.5;
        this.offset2 = map(sin((t + this.rand) * PI / 180), -1, 1, 0.2, 0.4);
    }

    draw() {
        let lSize = s / 1.2 + this.offset1;
        let sSize = s / 2 + this.offset1;
        let mSize = (s * 2 - lSize * 2) / 2;
        let mSize2 = (s * 2 - sSize * 2) / 2;
        let mSize3 = mSize2 / 2 - mSize / 2;
        let mPos = mSize / 2 + mSize3 / 2;

        switch (this.type) {
            case 1:
                this.graphic.stroke(colors[1]);
                this.graphic.strokeWeight(2);
                this.graphic.background(colors[0]);
                this.graphic.fill(colors[2]);
                this.graphic.circle(s / 2, 0, lSize);
                this.graphic.circle(s, s / 2, lSize);
                this.graphic.circle(0, s / 2, lSize);
                this.graphic.circle(0, s, mSize2);
                this.graphic.circle(s, s, mSize2);

                this.graphic.fill(colors[4]);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2);

                this.graphic.fill(colors[0]);
                this.graphic.circle(s / 2, 0, sSize);
                this.graphic.circle(s, s / 2, sSize);
                this.graphic.circle(0, s / 2, sSize);
                this.graphic.circle(0, s, mSize);
                this.graphic.circle(s, s, mSize);
                break;
            case 2:
                this.graphic.stroke(colors[1]);
                this.graphic.strokeWeight(2);
                this.graphic.background(colors[0]);
                this.graphic.fill(colors[2]);
                this.graphic.circle(mPos, 0, mSize3);
                this.graphic.circle(0, s / 2, lSize);
                this.graphic.circle(s, 0, mSize2);
                this.graphic.circle(s, s, mSize2);

                this.graphic.fill(colors[0]);
                this.graphic.circle(s, 0, mSize);
                this.graphic.circle(s, s, mSize);

                this.graphic.fill(colors[2]);
                this.graphic.circle(0, s, mSize2);
                this.graphic.fill(colors[0]);
                this.graphic.circle(0, s, mSize);

                this.graphic.fill(colors[3]);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 1.2);
                this.graphic.fill(colors[0]);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 0.3);
                this.graphic.circle(0, s / 2, sSize);
                break;
            case 3:
                this.graphic.stroke(colors[1]);
                this.graphic.strokeWeight(2);
                this.graphic.background(colors[0]);
                this.graphic.fill(colors[2]);
                this.graphic.circle(s / 2, 0, lSize);
                this.graphic.circle(s, s, mSize2);
                this.graphic.circle(0, s / 2, lSize);
                this.graphic.circle(mPos, s, mSize3);
                this.graphic.circle(s, s, mSize2);
                this.graphic.circle(s, 0, mSize2);

                this.graphic.fill(colors[0]);
                this.graphic.circle(s / 2, 0, sSize);
                this.graphic.circle(s, 0, mSize);
                this.graphic.circle(0, s / 2, sSize);
                this.graphic.circle(s, s, mSize);

                this.graphic.fill(colors[3]);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 0.55);
                this.graphic.noFill();
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 0.75);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 0.95);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 1.15);
                this.graphic.circle(s / 2, s / 2, lSize * this.offset2 * 1.35);
                break;
        }
        push();
        translate(this.pos.x, this.pos.y);
        image(this.graphic, 0, 0);
        pop();
    }
}

windowResized=()=>{
    // init();
    // resizeCanvas(windowWidth, windowHeight);
}

const getTime = () => {
    const speed = 1;
    return (currentTime[0] * speed) % 360;
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

    if (currentTime[0] !== 0 && currentTime[0] > 1) {
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