import { DisplayOptions, Packet, PageApi } from "./api"
import { SudokuPadStep } from "./api"

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
type ReplayOpts = {
    speed?: number
}
type Replay = {
    puzzleId: string
    type: "clzw"
    rows: 9
    cols: 9
    version: string
    data: string
}
type ScreenshotOptions = {
    blank: boolean
}

declare const PuzzleLoader: {
    parsePuzzleData: (puzzleId: string) => Promise<Puzzle>
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
            grid: {
                cols: number
            }
            selectedCells: {
                row: number
                col: number
            }[]
            undoStack: string[]
        }
        restartPuzzle: (keepTime?: boolean) => void
        loadCTCPuzzle: (ctcPuzzle: Puzzle) => Promise<boolean>
        loadCompactClassicSudoku: () => Promise<unknown>
        loadReplay: (replay: string, opts: ReplayOpts) => Promise<void>
        getReplay: () => string
    }
    getSetting: <T extends keyof Settings>(setting: T) => Settings[T]
    setSetting: <T extends keyof Settings>(setting: T, value: Settings[T]) => void
    closeDialog(): void
}
declare const loadFPuzzle: {
    compressPuzzle: (input: string) => string
    decompressPuzzle: (input: string) => string
}

class SudokupadApi implements PageApi<string, SudokuPadStep> {
    async init(): Promise<void> {
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

    async loadPuzzle(packet: Packet<string, SudokuPadStep>, opts: DisplayOptions): Promise<void> {
        return PuzzleLoader.parsePuzzleData(packet.initial).then(async (puzzle) => {

            Framework.app.restartPuzzle()
            await Framework.app.loadCompactClassicSudoku()
            await this.loadSeq("")

            Framework.app.restartPuzzle()
            await Framework.app.loadCTCPuzzle(puzzle)
            await this.loadSeq("")
        })
    }

    async loadPuzzleStep(packet: Packet<string, SudokuPadStep>, step: SudokuPadStep, opts: DisplayOptions): Promise<void> {
        const size = Framework.app.puzzle.grid.cols
        const selection = Framework.app.puzzle.selectedCells
            .map((c) => SudokupadApi.toCellCode(size, c.row + 1, c.col + 1))

        const replay: string[] = []

        replay.push(step.replay)
        if (opts.showRed) {
            replay.push(step.red_replay)
        }

        if (selection.length > 0) {
            replay.push(`I${selection.join("")}`)
        }

        const beforeLoad = Date.now()
        await this.loadSeq(replay.join("_"))
        const afterLoad = Date.now()

        await new Promise((resolve) => {
            window.setTimeout(resolve, afterLoad - beforeLoad)
        })
    }

    async getImageDataUrl(screenshot: boolean): Promise<string> {
        try {
            document.body.classList.add("hide-dialogs")

            await Framework.features.screenshot.handleOpenDialog()

            Framework.features.screenshot.setOption("blank", !screenshot)
            await Framework.features.screenshot.updateScreenshot()

            const image = document.querySelector("#screenshot_preview") as HTMLImageElement
            const downloadString = image.src

            await Framework.features.screenshot.handleCloseDialog()

            return downloadString
        } finally {
            document.body.classList.remove("hide-dialogs")
        }
    }

    private static toCellCode(size: number, row: number, column: number): string {
        const num = ((row - 1) * size + (column - 1))
        return `0${num.toString(16)}`.slice(-2)
    }

    async loadSeq(sequence: string): Promise<void> {
        const oldReplay: Replay = JSON.parse(Framework.app.getReplay())
        const newReplay = {
            ...oldReplay,
            data: loadFPuzzle.compressPuzzle(sequence)
        }
        await Framework.app.loadReplay(JSON.stringify(newReplay), { speed: -1 })
    }

    exportSeq(): string {
        const replay: Replay = JSON.parse(Framework.app.getReplay())
        return loadFPuzzle.decompressPuzzle(replay.data)
    }
}

window.PRPageAPI = new SudokupadApi()
