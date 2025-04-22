import { Command, Option } from "commander"

const program = new Command()

function allowMultiple(value: string, previous: string[] | undefined): string[] {
    return previous ? [...previous, value] : [value]
}

function error(message: string): never {
    console.error(`error: ${message}`);
    process.exit(1);
}



program
    .name('vsgen')
    .description('Variant Sudoku Generator')
    .helpOption('-h, --help', 'Display help for command')
    .version('1.0.0', '-v, --version', 'Display installed version')



type GenerateOptions = {
    config: string
    out: string[]
    cache: boolean
}

program
    .command('generate')
    .description('Generate a Sudoku')
    .requiredOption('-c, --config <file>', 'Config File')
    .requiredOption('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .action((options: GenerateOptions) => {
        console.log('generate Command:', options);
    })

type AnalyseOptions = {
    puzzle: string
    config: string
    out: string[]
    cache: boolean
}

program
    .command('analyse')
    .description('Analyse the Solution Paths of a Sudoku')
    .requiredOption('-p, --puzzle <file>', 'Puzzle File')
    .requiredOption('-c, --config <file>', 'Config File')
    .requiredOption('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .action((options: AnalyseOptions) => {
        console.log('analyse Command:', options);
    })



const showEngines = [
    'fpuzzles',
    'penpa',
    'sudokupad',
    'cmd'
] as const

type ShowOptions = {
    puzzle: string
    analysis?: string
    engine: typeof showEngines[number]
}

program
    .command('show')
    .description('Show a Sudoku in the selected Engine')
    .requiredOption('-p, --puzzle <file>', 'Puzzle File')
    .option('-a, --analysis <file>', 'Analysis File')
    .addOption(new Option('-e, --engine <engine>', 'Puzzle Engine to start').choices(showEngines).makeOptionMandatory())
    .action((options: ShowOptions) => {
        console.log('show Command:', options);
    })



const exportEngines = [
    'fpuzzles',
    'penpa',
    'sudokupad'
] as const

const exportFormats = [
    'json',
    'url',
    'encoded'
] as const

type ExportOptions = {
    puzzle: string
    out: string[]
    engine: typeof exportEngines[number]
    format: typeof exportFormats[number]
}

program
    .command('export')
    .description('Export a Sudoku to the specified Format')
    .requiredOption('-p, --puzzle <file>', 'Puzzle File')
    .requiredOption('-o, --out <file>', 'Output File', allowMultiple)
    .addOption(new Option('-e, --engine <engine>', 'Puzzle Engine to export to').choices(exportEngines).makeOptionMandatory())
    .addOption(new Option('-f, --format <format>', 'Export Format').choices(exportFormats).makeOptionMandatory())
    .action((options: ExportOptions) => {
        console.log('show Command:', options);
    })



type WatchOptions = {
    config: string
    out?: string[]
    cache: boolean
    analyse?: string
    "analysis-out"?: string
    show?: typeof showEngines[number]
    "export-engine"?: typeof exportEngines[number]
    "export-format"?: typeof exportFormats[number]
    "on-success"?: string
}

program
    .command('watch')
    .description('Watch for file changes in Config Files and regenerate, when changes are detected')
    .requiredOption('-c, --config <file>', 'Config File')
    .option('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .option('-a, --analyse <file>', 'Analysis Config File')
    .option('-g, --analysis-out <file>', 'Analysis Output File', allowMultiple)
    .addOption(new Option('-s, --show <engine>', 'Puzzle Engine to start').choices(showEngines))
    .addOption(new Option('-e, --export-engine <engine>', 'Puzzle Engine to export to').choices(exportEngines))
    .addOption(new Option('-f, --export-format <format>', 'Export Format').choices(exportFormats))
    .action((options: WatchOptions) => {
        if (options["analysis-out"] !== undefined && options.analyse === undefined)
            error("analysis-out Option requires analyse Option to be specified")

        if ((options["export-engine"] === undefined) != (options["export-format"] === undefined))
            error("export-engine and export-format must either both be specified or omitted")

        if ([
            options.out,
            options.analyse,
            options["analysis-out"],
            options.show,
            options["export-engine"],
            options["export-format"]
        ].every((e) => e === undefined))
            error("at least one output option must be specified")

        console.log('generate Command:', options);
    })



type ClearCacheOptions = {
    "dry-run": boolean
}

program
    .command('clear-cache')
    .description('Clear all caches')
    .option('-d, --dry-run', 'Display Files that will be deleted, but don\'t delete anything', false)
    .action((options: ClearCacheOptions) => {
        console.log('clear-cache Command:', options);
    })



program.parse()