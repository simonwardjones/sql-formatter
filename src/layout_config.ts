export enum Case {
    LOWER = 'lower',
    UPPER = 'upper',
    CAMEL = 'camel',
    SNAKE = 'snake',
    KEBAB = 'kebab'
}

export interface LayoutConfig {
    indent: string;
    reservedWordCase: Case;
    newLineReservedWords: string[];
    commaEnd: boolean;
}

export const DefaultLayoutConfig: LayoutConfig = {
    indent: ' ',
    reservedWordCase: Case.LOWER,
    commaEnd: true,
    newLineReservedWords: [
        'and',
        'alter',
        'cross',
        'delete',
        'else',
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
        'select',
        'set',
        'union',
        'update',
        'values',
        'where',
    ]
}