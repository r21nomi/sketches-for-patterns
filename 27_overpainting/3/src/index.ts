import * as THREE from 'three'
// @ts-ignore
import rotationVertexShader from '~/shader/rotationVertexShader.vert'
// @ts-ignore
import fragmentShader from '~/shader/fragmentShader.frag'
import {CustomClock} from "~/CustomClock"
import {createNoise2D} from "simplex-noise"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const map = (value: number, beforeMin: number, beforeMax: number, afterMin: number, afterMax: number): number => {
  return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin))
}

const shuffle = ([...array]): any[] => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const createVector = (x, y, z = 0): any => {
  return {
    x,
    y,
    z
  }
}

const FACE_NUM = 6;
let art: Art
class Painter {
  private originalPos
  private pos
  private lastScreenPos
  private originalSize
  private size
  private shouldMove
  private frame
  private maxFrame
  private id
  private dir
  private delayOffset: number = 0
  private speed
  private noise
  private isSizeScalable: boolean = false
  private offset
  private now = -1
  private randValue = 0

  constructor(_pos, _size, _shouldMove = true, _isSizeScalable = false) {
    this.pos = _pos
    this.originalPos = Object.assign({}, _pos)
    this.size = _size
    this.originalSize = Object.assign({}, _size)
    this.shouldMove = _shouldMove
    this.frame = 0
    this.maxFrame = 200
    this.id = -1
    this.dir = createVector(
      shuffle([1, -1])[0],
      shuffle([1, -1])[0]
    )
    this.delayOffset = Math.floor(Math.random() * 2 + 2)
    this.speed = createVector(0.0, 0.0)
    this.noise = createNoise2D()
    this.isSizeScalable = _isSizeScalable
    this.offset = Math.floor(Math.random() * 1000)

    this.draw(false)
  }
  update(min, max) {
    if (this.isSizeScalable) {
      let n = map(this.getNoiseValue(art.elapsedTime, art.elapsedTime), 0, 1, 0.7, 1)
      this.size.x = this.originalSize.x * n
      this.size.y = this.originalSize.y * n
    }

    let n = this.getNoiseValue(art.elapsedTime * 3, art.elapsedTime)
    const t = Math.floor(art.elapsedTime)
    if (this.now !== t && t % 2 === 0) {
      this.randValue = Math.random() * 10000
      this.now = t
    }
    const vvv = 1
    const _speed = Object.assign({}, this.speed)
    _speed.x = this.speed.x + map(Math.cos(art.elapsedTime), 0.0, 1.0, 0.6, 6.0)
    _speed.y = this.speed.y + map(Math.sin(art.elapsedTime * 0.4), 0.0, 1.0, 0.5, 2.0)

    const v = {
      x: _speed.x * map(Math.sin(this.randValue + (Math.cos(art.elapsedTime * 2.0 + n) + this.offset + n * 3.0) * 1.0), -1, 1, 1, vvv),
      y: _speed.y * map(Math.sin(this.randValue + (art.elapsedTime + this.offset) * 2.0 + n), -1, 1, 1, vvv)
    }
    this.pos.x += v.x * this.dir.x
    this.pos.y += v.y * this.dir.y

    if (this.pos.x < min.x) {
      this.dir.x = 1
      this.pos.x = min.x
    }
    if (this.pos.x > max.x) {
      this.dir.x = -1
      this.pos.x = max.x
    }
    if (this.pos.y < min.y) {
      this.dir.y = 1
      this.pos.y = min.y
    }
    if (this.pos.y > max.y) {
      this.dir.y = -1
      this.pos.y = max.y
    }

    this.draw(true)
  }
  resize() {
    this.draw(true)
  }
  draw(shouldUpdate = false) {
    const screenPos = this.getScreenPosition()
    let rotation = this.getCalculatedRotation(screenPos.x, screenPos.y, screenPos.z)
    const matrix = this.computeLookAtMatrix(screenPos.x, screenPos.y, screenPos.z)
    art.uniforms.lookAtMatrix.value = matrix
    const centerOfPainter = this.getCenter()

    if (shouldUpdate) {
      // Update

      for (let k = 0; k < FACE_NUM; k++) {
        for (let j = 0; j < 4; j++) {
          const targetIndex = this.id * FACE_NUM * 4 + k * 4 + j;

          const position = art.geometry.attributes.position
          const {x, y, z, w, h} = this.getPositionAndSize(k, j)
          position.setXYZ(targetIndex, x, y, z)
          position.needsUpdate = true

          const size = art.geometry.attributes.size
          size.setXY(targetIndex, w, h)
          size.needsUpdate = true

          // origin position of painter box
          const centerPosition = art.geometry.attributes.centerPosition
          centerPosition.setXYZ(targetIndex, centerOfPainter.x, centerOfPainter.y, centerOfPainter.z)
          centerPosition.needsUpdate = true

          const rotationXAttr = art.geometry.attributes.rotationX
          rotationXAttr.setX(targetIndex, rotation.angleX)
          rotationXAttr.needsUpdate = true
          const rotationYAttr = art.geometry.attributes.rotationY
          rotationYAttr.setX(targetIndex, rotation.angleY)
          rotationYAttr.needsUpdate = true
        }
      }
    } else {
      // Initial
      this.id = art.totalRenderCount

      for (let k = 0; k < FACE_NUM; k++) {
        for (let j = 0; j < 4; j++) {
          const {x, y, z, w, h} = this.getPositionAndSize(k, j)
          art.vertices.push(x, y, z)
          art.size.push(w, h)
          art.index.push(this.id)
          art.paddings.push(art.PADDING, art.PADDING)
          // art.colors.push(color.r, color.g, color.b)
          art.centerPositions.push(centerOfPainter.x, centerOfPainter.y, centerOfPainter.z)
          art.rotationsX.push(rotation.angleX)
          art.rotationsY.push(rotation.angleY)
        }

        art.uvs.push(
          0, 0,
          1, 0,
          1, 1,
          0, 1
        )

        // polygon order
        // 3 -- 2
        // |    |
        // 0 -- 1
        const vertexIndex = this.id * FACE_NUM * 4 + k * 4;
        art.indices.push(
          vertexIndex + 0, vertexIndex + 1, vertexIndex + 2,
          vertexIndex + 2, vertexIndex + 3, vertexIndex + 0
        )
      }
      art.totalRenderCount++
    }

    this.lastScreenPos = {
      x: screenPos.x,
      y: screenPos.y,
      z: screenPos.z
    }
  }
  computeLookAtMatrix(x: number, y: number, z: number): THREE.Matrix4 {
    const targetPosition = new THREE.Vector3(x, y, z)
    const objectPosition = !!this.lastScreenPos ? new THREE.Vector3(this.lastScreenPos.x, this.lastScreenPos.y, this.lastScreenPos.z) : targetPosition
    let lookAtMatrix = new THREE.Matrix4();

    const up = new THREE.Vector3(0, 1, 0);
    const zAxis = new THREE.Vector3().subVectors(objectPosition, targetPosition).normalize();
    const xAxis = new THREE.Vector3().crossVectors(up, zAxis).normalize();
    const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis);

