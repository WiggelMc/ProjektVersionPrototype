import { Packet } from "../sudoku"

type Initial = { __type__: "initial" }
type Step = { __type__: "step" }

declare function prApiLoadPuzzleStep(packet: Packet<Initial, Step>, step: Step, showRed: boolean): Promise<void>
declare function prApiLoadPuzzle(packet: Packet<Initial, Step>): Promise<void>
declare function prApiInit(): void

export async function prInit(html: string, packet: Packet<Initial, Step>) {
    document.body.insertAdjacentHTML("beforeend", html)
    prApiInit()

    await prApiLoadPuzzle(packet)

    let isRendering = false
    let renderStack: Step | null = null

    const mediaSeekBar = document.getElementById("media-seek-bar") as HTMLInputElement
    const mediaRefresh = document.getElementById("media-refresh") as HTMLButtonElement
    const mediaPlay = document.getElementById("media-play") as HTMLButtonElement
    const mediaProgress = document.getElementById("media-progress") as HTMLParagraphElement
    const mediaBack = document.getElementById("media-back") as HTMLButtonElement
    const mediaForward = document.getElementById("media-forward") as HTMLButtonElement
    const mediaSpeed = document.getElementById("media-speed") as HTMLSelectElement
    const mediaShowRed = document.getElementById("media-show-red") as HTMLButtonElement


    const render = async (step: Step) => {
        renderStack = step
        renderStack = step

        if (!isRendering) {
            isRendering = true

            while (renderStack !== null) {
                while (renderStack !== null) {
                    isRendering = true

                    const nextStep = renderStack
                    renderStack = null

                    await prApiLoadPuzzleStep(packet, nextStep, showRed)
                }
                isRendering = false
            }
        }
    }

    let progress = 0
    const setProgress = async (newProgress: number, newRed: boolean) => {
        if (newProgress >= packet.steps.length) {
            setPlaying(false)
            newProgress = packet.steps.length - 1
        }
        if (newProgress < 0) {
            newProgress = 0
        }

        progress = newProgress
        const puzzlePacket = packet.steps[newProgress]
        if (puzzlePacket !== undefined) {
            render(puzzlePacket)
        }
        const str = newProgress.toString()
        if (str !== mediaSeekBar.value) {
            mediaSeekBar.value = str
        }
        mediaProgress.innerText = `${newProgress} / ${packet.steps.length - 1}`
    }
    mediaSeekBar.min = progress.toString()
    mediaSeekBar.max = (packet.steps.length - 1).toString()
    mediaSeekBar.value = progress.toString()
    mediaSeekBar.addEventListener("input", (e) => {
        setProgress(Number.parseInt(mediaSeekBar.value), showRed)
    })
    mediaBack.addEventListener("click", (e) => {
        setProgress(progress - 1, showRed)
    })
    mediaForward.addEventListener("click", (e) => {
        setProgress(progress + 1, showRed)
    })
    mediaRefresh.addEventListener("click", (e) => {
        setProgress(progress, showRed)
    })

    const nextFrame = () => {
        setProgress(progress + 1, showRed)
    }

    let intervalID: number | null = null
    const setInterval = (isPlaying: boolean, newSpeed: number) => {
        if (intervalID !== null) {
            window.clearInterval(intervalID)
            intervalID = null
        }
        if (isPlaying) {
            intervalID = window.setInterval(nextFrame, 1000 / newSpeed)
        }
    }

    let playing = false
    const setPlaying = (isPlaying: boolean) => {
        if (isPlaying && progress >= packet.steps.length - 1) {
            setProgress(0, showRed)
        }
        playing = isPlaying
        mediaPlay.innerText = (isPlaying ? "Pause" : "Play") + " [W]"
        setInterval(isPlaying, speed)
    }
    mediaPlay.addEventListener("click", (e) => {
        setPlaying(!playing)
    })


    let speed = 4
    const setSpeed = (newSpeed: number) => {
        speed = newSpeed
        const str = newSpeed.toString()
        if (str !== mediaSpeed.value) {
            mediaSpeed.value = str
        }
        setInterval(playing, newSpeed)
    }
    const changeSpeedIndex = (offset: number) => {
        const values = [...mediaSpeed.options].map(o => Number.parseFloat(o.value))
        const oldIndex = values.findIndex((v) => speed == v)
        const newIndex = oldIndex + offset
        if (newIndex < 0) {
            setSpeed(values[0]!)
        } else if (newIndex >= values.length) {
            setSpeed(values[values.length - 1]!)
        } else {
            setSpeed(values[newIndex]!)
        }
    }
    mediaSpeed.addEventListener("change", (e) => {
        setSpeed(Number.parseFloat(mediaSpeed.value))
    })


    let showRed = true
    const setShowRed = (newRed: boolean) => {
        showRed = newRed
        setProgress(progress, newRed)
        mediaShowRed.innerText = (newRed ? "Disable Red" : "Enable Red") + " [R]"
    }
    mediaShowRed.addEventListener("click", (e) => {
        setShowRed(!showRed)
    })


    setProgress(0, showRed)
    setPlaying(false)
    setSpeed(4)
    setShowRed(true)

    window.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "w":
                if (!e.repeat) {
                    setPlaying(!playing)
                }
                break
            case "a":
                setProgress(progress - 1, showRed)
                break
            case "d":
                setProgress(progress + 1, showRed)
                break
            case "r":
                if (!e.repeat) {
                    setShowRed(!showRed)
                }
                break
            case "q":
                if (!e.repeat) {
                    setProgress(progress, showRed)
                }
                break
            case "n":
                changeSpeedIndex(-1)
                break
            case "m":
                changeSpeedIndex(1)
                break
            default:
                return
        }
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
    }, { capture: true });

    ['pointerdown', 'mousedown', 'touchstart'].forEach(eventType => {
        mediaSeekBar.addEventListener(eventType, (e) => {
            e.stopPropagation()
            e.stopImmediatePropagation()
        })
    })

    console.log("Puzzle Viewer Script Loaded")
}