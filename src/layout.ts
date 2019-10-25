import { LayoutConfig } from './layout_config'
import { Token, tokenNames } from './tokenizer'

export interface State {
    contextStack: Context[]
    contextDepth: number
    previousNonWhitespaceToken: Token | null
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
            contextDepth: 0,
            previousNonWhitespaceToken: null
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
            contextDepth: 0,
            previousNonWhitespaceToken: null
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
            if (this.tokenRequiresStack(token)) {
                console.log('hunting for end with line length character allowance')
            }
            this.writeToken(token)
            this.updateContext(token)
            this.updateState(token)
        }
        return this.formattedQuery
    }

    updateContext(token: Token) {
        for (let context of this.contexts) {
            if (token.value === context.contextStart) {
                console.log(`Adding context to stack ${context.name}`)
                this.state.contextDepth += 1
                this.state.contextStack.push(context)
            }
            else if (token.value === context.contextEnd && context.name != this.currentContext().name) {
                console.log(`WARNING - trying to open ${token.value} context before closing ${this.currentContext().name} context`)
                this.error = 1
            }
            else if (token.value === context.contextEnd) {
                console.log(`Closing context ${context.name}`)
                this.state.contextStack.pop()
            }
        }
    }
    tokenRequiresStack(token: Token) {
        return false
    }
    updateState(token: Token) {
        if (!(token.name === 'whitespace')) {
            this.state.previousNonWhitespaceToken = token
        }
    }
    writeToken(token: Token) {
        switch (token.name) {
            case tokenNames.RESERVED_WORDS:
                this.writeReservedWord(token)
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
    writeReservedWord(token: Token) {
        if (this.currentContext.name === 'GLOBAL_CONTEXT' || !this.state.previousNonWhitespaceToken) {
            this.formattedQuery += token.value + '\n'
        }
        else if (
            this.config.newLineReservedWords.includes(token.value) &&
            !(this.config.newLineReservedWords.includes(this.state.previousNonWhitespaceToken.value))
        ) {
            this.formattedQuery += '\n' + token.value + ' '
        } else {
            this.formattedQuery += token.value + ' '
        }
    }
}