    lookAtMatrix.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0,       0,       0,       1
    );

    return lookAtMatrix;
  }
  getCalculatedRotation(x: number, y: number, z: number): any {
    const target = new THREE.Vector3(x, y, z)
    const source = !!this.lastScreenPos ? new THREE.Vector3(this.lastScreenPos.x, this.lastScreenPos.y, this.lastScreenPos.z) : target

    const dir = target.clone().sub(source).normalize();

    const angleY = Math.atan2(dir.x, dir.z);
    const angleX = Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z));

    return { angleX, angleY };

    // const pos = {x, y, z}
    // const _lastPos = !!this.lastScreenPos ? this.lastScreenPos : pos
    // const lookAt = (objectPosition, targetPosition)  => {
    //   // ベクトルを求める
    //   let direction = {
    //     x: targetPosition.x - objectPosition.x,
    //     y: targetPosition.y - objectPosition.y,
    //     z: targetPosition.z - objectPosition.z
    //   };
    //
    //   // 方向ベクトルを正規化（長さを1にする）
    //   let magnitude = Math.sqrt(direction.x**2 + direction.y**2 + direction.z**2);
    //   direction.x /= magnitude;
    //   direction.y /= magnitude;
    //   direction.z /= magnitude;
    //
    //   // y軸に対する角度を求める
    //   let angleY = Math.atan2(direction.x, direction.z);
    //
    //   // x軸に対する角度を求める（仰角・俯角）
    //   let angleX = Math.atan2(direction.y, Math.sqrt(direction.x**2 + direction.z**2));
    //
    //   return {
    //     angleX: angleX,
    //     angleY: angleY
    //   };
    // }
    // return lookAt(_lastPos, pos)
  }
  getCenter() {
    return {
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z
    }
  }
  getScreenPosition() {
    const centerOfPainter = this.getCenter()
    const canvasSize = art.getCanvasSize()
    const w = canvasSize.w
    const h = canvasSize.h
    return {
      x: (centerOfPainter.x + w / 2),
      y: (centerOfPainter.y + h / 2),
      z: centerOfPainter.z + 0,
    }
  }
  /**
   *        +
   *      _____
   *  -   |   |   +
   *      |___|
   * (0, 0)
   *        -
   * The origin is left bottom.
   *
   * @param faceIndex
   * @param vertexIndex
   */
  getPositionAndSize(faceIndex, vertexIndex) {
    let x, y, z;
    let w, h;
    const PADDING = art.PADDING
    switch (faceIndex) {
      case 0: {
        // front
        x = (vertexIndex === 0 || vertexIndex === 3) ? this.pos.x - this.size.x / 2 + PADDING : this.pos.x + this.size.x / 2 - PADDING
        y = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.y - this.size.y / 2 + PADDING : this.pos.y + this.size.y / 2 - PADDING
        z = this.pos.z
        w = this.size.x - PADDING * 2
        h = this.size.y - PADDING * 2
        break;
      }
      case 1: {
        // right
        x = this.pos.x + this.size.x / 2 - PADDING;
        y = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.y - this.size.y / 2 + PADDING : this.pos.y + this.size.y / 2 - PADDING;
        z = (vertexIndex === 0 || vertexIndex === 3) ? this.pos.z : 0;
        w = this.pos.z;
        h = this.size.y - PADDING * 2;
        break;
      }
      case 2: {
        // back
        x = (vertexIndex === 0 || vertexIndex === 3) ? this.pos.x - this.size.x / 2 + PADDING : this.pos.x + this.size.x / 2 - PADDING;
        y = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.y - this.size.y / 2 + PADDING : this.pos.y + this.size.y / 2 - PADDING;
        z = 0;
        w = this.size.x - PADDING * 2;
        h = this.size.y - PADDING * 2;
        break;
      }
      case 3: {
        // left
        x = this.pos.x - this.size.x / 2 + PADDING;
        y = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.y - this.size.y / 2 + PADDING : this.pos.y + this.size.y / 2 - PADDING;
        z = (vertexIndex === 0 || vertexIndex === 3) ? 0 : this.pos.z;
        w = this.pos.z;
        h = this.size.y - PADDING * 2;
        break;
      }
      case 4: {
        // top
        x = (vertexIndex === 0 || vertexIndex === 3) ? this.pos.x - this.size.x / 2 + PADDING : this.pos.x + this.size.x / 2 - PADDING;
        y = this.pos.y + this.size.y / 2 - PADDING;
        z = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.z : 0;
        w = this.size.x - PADDING * 2;
        h = this.pos.z;
        break;
      }
      case 5: {
        // bottom
        x = (vertexIndex === 0 || vertexIndex === 3) ? this.pos.x - this.size.x / 2 + PADDING : this.pos.x + this.size.x / 2 - PADDING;
        y = this.pos.y - this.size.y / 2 + PADDING;
        z = (vertexIndex === 0 || vertexIndex === 1) ? this.pos.z : 0;
        w = this.size.x - PADDING * 2;
        h = this.pos.z;
        break;
      }
    }
    return {
      x,
      y,
      z,
      w,
      h
    }
  }
  getNoiseValue(seed1: number, seed2: number) {
    return map(this.noise(seed1, seed2), -1, 1, 0.4, 1)
  }
}

