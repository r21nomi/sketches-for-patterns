import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const bgColor = new THREE.Color(0.8, 0.8, 0.688);
scene.background = new THREE.Color(0.1, 0.1, 0.1);

const MAX_AGE = 10;
let currentAge = MAX_AGE;
const duration = 12.0;
const PADDING = 0.0;
let geometry;

let index = [];
let vertices = [];
let uvs = [];
let indices = [];
let paddings = [];
let colors = [];
let size = [];
let directions = [];
let ratios = [];
let weights = [];

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
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() },
    texture: { type: 't', value: null },
    textureResolution: { type: "v2", value: new THREE.Vector2() },
    textureBlockSize: { type: "f", value: 1.0 },
    bgColor: { type: "v3", value: new THREE.Vector3(bgColor.r, bgColor.g, bgColor.b) },
};

const map = (value, beforeMin, beforeMax, afterMin, afterMax) => {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

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

const controls = new OrbitControls(camera, renderer.domElement);

const render = () => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;
    if (!isImageGenerationMode) {
        currentTime[0] = time;
    }

    uniforms.time.value = currentTime[0];

    if (baseTile) {
        baseTile.update();

        const sec = Math.floor(currentTime[0]);
        if (sec === 0 || sec !== lastUpdatedTime && sec % 8 === 0) {
            baseTile.updateTarget(0.5);
            lastUpdatedTime = sec;
        }
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

    uniforms.resolution.value = new THREE.Vector2(width, height);

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

const addTilesToScene = () => {
    geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('index', new THREE.Uint16BufferAttribute(index, 1));
    geometry.setAttribute('totalIndex', new THREE.Float32BufferAttribute([...Array(index.length)].map(
        (_, index) => totalRenderCount
    ), 1));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 2));
    geometry.setAttribute('padding', new THREE.Float32BufferAttribute(paddings, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 1));
    geometry.setAttribute('ratio', new THREE.Float32BufferAttribute(ratios, 1));
    geometry.setAttribute('weight', new THREE.Float32BufferAttribute(weights, 2));

    const material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: true,
        wireframe: false,
        side: THREE.DoubleSide,
        glslVersion: THREE.GLSL1
    });

    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
};

const createTiles = () => {
    totalRenderCount = 0;
    scene.clear();

    index = [];
    vertices = [];
    uvs = [];
    indices = [];
    paddings = [];
    colors = [];
    size = [];
    directions = [];
    ratios = [];
    weights = [];

    baseTile = new Tile(-window.innerWidth / 2, -stageHeight / 2, window.innerWidth, stageHeight, 0);

    addTilesToScene();
}

const createTexture = () => {
    new THREE.TextureLoader().load("asset/flower.jpeg", (texture) => {
        uniforms.texture.value = texture;
        uniforms.textureResolution.value = new THREE.Vector2(texture.image.width, texture.image.height);
    });
};

const initTiles = () => {
    createTiles();
    createTexture();
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
        this.ratio = 0.5;
        this.lastRatio = this.ratio;
        this.targetRatio = this.ratio;
        this.shouldRender = false;
        this.id = -1;
        this.impulse = 0;
        this.updateCount = 0;
        this.frame = 0;
        this.maxFrame = 250 + Math.floor(Math.random() * 200);
        this.easing = easeOutExpo;
        if (this.age > 3) {
            this.easing = easings[Math.floor(Math.random() * easings.length)];
        }

        if (this.age < currentAge) {
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
            this.frame = 0;
            this.lastRatio = this.ratio;
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
            if (ratioDiff < 0.0001) {
                this.frame = 0;
                this.targetRatio = map(Math.random(), 0.0, 1.0, 0.0, 1.0);
                this.updateCount++;
                this.lastRatio = this.ratio;
            }
            if (ratioDiff < 0.005) {
                ratioDiff = 0;
            }
            this.ratio = map(
              this.easing(this.frame / this.maxFrame) * this.targetRatio,
              0,
              this.targetRatio,
              this.lastRatio,
              this.targetRatio
            );
            this.ratio = Math.max(Math.min(this.ratio, 1.0), 0.0);
            this.frame++;

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
            const screenPos = this.getScreenPosition();

            for (let j = 0; j < 4; j++) {
                const targetIndex = this.id * 4 + j;

                const position = geometry.attributes.position;
                const x = (j === 0 || j === 3) ? this.x : this.x + this.w;
                const y = (j === 0 || j === 1) ? this.y : this.y + this.h;
                position.setXYZ(targetIndex, x, y, 0);
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
            const screenPos = this.getScreenPosition();

            for (let j = 0; j < 4; j++) {
                const x = (j === 0 || j === 3) ? this.x : this.x + this.w;
                const y = (j === 0 || j === 1) ? this.y : this.y + this.h;
                vertices.push(x, y, 0);
                // vertices.push(this.x, this.y, 0);
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
    getScreenPosition() {
        const centerOfTile = this.getCenter();
        const w = window.innerWidth;
        const h = stageHeight;
        return {
            // x: (centerOfTile.x) / w,
            // y: (centerOfTile.y) / h
            x: (centerOfTile.x + w / 2) / w,
            y: (centerOfTile.y + h / 2) / h
        };
    }
}

const easeOutElastic = (x) => {
    let t = x;
    let b = 0.0;
    let c = 1.0;
    let d = 1.0;
    let s = 1.70158;
    let p = 0.0;
    let a = c;
    if (t === 0.0) return b;
    if ((t /= d) === 1.0) return b + c;
    if (p === 0.0) p = d * 0.3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4.0;
    }
    else s = p / (2.0 * 3.14159265359) * Math.asin (c / a);
    return a * Math.pow(2.0,-10.0 * t) * Math.sin( (t * d - s) * (2.0 * 3.14159265359) / p) + c + b;
}

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
}

const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

const easeInCirc = (x) => {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

const easings = [
    easeInCirc,
    easeOutExpo,
    easeOutBack,
    easeOutBounce,
    easeOutElastic
];

if (!showGenerateImageButton) {
    window.addEventListener("resize", onResize);
}

initTiles();
onResize();
render();