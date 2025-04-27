import { compress, compressToBase64 } from "lz-string"
import { FPuzzlesStep, SudokuPadStep } from "./api/api"

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
export interface FPuzzlesData {
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

export class FPuzzlesPuzzle {
    data: FPuzzlesData
    constructor(data: FPuzzlesData) {
        this.data = data
    }

    toJson(): string {
        return JSON.stringify(this.data)
    }

    toEncoding(): string {
        const json = this.toJson()
        return compressToBase64(json)
    }

    toUrl(): string {
        const encoding = this.toEncoding()
        return `https://www.f-puzzles.com/?load=${encoding}`
    }

    toStep(redPositions: ([row: number, column: number])[]): FPuzzlesStep {
        const red_puzzle = new FPuzzlesPuzzle(JSON.parse(JSON.stringify(this.data)))
        for (const [row, column] of redPositions) {
            const cell = red_puzzle.data.grid[row - 1]?.[column - 1]
            if (cell !== undefined) {
                cell.highlight = "#FFA0A0"
            }
        }
        return {
            puzzle: this.toEncoding(),
            red_puzzle: red_puzzle.toEncoding()
        }
    }
}

class ReplayBuilder {
    size: number

    constructor(size: number) {
        this.size = size
    }

    cellCode(row: number, column: number): string {
        const num = ((row - 1) * this.size + (column - 1))
        return `0${num.toString(16)}`.slice(-2)
    }

    static colorCode(color: CellColor): number {
        const colorCode = cellColors.findIndex((c) => c === color)
        return colorCode === -1 ? 2 : colorCode
    }

    select(row: number, column: number): string {
        return `I${this.cellCode(row, column)}`
    }

    deselect(row: number, column: number): string {
        return `J${this.cellCode(row, column)}`
    }

    value(value: string): string {
        return `B${value}`
    }

    corner(value: string): string {
        return `C${value}`
    }

    center(value: string): string {
        return `D${value}`
    }

    color(color: number): string {
        return `E${color.toString(16)}`
    }

    place(row: number, column: number, actions: string[]) {
        return [this.select(row, column), ...actions, this.deselect(row, column)]
    }
}

export class SudokuPadPuzzle {
    data: FPuzzlesData
    replay: string[]

    constructor(data: FPuzzlesData, replay: string[]) {
        this.data = data
        this.replay = replay
    }

    static fromFPuzzles(puzzle: FPuzzlesPuzzle): SudokuPadPuzzle {
        const data: FPuzzlesData = JSON.parse(JSON.stringify(puzzle.data))
        const replay: string[] = []
        const builder: ReplayBuilder = new ReplayBuilder(data.size)

        for (const [rowIndex, gridRows] of (data.grid ?? []).entries()) {
            const row = rowIndex + 1
            for (const [columnIndex, cell] of gridRows.entries()) {
                const column = columnIndex + 1

                const steps: string[] = []

                if (cell.value !== undefined && !cell.given) {
                    steps.push(builder.value(cell.value.toString()))
                    cell.value = undefined
                } else {
                    if (cell.cornerPencilMarks !== undefined) {
                        steps.push(...cell.cornerPencilMarks.map((d) => builder.corner(d.toString())))
                    }
                    if (cell.centerPencilMarks !== undefined) {
                        steps.push(...cell.centerPencilMarks.map((d) => builder.center(d.toString())))
                    }
                    if (cell.highlight !== undefined) {
                        steps.push(...builder.color(ReplayBuilder.colorCode(cell.highlight))) //TODO: might need better conversion
                    }
                }

                if (steps.length > 0) {
                    replay.push(...builder.place(row, column, steps))
                }

                cell.cornerPencilMarks = undefined
                cell.centerPencilMarks = undefined
                cell.highlight = undefined
            }
        }
        return new SudokuPadPuzzle(data, replay)
    }

    toJson(): string {
        return JSON.stringify(this.data)
    }

    toReplayString(): string {
        return this.replay.join("_")
    }

    toEncoding(): string {
        const json = this.toJson()
        return `fpuzzles${compressToBase64(json)}`
    }

    toUrl(): string {
        const encoding = this.toEncoding()
        return `https://sudokupad.app/scf?puzzleid=${encoding}`
    }

    toStep(redPositions: ([row: number, column: number])[]): SudokuPadStep {
        const red_replay: string[] = []
        const builder: ReplayBuilder = new ReplayBuilder(this.data.size)
        for (const [row, column] of redPositions) {
            //TODO: This will break if the color already exists
            red_replay.push(...builder.place(row, column, [builder.color(ReplayBuilder.colorCode("#FFA0A0"))]))
        }

        return {
            replay: this.toReplayString(),
            red_replay: red_replay.join("_")
        }
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
