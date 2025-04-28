import { DisplayOptions, Packet, PageApi, PRWindow, WindowApi } from "./api"

type Initial = { __type__: "initial" }
type Step = { __type__: "step" }

interface ControlElements {
    seekBar: HTMLInputElement
    progressDisplay: HTMLParagraphElement
    rewindButton: HTMLButtonElement
    playButton: HTMLButtonElement
    backButton: HTMLButtonElement
    forwardButton: HTMLButtonElement
    showRedButton: HTMLButtonElement
    refreshButton: HTMLButtonElement
    speedSelect: HTMLSelectElement
}

type Playing = "playing" | "paused" | "rewinding"

class WindowManager {
    readonly pageApi: PageApi<Initial, Step>

    maxProgress: number
    progress: number
    playState: Playing
    speed: number
    displayOptions: DisplayOptions
    packet?: Packet<Initial, Step>
    controls?: ControlElements

    playingIntervalID: number | null = null
    renderWorking: boolean = false
    renderAgain: boolean = false

    constructor(pageApi: PageApi<Initial, Step>) {
        this.pageApi = pageApi

        this.maxProgress = 0
        this.progress = 0
        this.playState = "paused"
        this.speed = 4
        this.displayOptions = {
            showRed: true
        }
    }

    loadControls() {
        this.controls = {
            seekBar: document.getElementById("media-seek-bar") as HTMLInputElement,
            progressDisplay: document.getElementById("media-progress") as HTMLParagraphElement,
            rewindButton: document.getElementById("media-rewind") as HTMLButtonElement,
            playButton: document.getElementById("media-play") as HTMLButtonElement,
            backButton: document.getElementById("media-back") as HTMLButtonElement,
            forwardButton: document.getElementById("media-forward") as HTMLButtonElement,
            showRedButton: document.getElementById("media-show-red") as HTMLButtonElement,
            refreshButton: document.getElementById("media-refresh") as HTMLButtonElement,
            speedSelect: document.getElementById("media-speed") as HTMLSelectElement,
        }
    }

    async init() {
        this.loadControls()
        this.initControls()
        this.initKeybinds()
        await this.renderAll()
    }

    initControls() {
        const controls = this.controls
        if (controls === undefined) {
            return
        }

        controls.seekBar.addEventListener("input", async (e) => {
            await this.setProgress(Number.parseInt(controls.seekBar.value))
        })
        controls.rewindButton.addEventListener("click", async (e) => {
            await this.toggleRewind()
        })
        controls.playButton.addEventListener("click", async (e) => {
            await this.togglePlay()
        })
        controls.backButton.addEventListener("click", async (e) => {
            await this.setProgress(this.progress - 1)
        })
        controls.forwardButton.addEventListener("click", async (e) => {
            await this.setProgress(this.progress + 1)
        })
        controls.showRedButton.addEventListener("click", async (e) => {
            await this.setShowRed(!this.displayOptions.showRed)
        })
        controls.refreshButton.addEventListener("click", async (e) => {
            await this.handleRefresh()
        })
        controls.speedSelect.addEventListener("change", (e) => {
            this.setSpeed(Number.parseFloat(controls.speedSelect.value))
        })

        for (const eventType of ['pointerdown', 'mousedown', 'touchstart']) {
            controls.seekBar.addEventListener(eventType, (e) => {
                e.stopPropagation()
                e.stopImmediatePropagation()
            })
        }
    }
    async handleRefresh() {
        document.body.classList.add("is-refreshing")
        window.setTimeout(() => {
            document.body.classList.remove("is-refreshing")
        }, 200)
        await this.renderAll()
    }
    initKeybinds() {
        window.addEventListener("keydown", async (e) => {
            switch (e.key) {
                case "w":
                    if (!e.repeat) {
                        await this.togglePlay()
                    }
                    break
                case "s":
                    if (!e.repeat) {
                        await this.toggleRewind()
                    }
                    break
                case "a":
                    await this.setProgress(this.progress - 1)
                    break
                case "d":
                    await this.setProgress(this.progress + 1)
                    break
                case "r":
                    if (!e.repeat) {
                        await this.setShowRed(!this.displayOptions.showRed)
                    }
                    break
                case "q":
                    if (!e.repeat) {
                        await this.handleRefresh()
                    }
                    break
                case "n":
                    this.changeSpeedIndex(-1)
                    break
                case "m":
                    this.changeSpeedIndex(1)
                    break
                default:
                    return
            }
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
        }, { capture: true });
    }
    changeSpeedIndex(offset: number) {
        const controls = this.controls
        if (controls === undefined) {
            return
        }

        const values = [...controls.speedSelect.options].map(o => Number.parseFloat(o.value))
        const oldIndex = values.findIndex((v) => this.speed == v)
        const newIndex = oldIndex + offset

        const clampedIndex = Math.max(0, Math.min(newIndex, values.length - 1))
        const newSpeed = values[clampedIndex]
        if (newSpeed !== undefined) {
            this.setSpeed(newSpeed)
        }
    }
    setSpeed(speed: number) {
        this.speed = speed
        this.updatePlayInterval()
        this.renderSpeedSelect()
    }
    async setShowRed(showRed: boolean) {
        this.displayOptions.showRed = showRed
        await this.renderPuzzleStep()
        this.renderButtons()
    }
    async togglePlay() {
        if (this.playState === "paused" && this.progress === this.maxProgress) {
            await this.setProgress(0)
            this.setPlayState("playing")
        } else if (this.playState === "playing") {
            this.setPlayState("paused")
        } else {
            this.setPlayState("playing")
        }
    }
    async toggleRewind() {
        if (this.playState === "paused" && this.progress === 0) {
            await this.setProgress(this.maxProgress)
            this.setPlayState("rewinding")
        } else if (this.playState === "rewinding") {
            this.setPlayState("paused")
        } else {
            this.setPlayState("rewinding")
        }
    }
    setPlayState(playState: Playing) {
        this.playState = playState
        this.updatePlayInterval()
        this.renderButtons()
    }
    async setProgress(progress: number) {
        const clampedProgress = Math.max(0, Math.min(progress, this.maxProgress))
        this.progress = clampedProgress
        await this.renderPuzzleStep()
        this.renderProgress()
    }
    updatePlayInterval() {
        if (this.playingIntervalID !== null) {
            window.clearInterval(this.playingIntervalID)
            this.playingIntervalID = null
        }
        if (this.playState !== "paused") {
            this.playingIntervalID = window.setInterval(async () => {
                if (this.playState === "playing") {
                    if (this.progress === this.maxProgress) {
                        this.setPlayState("paused")
                    } else {
                        await this.setProgress(this.progress + 1)
                    }
                } else {
                    if (this.progress === 0) {
                        this.setPlayState("paused")
                    } else {
                        await this.setProgress(this.progress - 1)
                    }
                }

            }, 1000 / this.speed)
        }
    }

