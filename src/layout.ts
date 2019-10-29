import { LayoutConfig } from './layout_config'
import { Token, TokenNames } from './tokenizer'

export interface State {
    contextStack: Context[]
    contextDepth: number
    currentLineLength: number
    firstTokenOnLine: boolean
    lastToken: boolean
    previousNonWhitespaceToken: Token | undefined
    previousReservedWordToken: Token | undefined
}

enum ContextType {
    'INLINE', // no new line 
    'BLOCK', // new line ended
    'SUBQUERY'
}

export interface Context {
    // This is used to manage indentaion context
    name: string
    contextStart: string
    contextEnd: string
    contextDependsOnMaxLineLenght: boolean
    ContextType?: ContextType | undefined
}


export const parenthesisContext: Context = {
    name: 'PARENTHESIS_CONTEXT',
    contextStart: '(',
    contextEnd: ')',
    contextDependsOnMaxLineLenght: true,
    ContextType: undefined
}

export const selectContext: Context = {
    name: 'SELECT_CONTEXT',
    contextStart: 'select',
    contextEnd: 'from',
    contextDependsOnMaxLineLenght: false,
    ContextType: ContextType.BLOCK
}

export const caseContext: Context = {
    name: 'CASE_CONTEXT',
    contextStart: 'case',
    contextEnd: 'end',
    contextDependsOnMaxLineLenght: true,
    ContextType: ContextType.BLOCK
}

export class TokenFormatter {
    config: LayoutConfig
    tokens: Token[]
    formattedQuery: string
    state: State
    contexts: Context[]
    error: number

    constructor(config: LayoutConfig) {
        this.error = 0
        this.tokens = []
        this.config = config
        this.state = {
            contextStack: [],
            contextDepth: 0,
            currentLineLength: 0,
            firstTokenOnLine: true,
            lastToken: false,
            previousNonWhitespaceToken: undefined,
            previousReservedWordToken: undefined
        }
        this.formattedQuery = ''
        this.contexts = [
            parenthesisContext,
            selectContext,
            caseContext
        ]
    }

    reset(): void {
        this.tokens = []
        this.error = 0
        this.formattedQuery = ''
        this.state = {
            contextStack: [],
            contextDepth: 0,
            currentLineLength: 0,
            firstTokenOnLine: true,
            lastToken: false,
            previousNonWhitespaceToken: undefined,
            previousReservedWordToken: undefined
        }
    }

    formatTokens(tokens: Token[]): string {
        this.tokens = tokens // placing on class for convenience
        for (let token_index = 0; token_index < this.tokens.length; token_index++) {
            if (token_index === this.tokens.length - 1) {
                this.state.lastToken = true
            }
            const token = this.tokens[token_index]
            token.value = token.value.toLowerCase() // case handeled when writing token
            if (this.error) {
                console.log('Error encountered writing tokens without formating')
                return this.tokens.map(token => token.value).join('')
            }
            this.closeContext(token, token_index)
            const formattedToken = this.formatToken(token)
            this.formattedQuery += formattedToken
            this.updateState(token, token_index, formattedToken)
            this.openContext(token, token_index)
        }
        return this.formattedQuery.trim()
    }

    awaitingContextClose(): boolean {
        return this.state.contextDepth > 1
    }

    updateState(token: Token, token_index: number, formattedToken: string): void {
        // manage previousTokens
        if (!(token.name === TokenNames.WHITESPACE)) {
            this.state.previousNonWhitespaceToken = token
            this.state.firstTokenOnLine = false
        }
        if (token.name === TokenNames.RESERVED_WORDS) {
            this.state.previousReservedWordToken = token
        }
        // manage line length and first token online
        if (formattedToken.includes('\n')) {
            let carryOver = formattedToken.split('\n').slice(-1)[0]
            this.state.currentLineLength = carryOver.length
            if (carryOver.match(/[^ ]+/) === null) {
                // console.log('/', formattedToken, '/')
                this.state.firstTokenOnLine = true
            } else {
                this.state.firstTokenOnLine = false
            }
        } else {
            this.state.currentLineLength += token.length
        }
    }

