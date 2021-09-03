let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;
let isDebugMode = false;

let cubes = [];

setup=()=>{
    createCanvas(windowWidth, windowHeight);

    const count = 10;
    const w = min(width, height) / count;
    const h = w * 1.165;
    const verticalMerginOffset = h * 0.25;
    let row = 1;
    for (let y = -verticalMerginOffset; y < height; y += (h - verticalMerginOffset)) {
        for (let x = -w; x < width; x += w) {
            let _x = x;
            let _y = y;
            if (row % 2 === 0) {
                _x += w / 2;
            }
            cubes.push(
              new Cube(
                createVector(_x, _y),
                createVector(w, h),
                floor(random(0, 2)) % 2 === 0
              )
            );
        }
        row++;
    }
};

draw=()=>{
    if (!isImageGenerationMode) {
        currentTime[0] = frameCount;
    }
    background(`#eee`);

    for (let item of cubes) {
        item.draw();
    }
};

// windowResized=()=>{
//     resizeCanvas(windowWidth, windowHeight);
// }

class Cube {
    constructor(_pos, _size, _isMovable) {
        this.graphics = createGraphics(_size.x, _size.y);
        this.pos = _pos;
        this.size = _size;
        this.colors = [
            color(random(200, 240), random(200, 240), 0),
            color(0, 0, random(160, 240)),
            color(random(200, 240), 0, random(100, 150)),
        ];
        this.isMovable = _isMovable;
        this.speedOffset = random(0, 100);
    }

    draw() {
        this.graphics.stroke(`#222`);
        this.graphics.strokeWeight(1);
        this.graphics.strokeJoin(BEVEL);
        for (let i = 0; i < 3; i++) {
            this.graphics.fill(this.colors[i]);
            const w = sqrt(pow(this.size.x / 2, 2) / 2) * 1.63;
            const h = w * 0.5 * sqrt(3);
            this.graphics.push();
            this.graphics.translate(this.size.x / 2, this.size.y / 2);
            this.graphics.rotate(radians(360 / 3 * i - 30));
            this.graphics.shearX(-radians(30));
            this.graphics.rect(0, 0, w, h);
            this.graphics.pop();

            if (isDebugMode) {
                this.graphics.noFill();
                this.graphics.rect(0, 0, this.size.x, this.size.y);
            }

            let offset = 0;
            if (this.isMovable) {
                offset = -animate(getTime(this.speedOffset)) * 12;
            }

            image(this.graphics, this.pos.x, this.pos.y + offset);
        }
    }
}

const easeOutQuart = (x) => {
    return 1 - pow(1 - x, 4);
};

const easeOutBounce = (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
};

const animate = (t) => {
    const middle = 0.3;
    if (t >= 0 && t <= middle) {
        const v = map(t, 0, middle, 0, 1);
        return easeOutQuart(v);
    } else if (t > middle && t <= 1.0) {
        const v = map(t, middle, 1.0, 0, 1);
        return 1 - easeOutBounce(v);
    } else {
        return 0;
    }
};

const getTime = (seed) => {
    const speed = 1.5;
    const n = 60;
    return ((currentTime[0] * speed) + seed) % n / n;
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

    if (currentTime[0] !== 0 && currentTime[0] > 40) {
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