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
    levelTwoNonUnique: string[];
    levelOneNonUnique: string[];
    commaEnd: boolean;
}

export const DefaultLayoutConfig: LayoutConfig = {
    indent: '    ',
    maxLineLength: 80,
    minBlockLength: 2,
    reservedWordCase: Case.LOWER,
    commaEnd: true,
    levelOneUnique: [
        // 'select',
    ],
    levelTwoNonUnique: [
        'on',
    ],
    levelOneNonUnique: [
        'else',
        'when',
        'select',
        'and',
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
        'or',
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