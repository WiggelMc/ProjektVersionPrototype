declare function importPuzzle(string: string, clearHistory: boolean): void
declare const puzzleTimer: { shown: boolean }

async function prApiLoadPuzzle(code: string) {
    importPuzzle(code, true)
}

function prApiInit(puzzleCodes: string[], redPuzzleCodes: string[]) {
    puzzleTimer.shown = false
}