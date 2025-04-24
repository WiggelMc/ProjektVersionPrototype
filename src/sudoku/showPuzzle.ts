import { readFileSync } from "fs";
import { grid, Puzzle } from "./sudoku";
import { chromium } from "playwright";

const puzzle: Puzzle = new Puzzle({
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


const engine: "fpuzzles" | "sudokupad" = "fpuzzles"


function encode(puzzle: Puzzle, first: boolean = false): string {
    switch (engine) {
        case "fpuzzles":
            return puzzle.toFPuzzlesEncoding()
        case "sudokupad":
            return puzzle.toSudokuPadEncoding(first)
    }
}

function toUrl(puzzle: Puzzle): string {
    switch (engine) {
        case "fpuzzles":
            return puzzle.toFPuzzlesUrl()
        case "sudokupad":
            return puzzle.toSudokuPadUrl()
    }
}

console.log("\nPuzzle\n\n")
const url = toUrl(puzzle)
console.log(url)


const puzzleCodes: string[] = []
const redPuzzleCodes: string[] = []

puzzleCodes.push(encode(puzzle, true))
redPuzzleCodes.push(encode(puzzle, true))
for (let d = 1; d <= 9; d++) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const value = (c + 3*r + Math.floor(r/3) + d - 1) % 9 + 1
            puzzle.data.grid[r]![c]!.value = value
            puzzleCodes.push(encode(puzzle))
            puzzle.data.grid[r]![c]!.highlight = "#FFA0A0"
            redPuzzleCodes.push(encode(puzzle))
            puzzle.data.grid[r]![c]!.highlight = undefined
        }
    }
}

console.log(redPuzzleCodes[20])

declare function prInit(html: string, puzzleCodes: string[], redPuzzleCodes: string[]): void

async function runBrowser() {
    const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] })
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage();
    page.on('close', () => {
        process.exit(0);
    })
    await page.goto(url)

    switch (engine) {
        case "fpuzzles":
            await page.addStyleTag({ path: './window/fpuzzles.css' });
            await page.addScriptTag({ path: './build/sudoku/api/fpuzzles.js' })
            break
        case "sudokupad":
            await page.addStyleTag({ path: './window/sudokupad.css' });
            await page.addScriptTag({ path: './build/sudoku/api/sudokupad.js' })
            break
    }

    await page.addStyleTag({ path: './window/window.css' });
    await page.addScriptTag({ path: './build/sudoku/api/window.js' })
    const htmlContent = readFileSync('./window/window.html', 'utf-8');

    await page.evaluate(([html, codes, redCodes]) => {
        prInit(html, codes, redCodes)
    }, [htmlContent, puzzleCodes, redPuzzleCodes] as const)
}

runBrowser()