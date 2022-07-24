import * as THREE from "three";
const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(1.0, 1.0, 1.0);

const MAX_AGE = 11;
const duration = 12.0;
const PADDING = 0.0;
const geometry = new THREE.BufferGeometry();

const index = [];
const vertices = [];
const uvs = [];
const offsets = [];
const indices = [];
const paddings = [];
const colors = [];
const size = [];
const directions = [];
const ratios = [];
const weights = [];

let baseTile;
let totalRenderCount = 0;
let lastUpdatedTime = 0;

// For dev
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 0.01;
let timeoutSpan = 100;

const uniforms = {
    rect: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        texture: { type: 't', value: null },
        texture2: { type: 't', value: null },
        textureResolution: { type: "v2", value: new THREE.Vector2() },
        textureBlockSize: { type: "f", value: 1.0 },
    }
};

const map = (value, beforeMin, beforeMax, afterMin, afterMax) => {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

const objectGroup = new THREE.Group();

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
const stageHeight = window.innerHeight;
// Make camera distance same as actual pixel value.
const z = stageHeight / Math.tan(fov * Math.PI / 360) / 2;
camera.position.z = z;

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = () => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;
    if (!isImageGenerationMode) {
        currentTime[0] = time;
    }

    uniforms.rect.time.value = currentTime[0];

    if (baseTile) {
        // baseTile.update();
        //
        // const sec = Math.floor(currentTime[0]);
        // if (sec !== lastUpdatedTime && sec % 1 === 0) {
        //     baseTile.updateTarget(0.5);
        //     lastUpdatedTime = sec;
        // }
    }

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera);

    if (!isImageGenerationMode && !showGenerateImageButton) {
        requestAnimationFrame(render);
    }
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setSize(width, height);
};

const setSize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    uniforms.rect.resolution.value = new THREE.Vector2(width, height);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
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
    const canvas = document.querySelector("canvas");
    render();
    createImage(canvas, "img_1", imageIndex);

    if (currentTime[0] !== 0 && currentTime[0] > duration) {
        console.log("fin");
        return;
    }

    currentTime[0] += span;
    setTimeout(() => {
        imageIndex++;
        render();
        generateImage();
    }, timeoutSpan);
};

const generateImageButton = document.getElementById("generateImageButton");
if (showGenerateImageButton) {
    generateImageButton.style.display = "block";
    generateImageButton.addEventListener("click", () => {
        currentTime[0] = 0;
        isImageGenerationMode = true;
        generateImage();
    });
} else {
    generateImageButton.remove();
}

const renderTiles = () => {
    geometry.setIndex(indices);
    geometry.setAttribute('index', new THREE.Uint16BufferAttribute(index, 1));
    geometry.setAttribute('totalIndex', new THREE.Float32BufferAttribute([...Array(index.length)].map(
        (_, index) => totalRenderCount
    ), 1));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 2));
    geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 2));
    geometry.setAttribute('padding', new THREE.Float32BufferAttribute(paddings, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 1));
    geometry.setAttribute('ratio', new THREE.Float32BufferAttribute(ratios, 1));
    geometry.setAttribute('weight', new THREE.Float32BufferAttribute(weights, 2));

    const material = new THREE.RawShaderMaterial({
        uniforms: uniforms.rect,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: true,
        wireframe: false,
        glslVersion: THREE.GLSL1
    });

    const mesh = new THREE.Mesh(geometry, material);
    objectGroup.add(mesh);

    scene.add(objectGroup);
};

