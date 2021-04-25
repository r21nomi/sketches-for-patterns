let lines = [];
let lines2 = [];
const lWidth = 200;

let ll, cc, vv, bb;
let bgColor;

setup=()=>{
    bgColor = color(`#ff6655`);
    bgColor = color(`#eeeeff`);
    createCanvas(windowWidth, windowHeight);
    strokeCap(PROJECT);
    frameRate(60);

    ll = new LL(lWidth, bgColor, `#6633aa`);
    cc = new CC(lWidth, bgColor, `#ffcc22`);
    vv = new VV(lWidth, bgColor, `#ee3355`);
    bb = new BB(lWidth, bgColor, `#3366ff`);
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(bgColor);

    const offsetX = 10;
    const count = 4;

    push();
    translate(-lWidth / 2, lWidth / 2)
    translate(width / 2 - (lWidth * count + offsetX * (count - 1)) / 2, height / 2 - lWidth / 2)

    // LL
    push();
    translate(lWidth, 0);
    ll.draw();
    pop();

    // CC
    push();
    translate(lWidth * 2 + offsetX, 0);
    cc.draw();
    pop();

    // VV
    push();
    translate(lWidth * 3 + offsetX * 2, 0);
    vv.draw();
    pop();

    // BB
    push();
    translate(lWidth * 4 + offsetX * 3, 0);
    bb.draw();
    pop();

    pop();
};

windowResized=()=>{
    // resizeCanvas(windowWidth, windowHeight);
}

class LL {
    constructor(_width, _bgColor, _strokeColor) {
        this._width = _width;
        this.graphics = createGraphics(_width, _width);
        this.bgColor = _bgColor;
        this.lines = [];

        const totalNum = 5;
        const weight = 26;
        for (let i = 0; i < totalNum; i++) {
            this.lines.push(new L(this.graphics, _width, weight, i, totalNum, _strokeColor));
        }
    }
    draw() {
        push();
        translate(-this._width / 2, -this._width / 2);

        this.graphics.background(this.bgColor);
        this.lines.forEach((l) => {
            l.draw();
        });
        image(this.graphics, 0, 0);

        pop();
    }
}

class L {
    constructor(_graphics, _width, _strokeWeight, index, totalNum, _color) {
        this.graphics = _graphics;
        this.width = _width;
        this.strokeWeight = _strokeWeight;
        this.index = index;
        this.totalNum = totalNum;
        this.color = _color;
    }

    draw() {
        this.graphics.push();
        this.graphics.translate(this.width + this.strokeWeight, -this.strokeWeight);

        this.graphics.stroke(this.color);
        this.graphics.strokeWeight(this.strokeWeight);
        this.graphics.noFill();

        this.graphics.beginShape();
        const step = 10;
        const speed = 0.1;
        let delay = step / this.totalNum * (this.index + 1);
        let nx = ((currentTime * speed + delay) % step) / step;
        this.graphics.vertex((-this.width - this.strokeWeight * 2) * nx, -this.strokeWeight);  // left top
        this.graphics.vertex((-this.width - this.strokeWeight * 2) * nx, (this.width + this.strokeWeight * 2) * nx);  // left bottom
        this.graphics.vertex(0, (this.width + this.strokeWeight * 2) * nx);  // right bottom
        this.graphics.endShape();

        this.graphics.pop();
    }
}

class CC {
    constructor(_width, _bgColor, _strokeColor) {
        this._width = _width;
        this.graphics = createGraphics(_width, _width);
        this.bgColor = _bgColor;
        this.lines = [];

        const totalNum = 4;
        const weight = 20;
        for (let i = 0; i < totalNum; i++) {
            this.lines.push(new C(this.graphics, _width, weight, i, totalNum, _strokeColor));
        }
    }
    draw() {
        push();
        translate(-this._width / 2, -this._width / 2);

        this.graphics.background(this.bgColor);
        this.lines.forEach((l) => {
            l.draw();
        });
        image(this.graphics, 0, 0);

        pop();
    }
}

class C {
    constructor(_graphics, _width, _strokeWeight, index, totalNum, _color) {
        this.graphics = _graphics;
        this.width = _width;
        this.strokeWeight = _strokeWeight;
        this.index = index;
        this.totalNum = totalNum;
        this.color = _color;
    }

