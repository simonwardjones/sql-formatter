import { LayoutConfig } from './layout_config'
import { Token, tokenNames } from './tokenizer'

// export enum stateFlag {
//     AWAITING_START = 'AWAITING_START',
//     SELECT = "SELECT_CONTEXT"
// }

export interface State {
    contextStack: Context[]
    contextDepth: number
}

export interface Context {
    name: string
    contextStart: string
    contextEnd: string
    contextDependsOnMaxLineLenght: boolean
}

export const globalContext: Context = {
    name: 'GLOBAL_CONTEXT',
    contextStart: ';',
    contextEnd: ';',
    contextDependsOnMaxLineLenght: false
}

export class TokenFormatter {
    config: LayoutConfig
    formattedQuery: string
    state: State
    stacks: object
    contexts: Context[]
    error: number

    constructor(config: LayoutConfig) {
        this.error = 0
        this.config = config
        this.state = {
            contextStack: [globalContext],
            contextDepth: 0
        }
        this.formattedQuery = ''
        this.stacks = {}
        this.contexts = [globalContext,
            {
                name: 'SELECT_CONTEXT',
                contextStart: 'select',
                contextEnd: ';',
                contextDependsOnMaxLineLenght: false
            }]
    }

    reset() {
        this.state = {
            contextStack: [globalContext],
            contextDepth: 0
        }
        this.stacks = {}
    }

    currentContext(): Context {
        return this.state.contextStack.slice(-1)[0]
    }

    formatTokens(tokens: Token[]): string {
        for (let token of tokens) {
            token.value = token.value.toLowerCase() // case handeled when writing token
            if (this.error) {
                console.log('Error encountered writing tokens without formating')
                return tokens.map(token => token.value).join('')
            }
            this.updateContext(token)
            if (this.tokenRequiresStack(token)) {
                console.log('hunting for end with line length character allowance')
            }
            this.formattedQuery += this.writeToken(token)
        }
        return this.formattedQuery
    }

    updateContext(token: Token) {
        for (let context of this.contexts) {
            if (token.value == context.contextStart) {
                console.log(`Adding context to stack ${context.name}`)
                this.state.contextDepth += 1
                this.state.contextStack.push(context)
            }
            else if (token.value == context.contextEnd && context.name != this.currentContext().name) {
                console.log(`WARNING - trying to open ${token.value} context before closing ${this.currentContext().name} context`)
                this.error = 1
            }
            else if (token.value == context.contextEnd) {
                console.log(`Closing context ${context.name}`)
                this.state.contextStack.pop()
            }
        }
    }

    tokenRequiresStack(token: Token) {
        return false
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