    async renderAll() {
        this.renderProgress()
        this.renderButtons()
        this.renderSpeedSelect()

        await this.renderPuzzle()
    }

    async renderPuzzle() {
        if (this.packet !== undefined) {
            await this.pageApi.loadPuzzle(this.packet, this.displayOptions)
        }
        await this.renderPuzzleStep()
    }

    async renderPuzzleStep() {
        if (this.renderWorking) {
            this.renderAgain = true
            return
        }

        this.renderWorking = true

        do {
            this.renderAgain = false

            if (this.packet === undefined) {
                await this.pageApi.clearPuzzle(this.displayOptions)
            } else if (this.packet.steps.length == 0) {
                await this.pageApi.loadPuzzle(this.packet, this.displayOptions)
            } else {
                const step = this.packet.steps[this.progress]
                if (step !== undefined) {
                    await this.pageApi.loadPuzzleStep(this.packet, step, this.displayOptions)
                }
            }
        } while (this.renderAgain)

        this.renderWorking = false
    }

    renderProgress() {
        const controls = this.controls
        if (controls === undefined) {
            return
        }

        const progressDisplayText = `${this.progress} / ${this.maxProgress}`
        if (controls.progressDisplay.textContent !== progressDisplayText) {
            controls.progressDisplay.textContent = progressDisplayText
        }

        const min = "0"
        if (controls.seekBar.min !== min) {
            controls.seekBar.min = min
        }
        const max = this.maxProgress.toString()
        if (controls.seekBar.max !== max) {
            controls.seekBar.max = max
        }
        const value = this.progress.toString()
        if (controls.seekBar.value !== value) {
            controls.seekBar.value = value
        }
    }

    renderButtons() {
        const controls = this.controls
        if (controls === undefined) {
            return
        }

        const rewindText = `${this.playState === "rewinding" ? "Pause" : "Rewind"} [S]`
        if (controls.rewindButton.textContent !== rewindText) {
            controls.rewindButton.textContent = rewindText
        }

        const playText = `${this.playState === "playing" ? "Pause" : "Play"} [W]`
        if (controls.playButton.textContent !== playText) {
            controls.playButton.textContent = playText
        }

        const showRedText = `${this.displayOptions.showRed ? "Disable Red" : "Enable Red"} [R]`
        if (controls.showRedButton.textContent !== showRedText) {
            controls.showRedButton.textContent = showRedText
        }
    }

    renderSpeedSelect() {
        const controls = this.controls
        if (controls === undefined) {
            return
        }

        const value = this.speed.toString()
        if (controls.speedSelect.value !== value) {
            controls.speedSelect.value = value
        }
    }

    async loadPuzzle(packet?: Packet<Initial, Step>) {
        this.packet = packet
        this.progress = 0
        this.maxProgress = Math.max(0, (packet?.steps.length ?? 0) - 1)
        this.playState = "paused"

        await this.renderAll()
    }
}

class MainWindowApi implements WindowApi<Initial, Step> {
    readonly pageApi: PageApi<Initial, Step>
    readonly windowManager: WindowManager
    packet?: Packet<Initial, Step>

    constructor() {
        const prWindow = window as PRWindow<Initial, Step>
        this.pageApi = prWindow.PRPageAPI
        this.windowManager = new WindowManager(this.pageApi)
    }

    async init(html: string): Promise<void> {
        document.body.insertAdjacentHTML("beforeend", html)
        await this.pageApi.init()
        await this.windowManager.init()

        console.log("Puzzle Viewer Script Loaded")
    }
    async loadPuzzle(packet?: Packet<Initial, Step>): Promise<void> {
        this.packet = packet
        await this.windowManager.loadPuzzle(packet)
    }
}

window.PRWindowApi = new MainWindowApi()