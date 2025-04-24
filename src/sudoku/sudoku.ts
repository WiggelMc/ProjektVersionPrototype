import { compressToBase64 } from "lz-string"

const cellColors = [
    "#A8A8A8",
    "#000000",
    "#FFA0A0",
    "#FFE060",
    "#FFFFB0",
    "#B0FFB0",
    "#60D060",
    "#D0D0FF",
    "#8080F0",
    "#FF80FF",
    "#FFD0D0"
] as const

export type CellColor = typeof cellColors[number]

export interface GridCell {
    /** Cell Value */
    value?: number
    /** Is the value field a given or a user digit */
    given?: boolean
    /** Region Number, null excludes the cell from any region */
    region?: number | null
    /** Background Color */
    c?: CellColor
    /** User Center Pencil Marks */
    centerPencilMarks?: number[]
    /** User Corner Pencil Marks */
    cornerPencilMarks?: number[]
    /** User Color Highlights */
    highlight?: CellColor
}

/**
 * Fpuzzles Format
 */

// Convert to URL: https://codepen.io/Holy-Fire/pen/VNRZme
// LZString.compressToBase64 // LZString.decompressFromBase64
export interface PuzzleData {
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

export class Puzzle {
    data: PuzzleData
    constructor(data: PuzzleData) {
        this.data = data
    }

    toFPuzzlesJson(): string {
        return JSON.stringify(this.data)
    }

    toSudokuPadJson(first: boolean = false): string {
        const clone: PuzzleData = JSON.parse(JSON.stringify(this.data))
        for (const row of clone.grid ?? []) {
            for (const cell of row) {
                if (cell.value !== undefined) {
                    cell.given = true
                }

                if (first) {
                    cell.centerPencilMarks = undefined
                    cell.cornerPencilMarks = undefined
                }

                if (cell.given) {
                    cell.centerPencilMarks = undefined
                    cell.cornerPencilMarks = undefined
                }

                if (cell.highlight !== undefined) {
                    cell.c = cell.highlight
                    cell.highlight = undefined
                }
            }
        }

        return JSON.stringify(clone)
    }

    toFPuzzlesEncoding(): string {
        const json = this.toFPuzzlesJson()
        return compressToBase64(json)
    }

    toSudokuPadEncoding(first: boolean = false): string {
        const json = this.toSudokuPadJson(first)
        return `fpuzzles${compressToBase64(json)}`
    }

    toFPuzzlesUrl(): string {
        const encoding = this.toFPuzzlesEncoding()
        return `https://www.f-puzzles.com/?load=${encoding}`
    }

    toSudokuPadUrl(first: boolean = false): string {
        const encoding = this.toSudokuPadEncoding(first)
        return `https://sudokupad.app/scf?puzzleid=${encoding}`
    }
}

export function grid(size: number, cells: { [k: string]: GridCell }): GridCell[][] {
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
