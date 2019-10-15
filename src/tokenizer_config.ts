export interface TokenizerConfig {
    ONE_LINE_COMMENT_SYMBOLS: string[]
    STRING_TYPES: string[]
    RESERVED_WORDS: string[]
}

export const DefaultTokenizerConfig: TokenizerConfig = {
    ONE_LINE_COMMENT_SYMBOLS: [
        '--',
        '//'
    ],
    STRING_TYPES: ["'", '"', '$$'],
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
