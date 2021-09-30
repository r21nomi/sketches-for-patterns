let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 1;
let timeoutSpan = 100;
let isDebugMode = false;

let cubes = [];
let id = 0;
const timeCount = 120;

setup=()=>{
    const queries = location.search.replace("?", "")
      .split("&")
      .map(v => v.split("="))
      .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});

    if (queries['id']) {
        id = parseInt(queries['id']);
    }

    createCanvas(windowWidth, windowHeight);

    const count = 8;
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
                true
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
    background(`#ff1100`);

    for (let item of cubes) {
        item.draw();
    }
};

// windowResized=()=>{
//     resizeCanvas(windowWidth, windowHeight);
// }

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const colorList = [
  "ee3300-ffbb00-442233",
  "00120b-35605a-6b818c-d8e4ff-31e981",
  "340068-ff6978-fffcf9-b1ede8-6d435a",
  "e5ffde-bbcbcb-9590a8-634b66-18020c",
  "ffffff-ffcad4-b0d0d3-c08497-f7af9d",
  "156064-00c49a-f8e16c-ffc2b4-fb8f67",
  "9f84bd-c09bd8-ebc3db-ede3e9-e6e4ce",
  "3a405a-aec5eb-f9dec9-e9afa3-685044",
  "020202-0d324d-7f5a83-a188a6-9da2ab",
  "293132-474044-4f5165-547aa5-50d8d7",
  "392f5a-f092dd-ffaff0-eec8e0-a8c7bb",
  "ac80a0-89aae6-3685b5-0471a6-061826",
  "272d2d-a39ba8-b8c5d6-edf5fc-23ce6b",
  "9b5de5-f15bb5-fee440-00bbf9-00f5d4",
  "75dddd-508991-172a3a-004346-09bc8a",
  "464d77-36827f-f9db6d-f4eded-877666",
  "2274a5-e7eb90-fadf63-e6af2e-632b30"
];

class Cube {
    constructor(_pos, _size, _isMovable) {
        const cs = colorList[id % colorList.length].split("-").map(c => `#${c}`);
        const c = color(cs[Math.floor(random(cs.length))]);
        this.pos = _pos;
        this.size = _size;
        this.colors = [c, c, c];
        this.isMovable = _isMovable;
        this.speedOffset = random(0, 100);
        this.moveOffset = 40;
    }

    draw() {
        stroke(`#222`);
        strokeWeight(1);
        strokeJoin(BEVEL);

        let offset = 0;
        if (this.isMovable) {
            offset = (sin(getTime(this.speedOffset) * 360 * PI / 180) * 0.5 - 0.5) * this.moveOffset;
        }

        push();
        translate(this.pos.x, this.pos.y + offset);
        for (let i = 0; i < 3; i++) {
            fill(this.colors[i]);
            const w = sqrt(pow(this.size.x / 2, 2) / 2) * 1.63;
            const h = w * 0.5 * sqrt(3);
            push();
            translate(this.size.x / 2, this.size.y / 2);
            rotate(radians(360 / 3 * i - 30));
            shearX(-radians(30));
            if (i === 0) {
                rect(0, 0, w, h + this.moveOffset);
            } else if (i === 1) {
                rect(0, 0, w + this.moveOffset, h);
            } else {
                rect(0, 0, w, h);
            }
            pop();

            if (isDebugMode) {
                this.graphics.noFill();
                this.graphics.rect(this.pos.x, this.pos.y + offset, this.size.x, this.size.y);
            }
        }
        pop();
    }
}
const getTime = (seed) => {
    return ((currentTime[0]) + seed) % timeCount / timeCount;
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

    if (currentTime[0] !== 0 && currentTime[0] >= timeCount) {
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