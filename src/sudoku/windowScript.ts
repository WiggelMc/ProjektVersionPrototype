declare function importPuzzle(string: string, clearHistory: boolean): void

export function prInit(puzzleCodes: string[], redPuzzleCodes: string[]) {
    console.log("Hello")
    const mediaSeekBar = document.getElementById("media-seek-bar") as HTMLInputElement
    const mediaPlay = document.getElementById("media-play") as HTMLButtonElement
    const mediaProgress = document.getElementById("media-progress") as HTMLParagraphElement
    const mediaBack = document.getElementById("media-back") as HTMLButtonElement
    const mediaForward = document.getElementById("media-forward") as HTMLButtonElement
    const mediaSpeed = document.getElementById("media-speed") as HTMLSelectElement


    let progress = 0
    const setProgress = (newProgress: number) => {
        if (newProgress >= puzzleCodes.length) {
            setPlaying(false)
            newProgress = puzzleCodes.length - 1
        }
        if (newProgress < 0) {
            newProgress = 0
        }

        progress = newProgress
        const code = puzzleCodes[newProgress]
        if (code !== undefined) {
            importPuzzle(code, true)
        }
        const str = newProgress.toString()
        if (str !== mediaSeekBar.value) {
            mediaSeekBar.value = str
        }
        mediaProgress.innerText = `${newProgress} / ${puzzleCodes.length - 1}`
    }
    mediaSeekBar.min = progress.toString()
    mediaSeekBar.max = (puzzleCodes.length - 1).toString()
    mediaSeekBar.value = progress.toString()
    mediaSeekBar.addEventListener("input", (e) => {
        setProgress(Number.parseInt(mediaSeekBar.value))
    })
    mediaBack.addEventListener("click", (e) => {
        setProgress(progress - 1)
    })
    mediaForward.addEventListener("click", (e) => {
        setProgress(progress + 1)
    })

    const nextFrame = () => {
        setProgress(progress + 1)
    }

    let intervalID: number | null = null
    const setInterval = (isPlaying: boolean, newSpeed: number) => {
        if (intervalID !== null) {
            window.clearInterval(intervalID)
            intervalID = null
        }
        if (isPlaying) {
            intervalID = window.setInterval(nextFrame, 1000 / speed) 
        }
    }

    let playing = false
    const setPlaying = (isPlaying: boolean) => {
        if (isPlaying && progress >= puzzleCodes.length - 1) {
            setProgress(0)
        }
        playing = isPlaying
        mediaPlay.innerText = isPlaying ? "Pause" : "Play"
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
    mediaSpeed.addEventListener("change", (e) => {
        setSpeed(Number.parseFloat(mediaSpeed.value))
    })


    setProgress(0)
    setPlaying(false)
    setSpeed(4)
}