import * as THREE from "three";
const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.016,0.678,0.749);

const duration = 1.0;

const uniforms = {
    rect: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
    },
};

// For dev
let currentTime = [0];
let imageIndex = 0;
let isImageGenerationMode = false;
let showGenerateImageButton = false;
const span = 0.01;
let timeoutSpan = 100;

const objectGroup = new THREE.Group();

const createMeshes = () => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(
            window.innerWidth,
            window.innerHeight
        ),
        new THREE.ShaderMaterial({
            uniforms: uniforms.rect,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: true
        })
    );
    uniforms.rect.resolution.value.x = mesh.geometry.parameters.width;
    uniforms.rect.resolution.value.y = mesh.geometry.parameters.height;
    objectGroup.add(mesh);
};

createMeshes()
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

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera);

    requestAnimationFrame(render);
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
    generateImageButton.style = "display: block;";
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

// window.addEventListener("resize", onResize);