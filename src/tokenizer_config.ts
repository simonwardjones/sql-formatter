export interface TokenizerConfig {
    ONE_LINE_COMMENT_SYMBOLS: string[]
    STRING_TYPES: StringType[]
    RESERVED_WORDS: string[]
}

export interface StringType {
    start: string
    end: string
    greedy?: boolean
    escapes?: string[]
    endEscapeEnd?: boolean // whether the end of the string can escape itself
}

export const DefaultTokenizerConfig: TokenizerConfig = {
    ONE_LINE_COMMENT_SYMBOLS: [
        '--',
        '//'
    ],
    STRING_TYPES: [
        { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true },
        { start: '"', end: '"', escapes: ['\\'] }, // move this to the indentifiers
        { start: '$$', end: '$$' }],
    RESERVED_WORDS: [
        'account',
        'all',
        'alter',
        'and',
        'any',
        'as',
        'between',
        'by',
        'case',
        'cast',
        'check',
        'column',
        'connection',
        'connect',
        'constraint',
        'create',
        'cross',
        'current_date',
        'current_timestamp',
        'current_time',
        'current_user',
        'current',
        'database',
        'delete',
        'distinct',
        'drop',
        'else',
        'exists',
        'false',
        'following',
        'for',
        'from',
        'full',
        'grant',
        'group',
        'gscluster',
        'having',
        'ilike',
        'increment',
        'inner',
        'insert',
        'intersect',
        'into',
        'in',
        'issue',
        'is',
        'join',
        'lateral',
        'left',
        'like',
        'localtimestamp',
        'localtime',
        'minus',
        'natural',
        'not',
        'null',
        'of',
        'on',
        'or',
        'order',
        'organization',
        'regexp',
        'revoke',
        'right',
        'rlike',
        'rows',
        'row',
        'sample',
        'schema',
        'select',
        'set',
        'some',
        'start',
        'tablesample',
        'table',
        'then',
        'to',
        'trigger',
        'true',
        'try_cast',
        'union',
        'unique',
        'update',
        'using',
        'values',
        'view',
        'whenever',
        'when',
        'where',
        'with'
    ]
}
