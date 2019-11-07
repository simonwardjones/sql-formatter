import { LayoutConfig } from './layout_config'
import { Token, TokenNames } from './tokenizer'

export interface State {
    contextStack: Context[]
    contextDepth: number
    currentLineLength: number
    firstTokenOnLine: boolean
    lastToken: boolean
    currentSelectDepth: number
    previousNonWhitespaceToken: Token | undefined
    previousReservedWordToken: Token | undefined
}

enum ContextType {
    INLINE = 'inline', // no new line 
    BLOCK = 'block', // new line ended
    SUBQUERY = 'subquery', // similar to Block
    CTE = 'cte'
}

export enum ContextNames {
    PARENTHESIS_CONTEXT = 'parenthesis_context',
    CASE_CONTEXT = 'case_context'
}

export interface Context {
    // This is used to manage indentaion context
    name: ContextNames
    contextStart: string
    contextEnd: string
    contextDependsOnMaxLineLenght: boolean
    contextType?: ContextType | undefined
}

export function contextFactory(name: ContextNames): Context {
    switch (name) {
        case ContextNames.PARENTHESIS_CONTEXT:
            return {
                name: ContextNames.PARENTHESIS_CONTEXT,
                contextStart: '(',
                contextEnd: ')',
                contextDependsOnMaxLineLenght: true,
                contextType: undefined
            }
        case ContextNames.CASE_CONTEXT:
            return {
                name: ContextNames.CASE_CONTEXT,
                contextStart: 'case',
                contextEnd: 'end',
                contextDependsOnMaxLineLenght: true,
                contextType: ContextType.BLOCK
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
            currentSelectDepth: 0,
            previousNonWhitespaceToken: undefined,
            previousReservedWordToken: undefined
        }
        this.formattedQuery = ''
        this.contexts = [
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
            currentSelectDepth: 0,
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
            this.closeContext(token, token_index)
            const formattedToken = this.formatToken(token)
            this.formattedQuery += formattedToken
            this.openContext(token, token_index)
            this.updateState(token)
            if (this.error) {
                console.log('Error encountered writing tokens without formating')
                return this.tokens.map(token => token.value).join('')
            }
        }
        return this.formattedQuery.trim()
    }

    awaitingContextClose(): boolean {
        return this.state.contextDepth > 1
    }

    updateState(token: Token): void {
        // manage previousTokens updates
        if (!(token.name === TokenNames.WHITESPACE)) {
            this.state.previousNonWhitespaceToken = token
            this.state.firstTokenOnLine = false
        }
        if (token.name === TokenNames.RESERVED_WORDS) {
            this.state.previousReservedWordToken = token
        }

        let carryOver = this.formattedQuery.split('\n').slice(-1)[0]
        this.state.currentLineLength = carryOver.length
        if (carryOver.match(/[^ ]+/) !== null) {
            this.state.firstTokenOnLine = false
        } else {
            this.state.firstTokenOnLine = true
        }

        if (token.value === 'select' && !this.state.currentSelectDepth) {
            this.state.currentSelectDepth += 1
            if (this.state.currentSelectDepth === 1) {
                this.state.contextDepth += 1
            }
        }
    }

    openContext(token: Token, token_index: number): void {
        // here if the token can open a context we should look ahead and
        // see if we can do in in one line.
        for (let context of this.contexts) {
            // Handle context starts
            if (token.value === context.contextStart) {
                var context_for_stack = contextFactory(context.name)
                // first deal with errors
                // first deal with blocks
                if ((context_for_stack.contextDependsOnMaxLineLenght &&
                    this.requiresNewLine(token_index, context)) ||
                    !context_for_stack.contextDependsOnMaxLineLenght) {
                    // Add to the contextDepth, contextStack and refresh the currentLineLength
                    this.state.contextDepth += 1
                    if (this.state.previousNonWhitespaceToken &&
                        this.state.previousNonWhitespaceToken.value === 'as' &&
                        context_for_stack.name === ContextNames.PARENTHESIS_CONTEXT
                    ) {
                        context_for_stack.contextType = ContextType.CTE
                        this.formattedQuery += this.newLineCurrentDepth(0)
                    }
                    else if (this.state.previousNonWhitespaceToken &&
                        this.config.tablePrefixs.includes(this.state.previousNonWhitespaceToken.value) &&
                        context_for_stack.name === ContextNames.PARENTHESIS_CONTEXT
                    ) {
                        context_for_stack.contextType = ContextType.SUBQUERY
                        this.formattedQuery += this.newLineCurrentDepth(-1)
                    }
                    else {
                        context_for_stack.contextType = ContextType.BLOCK
                        this.formattedQuery += this.newLineCurrentDepth(0)
                    }
                    console.log(`Opening depth ${context_for_stack.name} of type ${context_for_stack.contextType}`)
                }
                // deal with inline
                else {
                    console.log(`Opening inline ${context.name}`)
                    context_for_stack.contextType = ContextType.INLINE
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
                }
                else if (context.name != closing_context.name) {
                    console.log(`WARNING - trying to close ${context.name} before closing ${closing_context.name}`)
                    this.error = 1
                }
                // close blocks
                else if (!(closing_context.contextType == ContextType.INLINE)) {
                    console.log(`Closing block context ${closing_context.name}`)
                    this.state.contextDepth -= 1
                    if (closing_context.contextType === ContextType.BLOCK) {
                        this.formattedQuery += this.newLineCurrentDepth(0)
                    }
                    else if (closing_context.contextType === ContextType.SUBQUERY ||
                        closing_context.contextType === ContextType.CTE
                    ) {
                        this.formattedQuery += this.newLineCurrentDepth(-1)
                        this.state.currentLineLength = (this.state.contextDepth - 1) * this.config.indent.length
                        this.state.currentSelectDepth -= 1
                        if (this.state.currentSelectDepth === 0) {
                            this.state.contextDepth -= 1
                        }
                    }
                    this.state.firstTokenOnLine = true
                }
                // close inline blocks
                else if (token.value === context.contextEnd) {
                    console.log(`Closing inline block`)
                }
            }
        }
        if (token.name === TokenNames.QUERY_SEPERATOR) {
            this.state.currentSelectDepth -= 1
            this.state.contextDepth -= 1
        }
    }

    requiresNewLine(token_index: number, context: Context): boolean {
        console.log(`looking ahead for conext ${context.name} to see if it fits on one line`)
        let lineLength = this.state.currentLineLength
        let level: number = 0
        let blockLength: number = 0
        for (let lookAhead = token_index; lookAhead < this.tokens.length; lookAhead++) {
            let lookAheadToken = this.tokens[lookAhead]
            if (lookAheadToken.name === TokenNames.WHITESPACE) {
                continue
            } else {
                lineLength += lookAheadToken.value.length + 1 // allowing 1 for whitespace
                blockLength += lookAheadToken.value.length + 1
            }

            if (this.tokenDemandsNewLine(lookAheadToken) ||
                (lineLength > this.config.maxLineLength &&
                    blockLength > this.config.minBlockLength)) {
                return true
            } else if (lookAheadToken.value === context.contextEnd) {
                if (level === 1) {
                    return false
                }
                level -= 1
            } else if (lookAheadToken.value === context.contextStart) {
                level += 1
            }
            // console.log(blockLength)
        }
        console.log(`Warning ${context.name} not closed before line length`)
        return true
    }

    tokenDemandsNewLine(token: Token): boolean {
        return [
            TokenNames.ONE_LINE_COMMENT,
            TokenNames.BLOCK_COMMENT,
            TokenNames.QUERY_SEPERATOR].includes(token.name) ||
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
                return this.formatOpenParenthesis(token)
            case TokenNames.CLOSE_PARENTHESIS:
                return this.formatCloseParenthesis(token)
            case TokenNames.QUERY_SEPERATOR:
                return this.formatQuerySeperator(token)
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
        let indent_repeat: number = this.state.contextDepth + shift >= 0 ? this.state.contextDepth + shift : 0
        return '\n' + this.config.indent.repeat(indent_repeat)
    }

    formatReservedWord(token: Token): string {
        if (token.value === 'on') {
            console.log('testing')
        }
        if (this.currentContext() &&
            this.currentContext().contextType === ContextType.INLINE) {
            return this.formatWord(token)
        }
        // handle top level words
        // They go at level -1 unless in parenthesis block
        if (this.config.levelOneUnique.includes(token.value) &&
            this.state.previousNonWhitespaceToken &&
            this.state.previousNonWhitespaceToken.name === TokenNames.CLOSE_PARENTHESIS) {
            // new line after cte
            return '\n' + this.newLineCurrentDepth(0) + token.value + this.newLineCurrentDepth(1)
        }
        else if (this.config.levelOneUnique.includes(token.value) &&
            this.state.currentSelectDepth === 0) {
            // first select
            return token.value + this.newLineCurrentDepth(1)
        }
        else if (this.config.levelOneUnique.includes(token.value) &&
            this.state.currentSelectDepth !== 0) {
            // sub query  select
            return token.value + this.newLineCurrentDepth(0)
        }
        else if (this.config.levelOneUnique.includes(token.value)) {
            return this.newLineCurrentDepth(-1) + token.value + this.newLineCurrentDepth(1)
        }
        // level one non unique
        if (
            this.config.levelOneNonUnique.includes(token.value) &&
            this.state.previousNonWhitespaceToken &&
            !(this.config.levelOneNonUnique.includes(this.state.previousNonWhitespaceToken.value))
        ) {
            if (this.currentContext() &&
                this.currentContext().name === ContextNames.PARENTHESIS_CONTEXT &&
                this.currentContext().contextType === ContextType.BLOCK &&
                !this.state.firstTokenOnLine) {
                return this.newLineCurrentDepth(0) + token.value
            }
            else if (this.currentContext() &&
                this.currentContext().contextType === ContextType.INLINE) {
                return this.formatWord(token)
            }
            else if (this.state.firstTokenOnLine) {
                return token.value
            }
            else {
                return this.newLineCurrentDepth(-1) + token.value
            }
        }
        // handle level two words
        else if (this.config.levelTwoNonUnique.includes(token.value) &&
            !this.state.firstTokenOnLine &&
            ((this.currentContext() &&
                !(this.currentContext().contextType === ContextType.INLINE)
            ) || !this.currentContext())) {
            return this.newLineCurrentDepth(0) + token.value
        }
        else {
            return this.formatWord(token)
        }
    }

    formatWord(token: Token): string {
        if (this.state.firstTokenOnLine ||
            (this.state.previousNonWhitespaceToken &&
                ['(', '::', ':'].includes(this.state.previousNonWhitespaceToken.value))) {
            return token.value
        }
        else {
            return ' ' + token.value
        }
    }

    formatComma(token: Token): string {
        if (this.currentContext() &&
            (this.currentContext().contextType === ContextType.INLINE)) {
            return ','
        }
        else if (
            this.state.previousNonWhitespaceToken &&
            this.state.previousNonWhitespaceToken.name === TokenNames.NUMERIC) {
            return ','
        }
        else if (this.state.currentSelectDepth !== 0) {
            return this.config.commaEnd ? ',' + this.newLineCurrentDepth(0) : this.newLineCurrentDepth(0) + ','
        }
        else {
            return this.config.commaEnd ? ',' + '\n' + this.newLineCurrentDepth(0) : '\n' + this.newLineCurrentDepth(0) + ','
        }
    }

    formatCloseParenthesis(token: Token): string {
        return ')'
    }

    formatOpenParenthesis(token: Token): string {
        if (this.state.previousNonWhitespaceToken &&
            ['count', 'sum', 'coalesce', 'min', 'timestamp_ntz', 'max', 'row_number', 'array_size'].includes(
                this.state.previousNonWhitespaceToken.value
            )) {
            return '('
        } else {
            return this.formatWord(token)
        }
    }

    formatComments(token: Token): string {
        if (this.state.previousNonWhitespaceToken &&
            [TokenNames.BLOCK_COMMENT, TokenNames.ONE_LINE_COMMENT].includes(
                this.state.previousNonWhitespaceToken.name) ||
            token.name === TokenNames.BLOCK_COMMENT) {
            // console.log(token)
            return this.newLineCurrentDepth(0) + token.value
        } else {
            return token.value
        }
    }

    formatQuerySeperator(token: Token): string {
        return this.newLineCurrentDepth(-1) + token.value + this.newLineCurrentDepth(-1)
    }

    formatOperator(token: Token): string {
        if (['/', '*'].includes(token.value) &&
            this.state.currentLineLength > this.config.maxLineLength) {
            return ' ' + token.value + this.newLineCurrentDepth(0)
        }
        else if (['::', ':'].includes(token.value)) {
            return token.value
        }
        else {
            return this.formatWord(token)
        }
    }

}

