type Puzzle = { __type__: "Puzzle" }
type Settings = {
    hidetimer: boolean
    hidesvenpeek: boolean
    hidesventobyemoji: boolean
    nopauseonstart: boolean
    autocheck: boolean
    checkpencilmarks: boolean
    conflictchecker: "on" | "off" | "simple"
}
type ScreenshotOptions = {
    blank: boolean
}

declare const PuzzleLoader: {
    parsePuzzleData: (puzzleId: string) => Promise<Puzzle>
}

declare global {
    interface Window {
        firstPuzzle: string
    }
}

declare const Framework: {
    features: {
        screenshot: {
            handleOpenDialog: () => Promise<void>
            handleCloseDialog: () => Promise<void>
            updateScreenshot: () => Promise<void>
            setOption: <T extends keyof ScreenshotOptions>(option: T, value: ScreenshotOptions[T]) => void
        }
    }
    app: {
        puzzle: {
            createPuzzle: (props: { row: number, col: number }) => void
        }
        restartPuzzle: (keepTime?: boolean) => void
        loadCTCPuzzle: (ctcPuzzle: Puzzle) => Promise<boolean>
        loadCompactClassicSudoku: () => Promise<unknown>
    }
    getSetting: <T extends keyof Settings>(setting: T) => Settings[T]
    setSetting: <T extends keyof Settings>(setting: T, value: Settings[T]) => void
    closeDialog(): void
}

async function prApiLoadPuzzle(code: string) {
    //TODO: Maybe fix with loadProgress / replayPlay(..., { speed: -1 })
    // eg. load puzzle only when changed, otherwise only load progress (would also make marks better)
    // also, we would need another format for this: ShowFormat, which is an object in the format that the engine requires

    return PuzzleLoader.parsePuzzleData(code).then((puzzle) => {

        return PuzzleLoader.parsePuzzleData(window.firstPuzzle!).then(async (firstPuzzle) => {
            return new Promise(async (resolve) => {

                Framework.app.restartPuzzle()
                const beforeLoad = Date.now()
                await Framework.app.loadCTCPuzzle(firstPuzzle)
                const betweenLoad = Date.now()
                await Framework.app.loadCTCPuzzle(puzzle)
                const afterLoad = Date.now()

                const renderTime = betweenLoad - beforeLoad
                const invisTime = afterLoad - betweenLoad
                const sleepTime = Math.max(10, 2 * invisTime - renderTime)
                window.setTimeout(resolve, sleepTime)
            })
        })
    })
}

function prApiInit(puzzleCodes: string[], redPuzzleCodes: string[]) {
    window.firstPuzzle = puzzleCodes[0]!

    Framework.setSetting("hidetimer", true)
    Framework.setSetting("hidesvenpeek", true)
    Framework.setSetting("hidesventobyemoji", true)
    Framework.setSetting("nopauseonstart", true)

    Framework.setSetting("autocheck", false)
    Framework.setSetting("checkpencilmarks", false)
    Framework.setSetting("conflictchecker", "off")

    const observer = new MutationObserver((mutations, obs) => {
        const dialogBox = document.querySelector('.dialog-overlay.centeroverboard')
        if (dialogBox) {
            Framework.closeDialog()
            obs.disconnect()
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
}

async function prGetImageDataUrl(screenshot: boolean): Promise<string> {

    await Framework.features.screenshot.handleOpenDialog()
    Framework.features.screenshot.setOption("blank", !screenshot)
    await Framework.features.screenshot.updateScreenshot()

    const image = document.querySelector("#screenshot_preview") as HTMLImageElement
    const downloadString = image.src

    await Framework.features.screenshot.handleCloseDialog()

    return downloadString
}