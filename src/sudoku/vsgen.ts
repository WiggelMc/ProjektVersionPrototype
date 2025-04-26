import { Command, Option } from 'commander'

const program = new Command()

function allowMultiple(value: string, previous: string[] | undefined): string[] {
    return previous ? [...previous, value] : [value]
}

function error(message: string): never {
    console.error(`error: ${message}`)
    process.exit(1)
}

async function requiredWithPipe(optionName: string, optionValue: string | undefined): Promise<string> {
    if (optionValue !== undefined) {
        return optionValue
    }

    if (!process.stdin.isTTY) {
        return new Promise((resolve) => {
            let input = ''
            process.stdin.setEncoding('utf8')

            process.stdin.on('data', chunk => input += chunk)
            process.stdin.on('end', () => resolve(input.trimEnd()))
            process.stdin.on('error', err => error("error reading stdin"))
        })
    } else {
        error(`required option '${optionName}' not specified or piped`)
    }
}



program
    .name('vsgen')
    .description('Variant Sudoku Generator')
    .helpOption('-h, --help', 'Display help for command')
    .version('1.0.0', '-v, --version', 'Display installed version')



program
    .helpCommand('help [command]', 'Display help for command')



type GenerateOptions = {
    config?: string
    out?: string[]
    cache: boolean
}

program
    .command('generate')
    .description('Generate a Sudoku')
    .option('-c, --config <file>', 'Config File')
    .option('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .action(async (options: GenerateOptions) => {

        options.config = await requiredWithPipe('-c, --config <file>', options.config)

        console.error('generate Command:', options)

        if (options.out === undefined) {
            console.log('output goes to stdout')
        } else {
            console.log('writing output to file')
        }
    })

type AnalyseOptions = {
    puzzle?: string
    config: string
    out?: string[]
    cache: boolean
}

program
    .command('analyse')
    .description('Analyse the Solution Paths of a Sudoku')
    .option('-p, --puzzle <file>', 'Puzzle File')
    .requiredOption('-c, --config <file>', 'Config File')
    .option('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .action(async (options: AnalyseOptions) => {

        options.puzzle = await requiredWithPipe('-p, --puzzle <file>', options.puzzle)

        console.error('analyse Command:', options)

        if (options.out === undefined) {
            console.log('output goes to stdout')
        } else {
            console.log('writing output to file')
        }
    })



const showEngines = [
    'fpuzzles',
    'penpa',
    'sudokupad',
    'cmd'
] as const

type ShowOptions = {
    puzzle?: string
    analysis?: string
    'keep-around': boolean
    engine: typeof showEngines[number]
}

program
    .command('show')
    .description('Show a Sudoku in the selected Engine')
    .option('-p, --puzzle <file>', 'Puzzle File')
    .option('-a, --analysis <file>', 'Analysis File')
    .option('-k, --keep-around', 'Keep Window around after exiting the Process', false)
    .addOption(new Option('-e, --engine <engine>', 'Puzzle Engine to start').choices(showEngines).makeOptionMandatory())
    .action(async (options: ShowOptions) => {

        options.puzzle = await requiredWithPipe('-p, --puzzle <file>', options.puzzle)

        console.error('show Command:', options)
    })



const exportEngines = [
    'fpuzzles',
    'penpa',
    'sudokupad'
] as const

const exportFormats = [
    'json',
    'url',
    'encoded',
    'png'
] as const

type ExportOptions = {
    puzzle?: string
    out?: string[]
    engine: typeof exportEngines[number]
    format: typeof exportFormats[number]
}

program
    .command('export')
    .description('Export a Sudoku to the specified Format')
    .option('-p, --puzzle <file>', 'Puzzle File')
    .option('-o, --out <file>', 'Output File', allowMultiple)
    .addOption(new Option('-e, --engine <engine>', 'Puzzle Engine to export to').choices(exportEngines).makeOptionMandatory())
    .addOption(new Option('-f, --format <format>', 'Export Format').choices(exportFormats).makeOptionMandatory())
    .action(async (options: ExportOptions) => {

        options.puzzle = await requiredWithPipe('-p, --puzzle <file>', options.puzzle)

        console.error('show Command:', options)

        if (options.out === undefined) {
            console.log('output goes to stdout')
        } else {
            console.log('writing output to file')
        }
    })



type WatchOptions = {
    config?: string
    out?: string[]
    cache: boolean
    analyse?: string
    'analysis-out'?: string[]
    show?: typeof showEngines[number]
    'keep-around': boolean
    'export-engine'?: typeof exportEngines[number]
    'export-format'?: typeof exportFormats[number]
    'on-success'?: string[]
}

program
    .command('watch')
    .description('Watch for file changes in Config Files and regenerate, when changes are detected')
    .option('-c, --config <file>', 'Config File')
    .option('-o, --out <file>', 'Output File', allowMultiple)
    .option('-n, --no-cache', 'Disable creation and lookup of Cache Files', true)
    .option('-a, --analyse <file>', 'Analysis Config File')
    .option('-g, --analysis-out <file>', 'Analysis Output File', allowMultiple)
    .addOption(new Option('-s, --show <engine>', 'Puzzle Engine to start').choices(showEngines))
    .option('-k, --keep-around', 'Keep Window around after exiting the Process', false)
    .addOption(new Option('-e, --export-engine <engine>', 'Puzzle Engine to export to').choices(exportEngines))
    .addOption(new Option('-f, --export-format <format>', 'Export Format').choices(exportFormats))
    .option('-t, --on-success <command>', 'Run after successful Generation', allowMultiple)
    .action(async (options: WatchOptions) => {

        options.config = await requiredWithPipe('-c, --config <file>', options.config)

        if (options['analysis-out'] !== undefined && options.analyse === undefined)
            error('analysis-out Option requires analyse Option to be specified')

        if ((options['export-engine'] === undefined) != (options['export-format'] === undefined))
            error('export-engine and export-format must either both be specified or omitted')

        console.error('generate Command:', options)

        if ([
            options.out,
            options.analyse,
            options['analysis-out'],
            options.show,
            options['export-engine'],
            options['export-format']
        ].every((e) => e === undefined)) {
            console.log('output goes to stdout')
        } else {
            console.log('writing output to file')
        }
    })



type JsonSchemaOptions = {
    out?: string[]
}

program
    .command('json-schema')
    .description('Dump Json Schemas in the specified Directory')
    .option('-o, --out <dir>', 'Output Directory', allowMultiple)
    .action((options: JsonSchemaOptions) => {

        console.error('json-schema Command:', options)

        if (options.out === undefined) {
            console.log('output goes to stdout')
        } else {
            console.log('writing output to file')
        }
    })



type ClearCacheOptions = {
    'dry-run': boolean
}

program
    .command('clear-cache')
    .description('Clear all caches')
    .option('-d, --dry-run', 'Display Files that will be deleted, but don\'t delete anything', false)
    .action((options: ClearCacheOptions) => {

        console.error('clear-cache Command:', options)
    })



program.parse()