class Art {
  private FRAME_PADDING = 0.0
  private clock = new CustomClock()
  private scene = new THREE.Scene()
  private canvasSize
  private painters: Painter[] = []
  public PADDING = 0.0
  public geometry
  public mesh
  public index: number[] = []
  public vertices: number[] = []
  public uvs: number[] = []
  public indices: number[] = []
  public paddings: number[] = []
  public size: number[] = []
  public centerPositions: any[] = []
  public rotationsX: number[] = []
  public rotationsY: number[] = []
  public totalRenderCount = 0
  public elapsedTime = 0
  public uniforms = {
    // Second
    time: {
      type: 'f',
      value: 1.0
    },
    resolution: {
      type: 'v2',
      value: new THREE.Vector2()
    },
    texture: {
      type: "t",
      value: null
    },
    texture2: {
      type: "t",
      value: null
    },
    texture2Resolution: {
      type: 'v2',
      value: new THREE.Vector2()
    },
    lookAtMatrix: {
      type: 'v2',
      value: new THREE.Matrix4()
    }
  }
  public initialized = false
  public renderer
  public camera
  protected isTimerPlaying = true
  private video
  private textureImageSize

  async init() {
    window.addEventListener('resize', async () => {
      await this.onResize()
    })
    await this.onResize()
  }
  async initialize() {
    if (this.initialized) {
      console.warn('already initialized')
      return
    }
    if (this.getWindowSize().w <= 0 || this.getWindowSize().h <= 0) {
      console.warn('window size is 0')
      return
    }

    const canvas: any = document.getElementById('canvas')
    canvas.style.backgroundColor = `#0000ee`
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      preserveDrawingBuffer: true
    })
    this.renderer.autoClearColor = false

    await this.initVideo()
    this.initCamera()

    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    requestAnimationFrame((t) => {
      this.render(t)
    })

    this.initialized = true

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case ' ':
          this.isTimerPlaying = !this.isTimerPlaying
          this.updateTimer(this.isTimerPlaying)
      }
    })
  }
  initCamera() {
    const windowSize = this.getWindowSize()
    const fov = 45
    const aspect = windowSize.w / windowSize.h
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000)

    const stageHeight = windowSize.h
    // Make camera distance same as actual pixel value.
    const z = stageHeight / Math.tan((fov * Math.PI) / 360) / 2
    this.camera.position.z = z
  }
  async initVideo() {
    this.video = document.getElementById("video")
    this.video.autoplay = true

    return new Promise((resolve, reject) => {
      this.video.addEventListener('loadeddata', () => {
        resolve('')
      }, false)
      this.video.src = "asset/video.mp4"
    })
  }

  createTexture(video): any {
    const imgWidth = video.videoWidth
    const imgHeight = video.videoHeight

    const canvas = document.createElement("canvas")
    canvas.width = imgWidth
    canvas.height = imgHeight

    const context: any = canvas.getContext("2d")
    context.fillStyle = "rgb(0, 0, 0)"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Flip upside down
    context.translate(0, canvas.height)
    context.scale(1, -1)

    context.drawImage(
      video,
      0,
      0,
      imgWidth,
      imgHeight
    )

    const data = context.getImageData(0, 0, canvas.width, canvas.height)
    const colors = data.data
    const size = colors.length * 4
    const _colorArray = new Uint8Array(size)

    for (let i = 0; i < colors.length; i += 4) {
      _colorArray[i] = colors[i]
      _colorArray[i + 1] = colors[i + 1]
      _colorArray[i + 2] = colors[i + 2]
      _colorArray[i + 3] = colors[i + 3]
    }
    this.textureImageSize = {
      w: imgWidth,
      h: imgHeight
    }

    const dataTexture = new THREE.DataTexture(_colorArray, canvas.width, canvas.height, THREE.RGBAFormat)
    dataTexture.needsUpdate = true

    return dataTexture
  }
  getWindowSize() {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    }
  }
  getFramePaddingOffset() {
    const windowSize = this.getWindowSize()
    return Math.floor(Math.min(windowSize.w, windowSize.h) * this.FRAME_PADDING)
  }
  getCanvasSize() {
    const framePaddingOffset = this.getFramePaddingOffset()
    return {
      w: window.innerWidth - framePaddingOffset,
      h: window.innerHeight - framePaddingOffset,
    }
  }
  async onResize(){
    if (!this.initialized) {
      await this.initialize()
    }

    this.canvasSize = this.getCanvasSize()

    const width = this.getWindowSize().w
    const height = this.getWindowSize().h

    if (this.camera) {
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }

    this.uniforms.resolution.value = new THREE.Vector2(width, height)

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height, false)

    if (this.video) {
      this.uniforms.texture.value = this.createTexture(this.video)
    }
    this.createPainters()

    if (this.painters.length > 0) {
      for (const painter of this.painters) {
        painter.resize()
      }
    }
  }
  render(t){
    this.elapsedTime = this.clock.getElapsedTime()

    if (this.painters.length > 0 && this.clock.isRunning()) {
      let index = 0
      for (const painter of this.painters) {
        const s = art.getInitialDrawerPosAndSize(index)
        painter.update(s.min, s.max)
        index++
      }
    }

    this.uniforms.time.value = this.elapsedTime
    if (this.video) {
      this.uniforms.texture.value = this.createTexture(this.video)
    }

    // const pos = this.painters[0].getCenter()
    // this.camera.lookAt(pos.x, pos.y, pos.z)
    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame((t) => {
      this.render(t)
    })
  }
  createPainters() {
    this.totalRenderCount = 0
    this.scene.clear()

    this.index = []
    this.vertices = []
    this.uvs = []
    this.indices = []
    this.paddings = []
    this.size = []
    this.painters = []
    this.centerPositions = []
    this.rotationsX = []
    this.rotationsY = []

    const painterNum = 1
    for (let i = 0; i < painterNum; i++) {
      const posAndSize = this.getInitialDrawerPosAndSize(i)
      this.painters.push(new Painter(posAndSize.pos, posAndSize.size, true, true))
    }

    this.addMeshesToScenes()
  }
  updateTimer(shouldPlay: boolean) {
    if (shouldPlay) {
      this.clock.start()
    } else {
      this.clock.stop()
    }
  }
  addMeshesToScenes() {
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setIndex(this.indices)
    this.geometry.setAttribute('index', new THREE.Uint16BufferAttribute(this.index, 1))
    this.geometry.setAttribute('totalIndex', new THREE.Float32BufferAttribute([...Array(this.index.length)].map(
      (_, index) => this.totalRenderCount
    ), 1))
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3))
    this.geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(this.uvs, 2))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(this.size, 2))
    this.geometry.setAttribute('padding', new THREE.Float32BufferAttribute(this.paddings, 2))
    this.geometry.setAttribute('centerPosition', new THREE.Float32BufferAttribute(this.centerPositions, 3))
    this.geometry.setAttribute('rotationX', new THREE.Float32BufferAttribute(this.rotationsX, 1))
    this.geometry.setAttribute('rotationY', new THREE.Float32BufferAttribute(this.rotationsY, 1))

    const material = new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: rotationVertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      depthTest: true,
      wireframe: false,
      side: THREE.DoubleSide,
      glslVersion: THREE.GLSL1
    })

    this.mesh = new THREE.Mesh(this.geometry, material)
    this.scene.add(this.mesh)
  }
  getInitialDrawerPosAndSize(index: number) {
    const basePainterSize = this.getBasePainterSize()
    const z = 100
    const size = createVector(basePainterSize.w, basePainterSize.h, z)

    const center = createVector(
      (this.canvasSize.w / 2 * (Math.random() * 2 - 1)),
      (this.canvasSize.h / 2 * (Math.random() * 2 - 1)),
      z / 2
    )
    return {
      pos: center,
      size: size,
      min: createVector(-this.canvasSize.w / 2 + size.x / 2, -this.canvasSize.h / 2 + size.y / 2),
      max: createVector(this.canvasSize.w / 2 - size.x / 2, this.canvasSize.h / 2 - size.y / 2)
      // min: createVector(-this.canvasSize.w / 2 - size.x / 2, -this.canvasSize.h / 2 - size.y / 2),
      // max: createVector(this.canvasSize.w / 2 + size.x / 2, this.canvasSize.h / 2 + size.y / 2)
    }
  }
  getBasePainterSize() {
    let txSize = this.textureImageSize
    if (!txSize) {
      txSize = {
        w: 1,
        h: 1
      }
    }
    const baseSize = Math.floor(Math.min(this.canvasSize.w, this.canvasSize.h) * 0.185)
    const size = Math.floor(baseSize)
    return {
      w: size,
      h: size * txSize.h / txSize.w,
    }
  }
}

const init = () => {
  art = new Art()
  art.init()
}

init()