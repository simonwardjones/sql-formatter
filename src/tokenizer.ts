import { TokenizerConfig, DefaultTokenizerConfig, stringType } from './tokenizer_config'
import escapeRegExp from 'lodash/escapeRegExp';

export interface Token {
    type: string;
    value: string;
    length: number;
}

export class TokenType {
    kind: string
    regexp: RegExp
    constructor(kind: string, regexp: RegExp) {
        this.kind = kind
        this.regexp = regexp
    }
    eatToken(input: string): [string, Token | undefined] {
        var matches = input.match(this.regexp)
        if (matches) {
            return [input, {
                type: this.kind,
                value: matches[0],
                length: matches[0].length,
            }]
        }
        return [input, undefined]
    }
}

export function regexpFromWords(words: string[]): RegExp {
    return RegExp('^(' + words.join('|') + ')', 'i')
}
export function oneLineComments(starters: string[]) {
    return new RegExp('^(' + starters.join('|') + ').*', 'i')
}

export const wordRegexp = /[\w_][\w$_]*/i
export const startWordRegexp = /^[\w_][\w$_]*/i

export const identifierRegexpPart = getStringRegexp({ start: '"', end: '"' })
export const identifierRegexp = new RegExp(
    '(' + identifierRegexpPart.source + '|^' + wordRegexp.source + ')\\.' +
    '(' + identifierRegexpPart.source + '|' + wordRegexp.source + ')*',
    'i')

export const numericRegexp = /\d+\.?\d*([eE][+-]?\d+)?/
// stringType.escapes.length > 0
export function getStringRegexp(stringType: stringType): RegExp {
    const greedy_token = stringType.greedy ? '' : '?'
    if (stringType.escapes || stringType.endEscapeEnd) {
        let escapeChars = ''
        let escapedEndChar = ''
        let escapePatterns = []
        if (stringType.escapes) {
            stringType.escapes.forEach((escape) => {
                if (escape.length != 1) {
                    throw "Escape must have length 1";
                }
                if (escape == stringType.end) {
                    console
                    throw "Please don't include end in escapes - use endEscapeEnd"
                }
            })
            escapeChars = stringType.escapes.map(escapeRegExp).join('')
            escapePatterns.push(`[${escapeChars}].`)
        }
        if (stringType.endEscapeEnd) {
            if (stringType.end.length > 1) {
                throw "end cannot be greater than 1 char when endEscapeEnd true"
            }
            escapedEndChar = escapeRegExp(stringType.end)
            escapePatterns.push(escapedEndChar.repeat(2))
        }
        return new RegExp('^' + escapeRegExp(stringType.start) + // start with start tokem
            '([^' + escapeChars + escapedEndChar + ']*' + greedy_token + // match all except end and escapes
            '(?:' + escapePatterns.join('|') + ')*)*' + greedy_token + // match escape then end
            escapeRegExp(stringType.end))
    }
    return new RegExp(`^${escapeRegExp(stringType.start)}.*${greedy_token}${escapeRegExp(stringType.end)}`)
}

export function getStringsRegexp(stringTypes: stringType[]): RegExp {
    const allStringTypes = stringTypes.map((stringType) => {
        return getStringRegexp(stringType).source
    }).join('|')
    // console.log(allStringTypes)
    const string_regexp = new RegExp(allStringTypes, 'i')
    return string_regexp
}

export class Tokenizer {
    tokenTypes: TokenType[]
    tokens: Token[]
    error: number

    constructor(config: TokenizerConfig) {
        // Define the token types
        const ONE_LINE_COMMENT_TT = new TokenType('one_line_comment', oneLineComments(config.ONE_LINE_COMMENT_SYMBOLS))
        const BLOCK_COMMENT = new TokenType('block_comment', /\/\*.*\*\//)
        const WHITESPACE_TT = new TokenType('whitespace', /^(\s+)/)
        const COMMA_TT = new TokenType('comma', /^,/)
        const OPEN_PARENTHESIS_TT = new TokenType('open_parenthesis', /^\(/)
        const CLOSE_PARENTHESIS_TT = new TokenType('close_parenthesis', /^\)/)
        const STRING_TT = new TokenType('string', getStringsRegexp(config.STRING_TYPES))
        const NUMERIC_TT = new TokenType('numeric', numericRegexp)
        const RESERVED_WORDS_TT = new TokenType('reserved_words', regexpFromWords(config.RESERVED_WORDS))
        const IDENTIFIER_TT = new TokenType('identifier', identifierRegexp)
        const OPERATOR_TT = new TokenType('operator', /^(\+|\-|\*|\/|%|=|!=|<>|>|>=|<|<=|::|\.)/)
        const WORD_TT = new TokenType('word', startWordRegexp)
        this.tokenTypes = [
            ONE_LINE_COMMENT_TT,
            WHITESPACE_TT,
            COMMA_TT,
            OPEN_PARENTHESIS_TT,
            CLOSE_PARENTHESIS_TT,
            STRING_TT,
            RESERVED_WORDS_TT,
            IDENTIFIER_TT,
            OPERATOR_TT,
            WORD_TT]
        this.tokens = []
        this.error = 0
    }

    tokenize(input: string): Token[] {
        this.tokens = []
        while (input.length) {
            if (this.error) {
                return this.tokens
            }
            input = this.eatToken(input)
            // console.log('input now: !' + input + '!')
        }
        console.log('Eaten all the input')
        return this.tokens
    }

    eatToken(input: string): string {
        let remainingInput: string = input
        let token: Token | undefined
        for (let tokenType of this.tokenTypes) {
            [remainingInput, token] = tokenType.eatToken(remainingInput)
            if (token) {
                this.tokens.push(token)
                remainingInput = remainingInput.slice(token.length)
                // console.log('Eaten a token of type ' + token.type + '\nvalue: ' + token.value)
                // console.log(token.value)
                // console.log(remainingInput)
                token = undefined // Reset the token
                return remainingInput
            }
        }
        if (token === undefined) {
            console.log(`WARNING - not able to find token: ${remainingInput.slice(0, 1)}`)
            this.error = 1
            this.tokens.push({
                type: 'error_token',
                value: remainingInput,
                length: remainingInput.length
            })
            return remainingInput
        }
        return remainingInput
    }
}
