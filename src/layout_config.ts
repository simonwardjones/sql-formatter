export enum Case {
    LOWER = 'lower',
    UPPER = 'upper',
    CAMEL = 'camel',
    SNAKE = 'snake',
    KEBAB = 'kebab'
}

export interface LayoutConfig {
    indent: string;
    maxLineLength: number;
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
    indent: '    ',
    maxLineLength: 70,
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
        // 'then',
        'else',
        'when',
        'and',
    ],
    levelOneUnique:[
        'select',
    ],
    levelOneNonUnique: [
        'sum',
        'on',
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