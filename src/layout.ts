import { LayoutConfig, DefaultLayoutConfig } from './layout_config'
import { Token, tokenNames } from './tokenizer'

export enum stateFlag {
    AWAITING_START = 'AWAITING_START'
}
export interface State {
    indentLevel: number
    topLevel: stateFlag
}

export class TokenFormatter {
    config: LayoutConfig
    formattedQuery: string
    State: State

    constructor(config: LayoutConfig) {
        this.config = config
        this.State = {
            indentLevel: 0,
            topLevel: stateFlag.AWAITING_START
        }
        this.formattedQuery = ''
    }
    formatTokens(tokens: Token[]): string {
        for (let token of tokens) {
            this.formattedQuery += this.writeToken(token)
        }
        return this.formattedQuery
    }
    writeToken(token: Token): string {
        switch (token.name) {
            case tokenNames.RESERVED_WORDS:
                if (this.config.newLineReservedWords.includes(token.value)) {
                    return token.value + '\n'
                }
                return token.value
            case tokenNames.STRING:
                return token.value
            case tokenNames.BLOCK_COMMENT:
                return token.value
            case tokenNames.ONE_LINE_COMMENT:
                return token.value
            case tokenNames.IDENTIFIER:
                return token.value
            case tokenNames.IDENTIFIER:
                return token.value
            case tokenNames.WHITESPACE:
                return ''
            case tokenNames.COMMA:
                return this.config.commaEnd ? ',\n' : '\n,'
            case tokenNames.OPEN_PARENTHESIS:
                return token.value
            case tokenNames.CLOSE_PARENTHESIS:
                return token.value
            case tokenNames.NUMERIC:
                return token.value
            case tokenNames.OPERATOR:
                return token.value
            case tokenNames.WORD:
                return token.value
            case tokenNames.ERROR_TOKEN:
                return token.value
        }
    }
}