    draw() {
        this.graphics.push();
        this.graphics.translate(this.width / 2, this.width / 2);

        this.graphics.stroke(this.color);
        this.graphics.strokeWeight(this.strokeWeight);
        this.graphics.noFill();

        this.graphics.beginShape();
        const step = 10;
        const speed = 0.1;
        let delay = step / this.totalNum * (this.index + 1);
        let nx = ((currentTime * speed + delay) % step) / step;
        const r = ((this.width + this.strokeWeight * 2) / cos(radians(45))) * nx;
        this.graphics.ellipse(0, 0, r, r);

        this.graphics.pop();
    }
}

class VV {
    constructor(_width, _bgColor, _strokeColor) {
        this._width = _width;
        this.graphics = createGraphics(_width, _width);
        this.bgColor = _bgColor;
        this.lines = [];

        const totalNum = 5;
        const weight = 26;
        for (let i = 0; i < totalNum; i++) {
            this.lines.push(new V(this.graphics, _width, weight, i, totalNum, _strokeColor));
        }

        this.graphics.strokeCap(PROJECT);
    }
    draw() {
        push();
        translate(-this._width / 2, -this._width / 2);

        this.graphics.background(this.bgColor);
        this.lines.forEach((l) => {
            l.draw();
        });
        image(this.graphics, 0, 0);

        pop();
    }
}

class V {
    constructor(_graphics, _width, _strokeWeight, index, totalNum, _color) {
        this.graphics = _graphics;
        this.width = _width;
        this.strokeWeight = _strokeWeight;
        this.index = index;
        this.totalNum = totalNum;
        this.color = _color;
    }

    draw() {
        const weightOffset = this.strokeWeight * 1.4;
        this.graphics.push();
        this.graphics.translate(this.width / 2, -this.width / 3.5);
        this.graphics.rotate(radians(-45));

        this.graphics.stroke(this.color);
        this.graphics.strokeWeight(this.strokeWeight);
        this.graphics.noFill();

        this.graphics.beginShape();
        const step = 10;
        const speed = 0.1;
        let delay = step / this.totalNum * (this.index + 1);
        let nx = ((currentTime * speed + delay) % step) / step;
        this.graphics.vertex((-this.width - weightOffset * 2) * nx, -weightOffset);  // left top
        this.graphics.vertex((-this.width - weightOffset * 2) * nx, (this.width + weightOffset * 2) * nx);  // left bottom
        this.graphics.vertex(weightOffset, (this.width + weightOffset * 2) * nx);  // right bottom
        this.graphics.endShape();

        this.graphics.pop();
    }
}

class BB {
    constructor(_width, _bgColor, _strokeColor) {
        this._width = _width;
        this.graphics = createGraphics(_width, _width);
        this.bgColor = _bgColor;
        this.lines = [];

        const totalNum = 5;
        const weight = 28;
        for (let i = 0; i < totalNum; i++) {
            this.lines.push(new B(this.graphics, _width, weight, i, totalNum, _strokeColor));
        }

        this.graphics.strokeCap(PROJECT);
    }
    draw() {
        push();
        translate(-this._width / 2, -this._width / 2);

        this.graphics.background(this.bgColor);
        this.lines.forEach((l) => {
            l.draw();
        });
        image(this.graphics, 0, 0);

        pop();
    }
}

class B {
    constructor(_graphics, _width, _strokeWeight, index, totalNum, _color) {
        this.graphics = _graphics;
        this.width = _width;
        this.strokeWeight = _strokeWeight;
        this.index = index;
        this.totalNum = totalNum;
        this.color = _color;
    }

    draw() {
        this.graphics.push();
        this.graphics.translate(0, -this.strokeWeight);

        this.graphics.stroke(this.color);
        this.graphics.strokeWeight(this.strokeWeight);
        this.graphics.noFill();

        this.graphics.beginShape();
        const step = 10;
        const speed = 0.1;
        let delay = step / this.totalNum * (this.index + 1);
        let nx = ((currentTime * speed + delay) % step) / step;
        const y = (this.width + this.strokeWeight * 2) * nx;
        this.graphics.line(0, y, this.width, y);

        this.graphics.pop();
    }
}

const imageCapture = require("./imageCapture");
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
const span = 1;
let timeoutSpan = 100;

const generateImage = () => {
    imageCapture.createImage(canvas, "img_1", imageIndex);

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

document.getElementById("generateImageButton")
    .addEventListener("click", () => {
        currentTime[0] = 0;
        isImageGenerationMode = true;
        generateImage();
    });