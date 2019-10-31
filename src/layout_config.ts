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
    levelTwoNonUnique: string[];
    levelOneNonUnique: string[];
    commaEnd: boolean;
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
    maxLineLength: 40,
    minBlockLength: 2,
    reservedWordCase: Case.LOWER,
    commaEnd: true,
    levelTwoNonUnique: [
        'or',
        'and',
        // 'then',
        'else',
        'when',
    ],
    levelOneNonUnique: [
        'on',
        'select',
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