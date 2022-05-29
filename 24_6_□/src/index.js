import * as THREE from "three";
const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.0,0.0,0.0);

const MAX_AGE = 7;
const duration = 10.0;
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

let baseTile;
let totalRenderCount = 0;

const uniforms = {
    rect: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        uWidth: {
            value: 1,
        },
        uHeight: {
            value: 1,
        },
        duration: { type: "f", value: duration },
    },
    bg: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
    }
};

// For dev
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 0.01;
let timeoutSpan = 100;

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
    uniforms.bg.time.value = currentTime[0];

    if (baseTile) {
        // baseTile.update();
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
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 2));
    geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 2));
    geometry.setAttribute('padding', new THREE.Float32BufferAttribute(paddings, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 1));
    geometry.setAttribute('ratio', new THREE.Float32BufferAttribute(ratios, 1));

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

const createTiles = () => {
    baseTile = new Tile(-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight, 0);
    renderTiles();
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
        this.ratio = Math.random();
        this.targetRatio = this.ratio;
        this.shouldRender = false;
        this.id = -1;
        this.impulse = 0;

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
    update(arg = null) {
        if (!!arg) {
            this.x = arg.x;
            this.y = arg.y;
            this.w = arg.w;
            this.h = arg.h;
            this.impulse = arg.impulse;
        }
        if (this.children.length > 0) {
            const ratioDiff = Math.abs(this.ratio - this.targetRatio);
            if (Math.abs(this.ratio - this.targetRatio) < 0.001) {
                this.targetRatio = Math.random();
            }
            const r = Math.max(Math.min(Math.abs(this.targetRatio - this.ratio) * 2, 0.05), 0.0);
            this.ratio += (this.targetRatio - this.ratio) * r;

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
            }
        } else {
            // Initial
            this.id = totalRenderCount;

            for (let j = 0; j < 4; j++) {
                vertices.push(this.x, this.y, 0);
                size.push(this.w, this.h);
                directions.push(this.getDirection());
                ratios.push(this.ratio);
            }

            const color = {
                x: map(Math.random(), 0.0, 1.0, 0.7, 0.8),
                y: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
                z: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
            };

            const padding = 1.0;

            for (let j = 0; j < 4; j++) {
                index.push(this.id);
                paddings.push(padding, padding);
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
}

createTiles();

if (!showGenerateImageButton) {
    window.addEventListener("resize", onResize);
}

onResize();
render();