import { compressToBase64 } from "lz-string"
import puppeteer from "puppeteer"

interface GridCell {
    value?: number
    given?: boolean
    region?: number | null
    c?: string
}

/**
 * Fpuzzles Format
 */

// Convert to URL: https://codepen.io/Holy-Fire/pen/VNRZme
// LZString.compressToBase64 // LZString.decompressFromBase64
export interface Puzzle {
    size: number
    title: string
    author: string
    ruleset: string
    highlightConflicts: boolean
    grid: GridCell[][]
    "diagonal+"?: boolean
    "diagonal-"?: boolean
    antiknight?: boolean
    antiking?: boolean
    disjointgroups?: boolean
    nonconsecutive?: boolean
    extraregion?: {
        cells: string[]
    }[]
    odd?: {
        cell: string
    }[]
    even?: {
        cell: string
    }[]
    thermometer?: {
        lines: string[][]
    }[]
    palindrome?: {
        lines: string[][]
    }[]
    killercage?: {
        cells: string[]
        value?: string
    }[]
    littlekillersum?: {
        cell: string
        cells: string[]
        direction: "DR" | "UR" | "UL" | "DL"
        value: string
    }[]
    sandwichsum?: {
        cell: string
        value: string
    }[]
    difference?: {
        cells: string[]
        value?: string
    }[]
    negative?: ("ratio" | "xv")[]
    ratio?: {
        cells: string[]
        value?: string
    }[]
    clone?: {
        cells: string[]
        cloneCells: string[]
    }[]
    arrow?: {
        lines: string[][]
        cells: string[]
    }[]
    betweenline?: {
        lines: string[][]
    }[]
    minimum?: {
        cell: string
    }[]
    maximum?: {
        cell: string
    }[]
    xv?: {
        cells: string[]
        value: "X" | "V"
    }[]
    quadruple?: {
        cells: string[]
        values: number[]
    }[]
    text?: {
        cells: string[]
        value: string
        fontC: string
        size: number
        angle?: number
    }[]
    circle?: {
        cells: string[]
        baseC: string
        outlineC: string
        fontC: string
        width: number
        height: number
        angle?: number
    }[]
    rectangle?: {
        cells: string[]
        baseC: string
        outlineC: string
        fontC: string
        width: number
        height: number
        angle?: number
    }[]
    line?: {
        lines: string[][]
        outlineC: string
        width: number
    }[]
    cage?: {
        cells: string[]
        outlineC: string
        fontC: string
    }[]
}



function gridFor(size: number, cells: { [k: string]: GridCell }): GridCell[][] {
    const arr = []
    for (let i = 0; i < size; i++) {
        const inner_arr = []
        for (let j = 0; j < size; j++) {
            inner_arr[j] = {}
        }
        arr[i] = inner_arr
    }

    const re = new RegExp("^R(\\d+)C(\\d+)$")

    for (const key in cells) {

        const match = key.match(re)
        const row = match?.[1]
        const column = match?.[2]

        if (match !== null && row !== undefined && column !== undefined) {

            const rowIndex = Number.parseInt(row) - 1
            const colIndex = Number.parseInt(column) - 1
            const cell = cells[key]

            if (rowIndex >= 0 && rowIndex < size && colIndex >= 0 && colIndex < size && cell !== undefined) {

                arr[rowIndex]![colIndex] = cell
            }
        }
    }

    return arr
}

const puzzle: Puzzle = {
    title: "Puzzle 1",
    author: "Kim",
    ruleset: "Normal Sudoku Rules apply.",
    size: 9,
    highlightConflicts: true,
    grid: gridFor(9, {
        "R1C1": {
            value: 1
        },
        "R1C3": {
            value: 4,
            given: true
        },
        "R5C3": {
            region: 5 - 1
        },
        "R6C4": {
            region: 8 - 1
        },
        "R9C4": {
            region: 7 - 1
        },
        "R7C1": {
            region: 4 - 1,
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
}

function toPuzzleCode(puzzle: Puzzle): string {
    const json = JSON.stringify(puzzle)
    console.log(json)
    const base64 = compressToBase64(json)
    const url = `https://www.f-puzzles.com/?load=${base64}`
    return url
}

console.log("\nPuzzle\n\n")
const url = toPuzzleCode(puzzle)
console.log(url)

async function runBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url)

    setTimeout(async () => {
        puzzle.author = "Peter"
        await page.evaluate(`importPuzzle(${toPuzzleCode(puzzle)}, true)`)
    }, 2000)
}

// runBrowser()
