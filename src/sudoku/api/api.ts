
export type SudokuPadStep = {
    replay: string
    red_replay: string
}

export type FPuzzlesStep = {
    puzzle: string
    red_puzzle: string
}

export type Packet<Initial, Step> = {
    initial: Initial
    steps: Step[]
}

export type DisplayOptions = {
    showRed: boolean
}

export interface PageApi<Initial, Step> {
    init(): Promise<void>
    clearPuzzle(opts: DisplayOptions): Promise<void>
    loadPuzzle(packet: Packet<Initial, Step>, opts: DisplayOptions): Promise<void>
    loadPuzzleStep(packet: Packet<Initial, Step>, step: Step, opts: DisplayOptions): Promise<void>
    getImageDataUrl(screenshot: boolean): Promise<string | undefined>
}

export interface WindowApi<Initial, Step> {
    init(html: string): Promise<void>
    loadPuzzle(packet?: Packet<Initial, Step>): Promise<void>
}

export interface PRWindow<Initial, Step> {
    PRPageAPI: PageApi<Initial, Step>
    PRWindowApi: WindowApi<Initial, Step>
}

declare global {
    interface Window extends PRWindow<unknown, unknown> { }
}
