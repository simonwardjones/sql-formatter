export enum Case {
    LOWER = 'lower',
    UPPER = 'upper',
    CAMEL = 'camel',
    SNAKE = 'snake',
    KEBAB = 'kebab'
}

export interface LayoutConfig {
    indent?: string;
    reservedWordCase?: Case;
    params?: Object;
}

export const DefaultLayoutConfig: LayoutConfig = {
    indent: ' ',
    reservedWordCase: Case.LOWER
}

