class CustomClock {
  private elapsedTime: number
  private running: boolean
  private diff = 0.01

  constructor(autoStart: boolean = true) {
    this.elapsedTime = 0
    this.running = autoStart
  }

  start() {
    this.running = true
  }

  stop() {
    this.running = false
  }

  reset() {
    this.elapsedTime = 0
  }

  getElapsedTime(): number {
    if (this.running) {
      this.elapsedTime += this.diff
    }
    return this.elapsedTime
  }

  isRunning(): boolean {
    return this.running
  }
}

export { CustomClock }