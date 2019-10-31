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
    INLINE = 'inline', // no new line 
    BLOCK = 'block', // new line ended
}

export enum ContextNames {
    SELECT_CONTEXT = 'select_context',
    PARENTHESIS_CONTEXT = 'parenthesis_context',
    CASE_CONTEXT = 'case_context'
}

export interface Context {
    // This is used to manage indentaion context
    name: ContextNames
    contextStart: string
    contextEnd: string
    contextDependsOnMaxLineLenght: boolean
    ContextType?: ContextType | undefined
}

export function contextFactory(name: ContextNames): Context {
    switch (name) {
        case ContextNames.PARENTHESIS_CONTEXT:
            return {
                name: ContextNames.PARENTHESIS_CONTEXT,
                contextStart: '(',
                contextEnd: ')',
                contextDependsOnMaxLineLenght: true,
                ContextType: undefined
            }
        case ContextNames.SELECT_CONTEXT:
            return {
                name: ContextNames.SELECT_CONTEXT,
                contextStart: 'select',
                contextEnd: ';',
                contextDependsOnMaxLineLenght: false,
                ContextType: ContextType.BLOCK
            }
        case ContextNames.CASE_CONTEXT:
            return {
                name: ContextNames.CASE_CONTEXT,
                contextStart: 'case',
                contextEnd: 'end',
                contextDependsOnMaxLineLenght: false,
                ContextType: ContextType.BLOCK
            }
    }
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
            contextFactory(ContextNames.SELECT_CONTEXT),
            contextFactory(ContextNames.PARENTHESIS_CONTEXT),
            contextFactory(ContextNames.CASE_CONTEXT),
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
        // manage previousTokens updates
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
            var context_for_stack = contextFactory(context.name)
            // Handle context starts
            if (token.value === context.contextStart) {
                if (this.state.inQuery){
                    continue
                }
                // first deal with errors
                if (this.currentContext() &&
                    this.currentContext().name === ContextNames.SELECT_CONTEXT &&
                    context.name === ContextNames.SELECT_CONTEXT) {
                    console.log(`WARNING - trying to open another ${context.name} without brackets`)
                    this.error = 1
                }
                // first deal with blocks
                else if ((context.contextDependsOnMaxLineLenght &&
                    this.requiresNewLine(token_index, context)) ||
                    !context.contextDependsOnMaxLineLenght) {
                    // Add to the contextDepth, contextStack and refresh the currentLineLength
                    // console.log(`Opening depth context ${context.name}`)
                    this.state.contextDepth += 1
                    context_for_stack.ContextType = ContextType.BLOCK
                    this.formattedQuery += this.newLineCurrentDepth(0)
                    this.state.currentLineLength = this.state.contextDepth * this.config.indent.length
                    this.state.firstTokenOnLine = true
                } // deal with inline 
                else {
                    // console.log(`Opening inline context ${context.name}`)
                    context_for_stack.ContextType = ContextType.INLINE
                }
                this.state.contextStack.push(context_for_stack)
            }
        }
    }

    closeContext(token: Token, token_index: number): void {
        for (let context of this.contexts) {
            // Handle context ends
            if (token.value === context.contextEnd) {
                // handle errors in closing first
                let closing_context = this.state.contextStack.pop()
                if (!closing_context) {
                    console.log(`WARNING - trying to close ${context.name} before opening`)
                    this.error = 1
                } else if (context.name != closing_context.name) {
                    console.log(`WARNING - trying to close ${context.name} context before closing ${closing_context.name}`)
                    this.error = 1
                    // close blocks
                } else if (!(closing_context.ContextType == ContextType.INLINE)) {
                    console.log(`Closing block context ${context.name}`)
                    this.state.contextDepth -= 1
                    this.formattedQuery += this.newLineCurrentDepth(0)
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
            // console.log(blockLength)
        }
        console.log(`Warning ${context.name} not closed`)
        return true
    }

    tokenDemandsNewLine(token: Token): boolean {
        return [
            TokenNames.ONE_LINE_COMMENT,
            TokenNames.BLOCK_COMMENT].includes(token.name) ||
            ['select'].includes(token.value)
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
                return this.formatWord(token)
            case TokenNames.CLOSE_PARENTHESIS:
                return this.formatCloseParenthesis(token)
            case TokenNames.NUMERIC:
                return this.formatWord(token)
            case TokenNames.OPERATOR:
                return this.formatWord(token)
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
        let indent_repeat: number = this.state.contextDepth + shift >= 0 ? this.state.contextDepth + shift : 0
        return '\n' + this.config.indent.repeat(indent_repeat)
    }

    formatReservedWord(token: Token): string {
        if (token.value === 'when') {
            console.log('testing_breakpoint')
        }
        // handle top level words
        // They go at level -1 unless in parenthesis block
        if (
            this.config.levelOneNonUnique.includes(token.value) &&
            this.state.previousNonWhitespaceToken &&
            !(this.config.levelOneNonUnique.includes(this.state.previousNonWhitespaceToken.value))
        ) {
            if (this.currentContext() &&
                this.currentContext().name === ContextNames.PARENTHESIS_CONTEXT &&
                this.currentContext().ContextType === ContextType.BLOCK) {
                return this.newLineCurrentDepth(0) + token.value
            }
            else if (this.currentContext() &&
                this.currentContext().ContextType === ContextType.INLINE) {
                return this.formatWord(token)
            }
            else {
                return this.newLineCurrentDepth(-1) + token.value
            }
        }
        // handle level two words
        else if (this.config.levelTwoNonUnique.includes(token.value) &&
            !this.state.firstTokenOnLine &&
            this.currentContext() &&
            !(this.currentContext().ContextType === ContextType.INLINE)) {
            return this.newLineCurrentDepth(0) + token.value
        }
        else {
            return this.formatWord(token)
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
        } else if (
            this.currentContext() &&
            this.currentContext().name === ContextNames.PARENTHESIS_CONTEXT &&
            this.currentContext().ContextType === ContextType.BLOCK) {
            return this.config.commaEnd ? ',' + this.newLineCurrentDepth(1) : this.newLineCurrentDepth(1) + ','
        }
        else {
            return this.config.commaEnd ? ',' + this.newLineCurrentDepth(0) : this.newLineCurrentDepth(0) + ','
        }
    }

    formatCloseParenthesis(token: Token): string {
        return ')'
    }

    formatComments(token: Token): string {
        if (this.state.previousNonWhitespaceToken &&
            [TokenNames.BLOCK_COMMENT, TokenNames.ONE_LINE_COMMENT].includes(
                this.state.previousNonWhitespaceToken.name)) {
            // console.log(token)
            return this.newLineCurrentDepth(0) + token.value
        } else {
            return token.value
        }
    }
}

