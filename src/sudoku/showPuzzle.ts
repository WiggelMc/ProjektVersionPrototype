import { readFileSync } from "fs";
import { grid, FPuzzlesPuzzle, SudokuPadPuzzle, FPuzzlesStep, SudokuPadStep, Packet } from "./sudoku";
import { chromium, Page } from "playwright";

const puzzle: FPuzzlesPuzzle = new FPuzzlesPuzzle({
    title: "Puzzle 1",
    author: "Kim",
    ruleset: "Normal Sudoku Rules apply.",
    size: 9,
    highlightConflicts: true,
    grid: grid(9, {
        "R3C1": {
            cornerPencilMarks: [1, 2, 4, 5],
            centerPencilMarks: [1, 2, 3, 4, 5, 6]
        },
        "R7C1": {
            c: "#A8A8A8"
        }
    }),
    arrow: [
        {
            cells: [
                "R4C6"
            ],
            lines: [
                [
                    "R4C6",
                    "R5C5",
                    "R6C5"
                ]
            ]
        }
    ],
    line: [
        {
            width: 0.35,
            outlineC: "#68ef67",
            lines: [
                [
                    "R8C3",
                    "R8C4",
                    "R8C5",
                    "R8C6",
                    "R7C7",
                    "R6C7",
                    "R5C7"
                ]
            ]
        }
    ],
    littlekillersum: [
        {
            cell: "R4C10",
            cells: [
                "R5C9",
                "R6C8",
                "R7C7",
                "R8C6",
                "R9C5"
            ],
            direction: "DL",
            value: "14"
        }
    ]
})




interface Engine<Initial, Step> {
    pushStep(puzzle: FPuzzlesPuzzle, redPositions: ([row: number, column: number])[]): void
    getUrl(): string
    getPacket(): Packet<Initial, Step>
    injectCode(page: Page): Promise<void>
}

class SudokuPad implements Engine<string, SudokuPadStep> {
    puzzle: SudokuPadPuzzle
    steps: SudokuPadStep[]

    constructor(puzzle: FPuzzlesPuzzle) {
        this.puzzle = SudokuPadPuzzle.fromFPuzzles(puzzle)
        this.steps = [{
            replay: "",
            red_replay: ""
        }]
    }
    async injectCode(page: Page): Promise<void> {
        await page.addStyleTag({ path: './window/sudokupad.css' })
        await page.addScriptTag({ path: './build/sudoku/api/sudokupad.js' })
    }
    pushStep(puzzle: FPuzzlesPuzzle, redPositions: ([row: number, column: number])[]): void {
        this.steps.push(SudokuPadPuzzle.fromFPuzzles(puzzle).toStep(redPositions))
    }
    getUrl(): string {
        return this.puzzle.toUrl()
    }
    getPacket(): Packet<string, SudokuPadStep> {
        return {
            initial: this.puzzle.toEncoding(),
            steps: this.steps
        }
    }
}

class FPuzzles implements Engine<string, FPuzzlesStep> {
    puzzle: FPuzzlesPuzzle
    steps: FPuzzlesStep[]

    constructor(puzzle: FPuzzlesPuzzle) {
        this.puzzle = new FPuzzlesPuzzle(JSON.parse(JSON.stringify(puzzle.data)))

        const encoding = puzzle.toEncoding()
        this.steps = [{
            puzzle: encoding,
            red_puzzle: encoding
        }]
    }
    async injectCode(page: Page): Promise<void> {
        await page.addStyleTag({ path: './window/fpuzzles.css' })
        await page.addScriptTag({ path: './build/sudoku/api/fpuzzles.js' })
    }
    pushStep(puzzle: FPuzzlesPuzzle, redPositions: ([row: number, column: number])[]): void {
        this.steps.push(puzzle.toStep(redPositions))
    }
    getUrl(): string {
        return this.puzzle.toUrl()
    }
    getPacket(): Packet<string, FPuzzlesStep> {
        return {
            initial: this.puzzle.toEncoding(),
            steps: this.steps
        }
    }
}



function loadEngine(engineParam: string) {
    switch (engineParam) {
        case "fpuzzles":
            return new FPuzzles(puzzle)
        case "sudokupad":
            return new SudokuPad(puzzle)
        default:
            throw new Error(`Invalid Engine: ${engineParam}`)
    }
}

const engine: Engine<unknown, unknown> = loadEngine(process.argv[2] ?? "fpuzzles")

console.log("\nPuzzle\n\n")
const url = engine.getUrl()
console.log(url)

for (let d = 1; d <= 9; d++) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const value = (c + 3 * r + Math.floor(r / 3) + d - 1) % 9 + 1
            puzzle.data.grid[r]![c]!.value = value

            engine.pushStep(puzzle, [[r + 1, c + 1]])
        }
    }
}

declare function prInit(html: string, packet: Packet<any, any>): void

async function runBrowser() {
    const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] })
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage();
    page.on('close', () => {
        process.exit(0);
    })
    page.on('load', async () => {
        await engine.injectCode(page)

        await page.addStyleTag({ path: './window/window.css' })
        await page.addScriptTag({ path: './build/sudoku/api/window.js' })
        const htmlContent = readFileSync('./window/window.html', 'utf-8')

        await page.evaluate(([html, packet]) => {
            prInit(html, packet)
        }, [htmlContent, engine.getPacket()] as const)
    })
    await page.goto(url)
}

runBrowser()