    openContext(token: Token, token_index: number): void {
        // here if the token can open a context we should look ahead and
        // see if we can do in in one line.
        for (let context of this.contexts) {
            var context_for_stack = JSON.parse(JSON.stringify(context));
            // Handle context starts
            if (token.value === context.contextStart) {
                // first deal with blocks
                if ((context.contextDependsOnMaxLineLenght &&
                    this.requiresNewLine(token_index, context)) ||
                    !context.contextDependsOnMaxLineLenght) {
                    // when we realise we need a new line 
                    // Add to the contextDepth, contextStack and refresh the currentLineLength
                    this.state.contextDepth += 1
                    if (this.state.previousReservedWordToken &&
                        this.state.previousReservedWordToken.value === 'from') {
                        console.log(`Opening depth context ${context.name} type subquery`)
                        context_for_stack.ContextType = ContextType.SUBQUERY
                        this.formattedQuery += this.newLineCurrentDepth(0)
                    } else {
                        console.log(`Opening depth context ${context.name} type block`)
                        context_for_stack.ContextType = ContextType.BLOCK
                        this.formattedQuery += this.newLineCurrentDepth(0)
                    }
                    this.state.currentLineLength = this.state.contextDepth * this.config.indent.length
                    this.state.firstTokenOnLine = true
                } // deal with inline 
                else {
                    console.log(`Opening inline context ${context.name} type inline`)
                    context_for_stack.ContextType = ContextType.INLINE
                }
                this.state.contextStack.push(context_for_stack)
            }
        }
    }
    closeContext(token: Token, token_index: number): void {
        // here if the token can open a context we should look ahead and
        // see if we can do in in one line.
        for (let context of this.contexts) {
            // Handle context ends
            if (token.value === context.contextEnd) {
                // handle errors in closing first
                let closing_context = this.state.contextStack.pop()
                if (!closing_context) {
                    console.log(`WARNING - trying to close ${token.value} context before opening`)
                    this.error = 1
                } else if (context.name != closing_context.name) {
                    console.log(`WARNING - trying to close ${token.value} context before closing ${this.currentContext().name} context`)
                    this.error = 1
                    // close blocks
                } else if (!(closing_context.ContextType == ContextType.INLINE)) {
                    console.log(`Closing depth context ${context.name}`)
                    this.formattedQuery += this.newLineCurrentDepth(-1)
                    this.state.contextDepth -= 1
                    this.state.currentLineLength = this.state.contextDepth * this.config.indent.length
                    this.state.firstTokenOnLine = true
                }
                else if (token.value === context.contextEnd) {
                    console.log(`Closing inline block`)
                }
            }
        }
    }

    requiresNewLine(token_index: number, context: Context): boolean {
        console.log(`looking ahead for conext ${context.name} to see if it fits on one line`)
        let lineLength = this.state.currentLineLength
        let level: number = 0
        let blockLength: number = 0
        // let  = 0
        for (let lookAhead = token_index + 1; lookAhead < this.tokens.length; lookAhead++) {
            let lookAheadToken = this.tokens[lookAhead]
            if (this.tokenDemandsNewLine(lookAheadToken) ||
                (lineLength > this.config.maxLineLength &&
                    blockLength > this.config.minBlockLength)) {
                return true
            } else if (lookAheadToken.value === context.contextEnd) {
                if (level === 0) {
                    return false
                }
                level -= 1
            } else if (lookAheadToken.value === context.contextStart) {
                level += 1
            }
            lineLength += lookAheadToken.value.length
            blockLength += lookAheadToken.value.length
            console.log(blockLength)
        }
        console.log(`Warning ${context.name} not closed`)
        return true
    }

    tokenDemandsNewLine(token: Token): boolean {
        return [
            TokenNames.ONE_LINE_COMMENT,
            TokenNames.BLOCK_COMMENT].includes(token.name) ||
            this.config.levelOneNonUnique.includes(token.value)
    }

    currentContext(): Context {
        return this.state.contextStack.slice(-1)[0]
    }

    formatToken(token: Token): string {
        switch (token.name) {
            case TokenNames.RESERVED_WORDS:
                return this.formatReservedWord(token)
            case TokenNames.STRING:
                return this.formatWord(token)
            case TokenNames.BLOCK_COMMENT:
                return this.formatComments(token)
            case TokenNames.ONE_LINE_COMMENT:
                return this.formatComments(token)
            case TokenNames.IDENTIFIER:
                return this.formatWord(token)
            case TokenNames.IDENTIFIER:
                return this.formatWord(token)
            case TokenNames.WHITESPACE:
                return ''
            case TokenNames.COMMA:
                return this.formatComma(token)
            case TokenNames.OPEN_PARENTHESIS:
                return this.formatOpenParenthesis(token)
            case TokenNames.CLOSE_PARENTHESIS:
                return this.formatCloseParenthesis(token)
            case TokenNames.NUMERIC:
                return this.formatWord(token)
            case TokenNames.OPERATOR:
                return this.formatOperator(token)
            case TokenNames.WORD:
                return this.formatWord(token)
            case TokenNames.ERROR_TOKEN:
                return this.formatWord(token)
        }
    }

