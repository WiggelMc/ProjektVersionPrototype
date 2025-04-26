import { readFileSync } from "fs";
import { grid, FPuzzlesPuzzle, SudokuPadPuzzle, FPuzzlesPuzzlePacket, SudokuPadPuzzlePacket, PuzzlePacket, SudokuPadPacket, Packet } from "./sudoku";
import { chromium } from "playwright";

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


type Engine = "fpuzzles" | "sudokupad"

const engine: Engine = "sudokupad"

function toPacket(puzzle: FPuzzlesPuzzle, redPositions: ([row: number, column: number])[]) {
    switch (engine) {
        case "fpuzzles":
            return puzzle.toPacket(redPositions)
        case "sudokupad":
            return SudokuPadPuzzle.fromFPuzzles(puzzle).toPacket(redPositions)
    }
}

function toUrl(puzzle: FPuzzlesPuzzle): string {
    switch (engine) {
        case "fpuzzles":
            return puzzle.toUrl()
        case "sudokupad":
            return SudokuPadPuzzle.fromFPuzzles(puzzle).toUrl()
    }
}

console.log("\nPuzzle\n\n")
const url = toUrl(puzzle)
console.log(url)

const sudokuPadPacket = {
    puzzle: SudokuPadPuzzle.fromFPuzzles(puzzle).toEncoding()
} as const satisfies Partial<SudokuPadPacket> 
const puzzlePackets: PuzzlePacket[] = []

puzzlePackets.push(toPacket(puzzle, []))

for (let d = 1; d <= 9; d++) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const value = (c + 3 * r + Math.floor(r / 3) + d - 1) % 9 + 1
            puzzle.data.grid[r]![c]!.value = value

            puzzlePackets.push(toPacket(puzzle, [[r + 1, c + 1]]))
        }
    }
}

console.log(puzzlePackets[20])

declare function prInit(html: string, packets: Packet): void

async function runBrowser() {
    const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] })
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage();
    page.on('close', () => {
        process.exit(0);
    })
    await page.goto(url)

    
    let packet: Packet

    switch (engine) {
        case "fpuzzles":
            await page.addStyleTag({ path: './window/fpuzzles.css' })
            await page.addScriptTag({ path: './build/sudoku/api/fpuzzles.js' })
            packet = {
                puzzles: puzzlePackets as FPuzzlesPuzzlePacket[]
            }
            break
        case "sudokupad":
            await page.addStyleTag({ path: './window/sudokupad.css' })
            await page.addScriptTag({ path: './build/sudoku/api/sudokupad.js' })
            packet = {
                ...sudokuPadPacket,
                replays: puzzlePackets as SudokuPadPuzzlePacket[]
            }
            break
    }

    await page.addStyleTag({ path: './window/window.css' })
    await page.addScriptTag({ path: './build/sudoku/api/window.js' })
    const htmlContent = readFileSync('./window/window.html', 'utf-8')

    await page.evaluate(([html, passedPacket]) => {
        prInit(html, passedPacket)
    }, [htmlContent, packet] as const)
}

runBrowser()