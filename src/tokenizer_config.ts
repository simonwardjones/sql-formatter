export interface TokenizerConfig {
    ONE_LINE_COMMENT_SYMBOLS: string[]
    STRING_TYPES: stringType[]
    RESERVED_WORDS: string[]
}

export interface stringType {
    start: string
    end: string
    greedy?: boolean
    escapes?: string[],
    endEscapeEnd?: boolean // whether the end of the string can escape itself
}

export const DefaultTokenizerConfig: TokenizerConfig = {
    ONE_LINE_COMMENT_SYMBOLS: [
        '--',
        '//'
    ],
    STRING_TYPES: [
        { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true, greedy:true },
        { start: '"', end: '"', escapes: ['\\'] }, // move this to the indentifiers
        { start: '$$', end: '$$'}],
    RESERVED_WORDS: [
        "all",  // ansi reserved words
        "alter",
        "and",
        "any",
        "as",
        "between",
        "by",
        "check",
        "column",
        "connect",
        "copy",
        "create",
        "current",
        "delete",
        "distinct",
        "drop",
        "else",
        "exists",
        "for",
        "from",
        "grant",
        "group",
        "having",
        "in",
        "insert",
        "intersect",
        "into",
        "is",
        "like",
        "not",
        "null",
        "of",
        "on",
        "or",
        "order",
        "revoke",
        "row",
        "rows",
        "sample",
        "select",
        "set",
        "start",
        "table",
        "then",
        "to",
        "trigger",
        "union",
        "unique",
        "update",
        "values",
        "whenever",
        "where",
        "with",
        "regexp", "rlike", "some",  // snowflake reserved words
        "minus", "increment",  // oracle reserved words
    ]

}