    currentDepth(): string {
        let indent_repeat = this.state.contextDepth
        return this.config.indent.repeat(indent_repeat)
    }

    newLineCurrentDepth(shift: number): string {
        let indent_repeat = this.state.contextDepth + shift >= 0 ? this.state.contextDepth + shift : 0
        return '\n' + this.config.indent.repeat(indent_repeat)
    }

    formatReservedWord(token: Token): string {
        // 1. Level one Uniue
        // 1.a if first on line already write with new line
        // 1.b if not first on line create new line and write with new line
        // 2 levelOneNonUnique
        // 2.a write new line and token unless previous token in group e.g. inner join
        // 2.b if already had newline before e.g. inner join just write as word
        // 3. levelTwoNonUnique new line and indent to bottom level unless already on new line??
        if (this.config.levelOneUnique.includes(token.value) &&
            this.state.firstTokenOnLine) {
            // console.log(token)
            // 1.a
            return token.value + this.newLineCurrentDepth(1)
        } else if (this.config.levelOneUnique.includes(token.value)) {
            // 1.b
            return this.newLineCurrentDepth(0) + token.value + this.newLineCurrentDepth(1)
        } else if (
            !this.state.firstTokenOnLine &&
            this.state.previousNonWhitespaceToken &&
            this.config.levelOneNonUnique.includes(token.value) &&
            !(this.config.levelOneNonUnique.includes(this.state.previousNonWhitespaceToken.value))
        ) {
            // 2.a
            console.log(token)
            return this.newLineCurrentDepth(0) + token.value
        } else if (
            this.config.levelTwoNonUnique.includes(token.value) &&
            !this.state.firstTokenOnLine) {
            // 3
            return this.newLineCurrentDepth(1) + token.value
        } else {
            // 2.b
            return this.formatWord(token)
        }
    }

    formatOperator(token: Token): string {
        if (['*', '::'].includes(token.value)) {
            return token.value
        }
        else {
            return ' ' + token.value
        }
    }
    formatWord(token: Token): string {
        if (this.state.firstTokenOnLine ||
            (this.state.previousNonWhitespaceToken &&
                this.state.previousNonWhitespaceToken.value === '(')) {
            return token.value
        }
        else {
            return ' ' + token.value
        }
    }

    formatComma(token: Token): string {
        if (this.currentContext() &&
            (this.currentContext().ContextType === ContextType.INLINE)) {
            return ','
        }
        else if (
            this.state.previousNonWhitespaceToken &&
            this.state.previousNonWhitespaceToken.name === TokenNames.NUMERIC) {
            return ','
        } else {
            return this.config.commaEnd ? ',' + this.newLineCurrentDepth(0) : this.newLineCurrentDepth(0) + ','
        }
    }

    formatOpenParenthesis(token: Token): string {
        // if (this.currentContext() &&
        //     this.currentContext().name === 'PARENTHESIS_CONTEXT' &&
        //     this.currentContext().ContextType === ContextType.INLINE) {
        //     return '('
        // } else if (this.currentContext() &&
        //     this.currentContext().name === 'PARENTHESIS_CONTEXT' &&
        //     this.currentContext().ContextType === ContextType.BLOCK) {
        //     return '('
        // } 
        // else if (this.currentContext() &&
        //     this.currentContext().name === 'PARENTHESIS_CONTEXT' &&
        //     this.currentContext().ContextType === ContextType.SUBQUERY) {
        //     return ' ('
        // } esle
        if (this.state.firstTokenOnLine) {
            return '('
        } else {
            // console.log(this.state, '|||')
            return ' ('
        }
    }

    formatCloseParenthesis(token: Token): string {
        // console.log(this.currentContext())
        if (this.currentContext() &&
            this.currentContext().ContextType === ContextType.INLINE) {
            return ')'
        } else if (this.currentContext() &&
            this.currentContext().ContextType === ContextType.BLOCK) {
            return ')' //this.newLineCurrentDepth(0) + 
        } else if (this.currentContext() &&
            this.currentContext().ContextType === ContextType.SUBQUERY) {
            return ')' //this.newLineCurrentDepth(0) + 

        } else {
            return ')' //this.newLineCurrentDepth(0)
        }
    }
    formatComments(token: Token): string {
        if (this.state.previousNonWhitespaceToken &&
            [TokenNames.BLOCK_COMMENT, TokenNames.ONE_LINE_COMMENT].includes(
                this.state.previousNonWhitespaceToken.name)) {
                    console.log(token)
            return this.newLineCurrentDepth(0) + token.value
        } else {
            return token.value
        }
    }
}

