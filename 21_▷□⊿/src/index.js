import * as THREE from "three";
const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');
const bgVertexShader = require('webpack-glsl-loader!./shader/bgVertexShader.vert');
const bgFragmentShader = require('webpack-glsl-loader!./shader/bgFragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.0,0.0,0.9);

const duration = 1.0;

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
        rowNum: {
            value: 0
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

const backgroundGroup = new THREE.Group();
const objectGroup = new THREE.Group();

const createMeshes = () => {
    const geometry = new THREE.BufferGeometry();
    const index = [];
    const vertices = [];
    const uvs = [];
    const offsets = [];
    const indices = [];
    const paddings = [];
    const colors = [];
    const num = 10;
    const windowPaddingOffset = Math.min(window.innerWidth, window.innerHeight) * 0.03;
    uniforms.rect.uWidth.value = (window.innerWidth - windowPaddingOffset) / num / 2;  // offsetsは -1 ~ 1の値をとるので2で割る
    uniforms.rect.uHeight.value = (window.innerHeight - windowPaddingOffset) / num / 2;
    uniforms.rect.rowNum.value = num;
    let count = 0;
    const totalWidth = window.innerWidth - windowPaddingOffset;
    const totalHeight = window.innerHeight - windowPaddingOffset;
    const _eachW = uniforms.rect.uWidth.value;
    const _eachH = uniforms.rect.uHeight.value;

    for (let x = 0; x < num; x++) {
        for (let y = 0; y < num; y++) {
            const px = (x * _eachW * 2) - (totalWidth / 2 - _eachW);
            const py = (y * _eachH * 2) - (totalHeight / 2 - _eachH);
            const pz = 0;

            const color = {
                x: map(Math.random(), 0.0, 1.0, 0.7, 0.8),
                y: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
                z: map(Math.random(), 0.0, 1.0, 0.1, 0.3),
            };

            const padding = 1.0;

            for (let j = 0; j < 4; j++) {
                index.push(count);
                vertices.push(px, py, pz);
                paddings.push(padding, padding);
                colors.push(color.x, color.y, color.z);
            }

            uvs.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1
            );
            offsets.push(
                -1, -1,
                1, -1,
                1, 1,
                -1, 1
            );

            // polygon order
            // 3 -- 2
            // |    |
            // 0 -- 1
            const vertexIndex = count * 4;
            indices.push(
                vertexIndex + 0, vertexIndex + 1, vertexIndex + 2,
                vertexIndex + 2, vertexIndex + 3, vertexIndex + 0
            );

            count++;
        }
    }
    geometry.setIndex(indices);
    geometry.setAttribute('index', new THREE.Uint16BufferAttribute(index, 1));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2));
    geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 2));
    geometry.setAttribute('padding', new THREE.Float32BufferAttribute(paddings, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.RawShaderMaterial({
        uniforms: uniforms.rect,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: true,
        wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    objectGroup.add(mesh);

    // Background
    const mesh4 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(
            window.innerWidth,
            window.innerHeight
        ),
        new THREE.ShaderMaterial({
            uniforms: uniforms.bg,
            vertexShader: bgVertexShader,
            fragmentShader: bgFragmentShader,
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: true
        })
    );
    mesh4.position.z = 0.4;
    backgroundGroup.add(mesh4);
};

createMeshes()
scene.add(backgroundGroup);
scene.add(objectGroup);

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

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

// window.addEventListener("resize", onResize);

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
        // setSize(1024, 1024);
        generateImage();
    });
} else {
    generateImageButton.remove();
}

onResize();
render();