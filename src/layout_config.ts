export enum Case {
    LOWER = 'lower',
    UPPER = 'upper',
    CAMEL = 'camel',
    SNAKE = 'snake',
    KEBAB = 'kebab'
}

export interface LayoutConfig {
    maxLineLength: number;
    indent: string;
    minBlockLength: number;
    reservedWordCase: Case;
    levelOneUnique: string[];
    levelOneNonUnique: string[];
    levelTwoNonUnique: string[];
    commaEnd: boolean;
    tablePrefixs: string[]
}

export const tablePrefixs = [
    'update',
    'from',
    'join',
    'into',
    'table',
]

export const DefaultLayoutConfig: LayoutConfig = {
    maxLineLength: 20,
    indent: '    ',
    minBlockLength: 20,
    reservedWordCase: Case.LOWER,
    commaEnd: true,
    tablePrefixs: [
        'update',
        'from',
        'join',
        'into',
        'table',
        'as'
    ],
    levelTwoNonUnique: [
        'or',
        'then',
        'else',
        'and',
        'on',
    ],
    levelOneUnique:[
        'select',
    ],
    levelOneNonUnique: [
        'when',
        'sum',
        'with',
        'alter',
        'cross',
        'delete',
        'from',
        'group',
        'having',
        'inner',
        'insert',
        'intersect',
        'join',
        'limit',
        'left',
        'order',
        'outer',
        'right',
        'set',
        'union',
        'update',
        'values',
        'where',
    ]
}