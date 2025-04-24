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

console.log("\nPuzzle\n\n")
const url = puzzle.toFPuzzlesUrl()
console.log(url)


const puzzleCodes: string[] = []
const redPuzzleCodes: string[] = []

puzzleCodes.push(puzzle.toFPuzzlesEncoding())
redPuzzleCodes.push(puzzle.toFPuzzlesEncoding())
for (let d = 1; d <= 9; d++) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            puzzle.data.grid[r]![c]!.value = d
            puzzleCodes.push(puzzle.toFPuzzlesEncoding())
            puzzle.data.grid[r]![c]!.highlight = "#FFA0A0"
            redPuzzleCodes.push(puzzle.toFPuzzlesEncoding())
            puzzle.data.grid[r]![c]!.highlight = undefined
        }
    }
}


declare function prInit(puzzleCodes: string[], redPuzzleCodes: string[]): void

async function runBrowser() {
    const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] })
    const context = await browser.newContext({ viewport: null })
    const page = await context.newPage();
    page.on('close', () => {
        process.exit(0);
    })
    await page.goto(url)

    await page.addStyleTag({ path: './window/puzzleWindow.css' });
    await page.addScriptTag({ path: './build/sudoku/windowScript.js' })

    const htmlContent = readFileSync('./window/puzzleWindow.html', 'utf-8');

    await page.evaluate(([html, codes, redCodes]) => {
        document.body.insertAdjacentHTML("beforeend", html)
        prInit(codes, redCodes)
    }, [htmlContent, puzzleCodes, redPuzzleCodes] as const)
}

runBrowser()