const createTextTexture = (type = 1, originalText = "") => {
    const textNum = 4;
    const textSize = 200;

    let _originalText = originalText.slice(0, textNum * textNum);

    while (_originalText.length < textNum * textNum) {
        _originalText += "　";
    }

    const canvas = document.createElement("canvas");
    canvas.width = textNum * textSize;
    canvas.height = textNum * textSize;

    const ctx = canvas.getContext("2d");
    ctx.font = `${textSize * 0.8}px 'Arial'`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < _originalText.length; i ++) {
        const x = i % textNum * textSize + textSize / 2;
        const y = Math.floor(i / textNum) * textSize + textSize / 2;
        ctx.fillText(_originalText[i], x, y);
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    uniforms.rect.textureResolution.value = new THREE.Vector2(canvas.width, canvas.height);
    uniforms.rect.textureBlockSize.value = textNum;

    switch (type) {
        case 1: {
            uniforms.rect.texture.value = texture;
            break;
        }
        case 2: {
            uniforms.rect.texture2.value = texture;
            break;
        }
    }
};

const createTiles = () => {
    baseTile = new Tile(-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight, 0);
    renderTiles();
    createTextTexture(1, ".隕石+-x?%=^*_@#$&◯◎");
};

class Tile {
    constructor(x, y, w, h, age) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.age = age;
        this.children = [];
        this.offset = Math.floor(Math.random() * 50 + 1);
        this.ratio = 0.5 + (Math.random() * 2.0 - 1.0) * 0.1;
        // this.ratio = 0.5;
        this.targetRatio = this.ratio;
        this.shouldRender = false;
        this.id = -1;
        this.impulse = 0;
        this.updateCount = 0;

