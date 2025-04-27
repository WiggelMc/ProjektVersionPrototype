import { DisplayOptions, FPuzzlesStep, PageApi } from "./api"
import { Packet } from "./api"

declare function importPuzzle(string: string, clearHistory: boolean): void
declare function exportPuzzle(includeCandidates: boolean): string
declare function download(screenshot: boolean, customFileName?: string): void
declare const puzzleTimer: {
    shown: boolean
    restart: (play: boolean) => void
}

class FPuzzlesApi implements PageApi<string, FPuzzlesStep> {
    async init(): Promise<void> {
        puzzleTimer.shown = false
    }
    async loadPuzzle(packet: Packet<string, FPuzzlesStep>, opts: DisplayOptions): Promise<void> {
        importPuzzle(packet.initial, true)
    }
    async loadPuzzleStep(packet: Packet<string, FPuzzlesStep>, step: FPuzzlesStep, opts: DisplayOptions): Promise<void> {
        const code = opts.showRed ? step.red_puzzle : step.puzzle
        importPuzzle(code, true)
    }
    async getImageDataUrl(screenshot: boolean): Promise<string> {
        const f: (screenshot: boolean) => string = new Function(
            "return "
            + download.toString()
                .replace("link.click();", "")
                .replace("link.href =", "const ret =")
                .slice(0, -1)
            + "return ret;}"
        )()
        return f(screenshot)
    }
}

window.PRPageAPI = new FPuzzlesApi()
