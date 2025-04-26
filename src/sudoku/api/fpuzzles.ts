declare function importPuzzle(string: string, clearHistory: boolean): void
declare function exportPuzzle(includeCandidates: boolean): string
declare function download(screenshot: boolean, customFileName?: string): void
declare const puzzleTimer: {
    shown: boolean
    restart: (play: boolean) => void
}

async function prApiLoadPuzzle(code: string) {
    importPuzzle(code, true)
}

function prApiInit(puzzleCodes: string[], redPuzzleCodes: string[]) {
    puzzleTimer.shown = false
}

async function prGetImageDataUrl(screenshot: boolean): Promise<string> {
    
    var f: (screenshot: boolean) => string = new Function(
        "return "
        + download.toString()
            .replace("link.click();", "")
            .replace("link.href =", "const ret =")
            .slice(0, -1)
        + "return ret;}"
    )()
    return f(screenshot)
}