        if (this.age < MAX_AGE) {
            const nextAge = this.age + 1;
            if (this.age % 2 === 0) {
                // horizontal
                // ||
                const w1 = this.w * this.ratio;
                const w2 = this.w * (1 - this.ratio);
                this.children[0] = new Tile(
                    this.x,
                    this.y,
                    w1,
                    this.h, nextAge
                );
                this.children[1] = new Tile(
                    this.x + w1,
                    this.y,
                    w2,
                    this.h,
                    nextAge
                );
            } else {
                // vertical
                // ＝
                const h1 = this.h * this.ratio;
                const h2 = this.h * (1 - this.ratio);
                this.children[0] = new Tile(
                    this.x,
                    this.y,
                    this.w,
                    h1,
                    nextAge
                );
                this.children[1] = new Tile(
                    this.x,
                    this.y + h1,
                    this.w,
                    h2,
                    nextAge
                );
            }
        } else {
            // for render
            this.draw(false);
        }
    }
    updateTarget(ratio) {
        if (this.children.length > 0) {
            this.targetRatio = !!ratio ? ratio : Math.random();
            const _ratio = !!ratio ? ratio : null;
            this.children[0].updateTarget(_ratio);
            this.children[1].updateTarget(_ratio);
        }
    }
    update(arg = null) {
        if (!!arg) {
            this.x = arg.x;
            this.y = arg.y;
            this.w = arg.w;
            this.h = arg.h;
            this.impulse = arg.impulse;
        }
        if (this.children.length > 0) {
            let ratioDiff = Math.abs(this.ratio - this.targetRatio);
            if (ratioDiff < 0.002) {
                this.targetRatio = Math.random();
                this.updateCount++;
            }
            if (ratioDiff < 0.005) {
                ratioDiff = 0;
            }
            const duration = 0.5;
            const speed = 0.1;
            const r = Math.max(Math.min(Math.abs(this.targetRatio - this.ratio) / duration, speed), 0.0);
            this.ratio += (this.targetRatio - this.ratio) * r;
            this.ratio = Math.max(Math.min(this.ratio, 1), 0);

            if (this.age % 2 === 0) {
                // horizontal
                // ||
                const x1 = this.x;
                const y1 = this.y;
                const w1 = this.w * this.ratio;
                const h1 = this.h;
                this.children[0].update({
                    x: x1,
                    y: y1,
                    w: w1,
                    h: h1,
                    impulse: ratioDiff
                });

                const x2 = x1 + w1;
                const y2 = y1;
                const w2 = this.w * (1 - this.ratio);
                const h2 = this.h;
                this.children[1].update({
                    x: x2,
                    y: y2,
                    w: w2,
                    h: h2,
                    impulse: ratioDiff
                });
            } else {
                // vertical
                // ＝
                const x1 = this.x;
                const y1 = this.y;
                const w1 = this.w;
                const h1 = this.h * this.ratio;
                this.children[0].update({
                    x: x1,
                    y: y1,
                    w: w1,
                    h: h1,
                    impulse: ratioDiff
                });

                const x2 = this.x;
                const y2 = this.y + h1;
                const w2 = this.w;
                const h2 = this.h * (1 - this.ratio);
                this.children[1].update({
                    x: x2,
                    y: y2,
                    w: w2,
                    h: h2,
                    impulse: ratioDiff
                });
            }
        } else {
            // render
            this.draw(true);
        }
    }
    draw(shouldUpdate = false) {
        this.shouldRender = true;

        if (shouldUpdate) {
            // Update
            const screenPos = this.getDistanceFromScreenCenter();

            for (let j = 0; j < 4; j++) {
                const targetIndex = this.id * 4 + j;

                const position = geometry.attributes.position;
                position.setXYZ(targetIndex, this.x, this.y, 0);
                position.needsUpdate = true;

                const size = geometry.attributes.size;
                size.setXY(targetIndex, this.w, this.h);
                size.needsUpdate = true;

                const ratio = geometry.attributes.ratio;
                ratio.setX(targetIndex, this.impulse);
                ratio.needsUpdate = true;

                const direction = geometry.attributes.direction;
                direction.setX(targetIndex, this.getDirection());
                direction.needsUpdate = true;

                const weight = geometry.attributes.weight;
                weight.setXY(targetIndex, screenPos.x, screenPos.y);
                weight.needsUpdate = true;
            }
        } else {
            // Initial
            this.id = totalRenderCount;
            const screenPos = this.getDistanceFromScreenCenter();

            for (let j = 0; j < 4; j++) {
                vertices.push(this.x, this.y, 0);
                size.push(this.w, this.h);
                directions.push(this.getDirection());
                ratios.push(this.ratio);
                weights.push(screenPos.x, screenPos.y);
            }

            const color = {
                x: map(Math.random(), 0.0, 1.0, 0.7, 0.8),
                y: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
                z: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
            };

            for (let j = 0; j < 4; j++) {
                index.push(this.id);
                paddings.push(PADDING, PADDING);
                colors.push(color.x, color.y, color.z);
            }

            uvs.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1
            );
            // offsets.push(
            //     -1, -1,
            //     1, -1,
            //     1, 1,
            //     -1, 1
            // );
            offsets.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1
            );

            // polygon order
            // 3 -- 2
            // |    |
            // 0 -- 1
            const vertexIndex = this.id * 4;
            indices.push(
                vertexIndex + 0, vertexIndex + 1, vertexIndex + 2,
                vertexIndex + 2, vertexIndex + 3, vertexIndex + 0
            );

            totalRenderCount++;
        }

        // console.log(`for render: x: ${this.x}, y: ${this.y}, w: ${this.w}, h: ${this.h}`);
    }
    getDirection() {
        if (Math.abs(this.w - this.h) < 100.0) {
            return -1.0;
        } else if (this.w > this.h) {
            return 1.0;
        } else {
            return 0.0;
        }
    }
    getCenter() {
        return {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2
        }
    }
    getDistanceFromScreenCenter() {
        const centerOfTile = this.getCenter();
        const w = window.innerWidth;
        const h = window.innerHeight;
        return {
            // x: (centerOfTile.x) / w,
            // y: (centerOfTile.y) / h
            x: (centerOfTile.x + w / 2) / w,
            y: (centerOfTile.y + h / 2) / h
        };
    }
}

if (!showGenerateImageButton) {
    window.addEventListener("resize", onResize);
}

createTiles();
onResize();
render();