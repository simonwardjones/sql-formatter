import escapeRegExp from 'lodash/escapeRegExp';
import { StringType, TokenizerConfig } from './tokenizer_config';

export interface Token {
    name: tokenNames;
    value: string;
    length: number;
}

export enum tokenNames {
    RESERVED_WORDS = 'reserved_words',
    STRING = 'string',
    BLOCK_COMMENT = 'block_comment',
    ONE_LINE_COMMENT = 'one_line_comment',
    IDENTIFIER = 'identifier',
    WHITESPACE = 'whitespace',
    COMMA = 'comma',
    OPEN_PARENTHESIS = 'open_parenthesis',
    CLOSE_PARENTHESIS = 'close_parenthesis',
    NUMERIC = 'numeric',
    OPERATOR = 'operator',
    WORD = 'word',
    ERROR_TOKEN = 'error_token'
}

export class TokenType {
    name: tokenNames
    regexp: RegExp
    constructor(name: tokenNames, regexp: RegExp) {
        this.name = name
        this.regexp = regexp
    }
    eatToken(input: string): [string, Token | undefined] {
        var matches = input.match(this.regexp)
        if (matches) {
            return [input, {
                name: this.name,
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

export const numericRegexp = /^\d+\.?\d*([eE][+-]?\d+)?/
export const wordRegexp = /[\w_][\w$_0-9]*/i
export const startWordRegexp = /^[\w_][\w$_0-9]*/i
export const identifierQuotedRegexpPart = getStringRegexp({ start: '"', end: '"' })
export const identifierDotRegexpPart = new RegExp(
    '(' + identifierQuotedRegexpPart.source + '|' + wordRegexp.source + ')' +
    '(\\s*\\.\\s*(' + identifierQuotedRegexpPart.source + '|' + wordRegexp.source + '))+',
    'i')
export const identifierRegexp = new RegExp(
    '^(' + identifierDotRegexpPart.source + '|' + identifierQuotedRegexpPart.source + ')'
)

export function getStringRegexp(StringType: StringType): RegExp {
    if (StringType.greedy && (StringType.escapes || StringType.endEscapeEnd)) {
        throw "greedy only available when not using escapes or endEscape"
    }
    if (StringType.escapes || StringType.endEscapeEnd) {
        let escapeChars = ''
        let escapedEndChar = ''
        let escapePatterns = []
        if (StringType.escapes) {
            StringType.escapes.forEach((escape) => {
                if (escape.length != 1) {
                    throw "Escape must have length 1";
                }
                if (escape === StringType.end) {
                    console
                    throw "Please don't include end in escapes - use endEscapeEnd"
                }
            })
            escapeChars = StringType.escapes.map(escapeRegExp).join('')
            escapePatterns.push(`[${escapeChars}].`)
        }
        if (StringType.endEscapeEnd) {
            if (StringType.end.length > 1) {
                throw "end cannot be greater than 1 char when endEscapeEnd true"
            }
            escapedEndChar = escapeRegExp(StringType.end)
            escapePatterns.push(escapedEndChar.repeat(2))
        }
        return new RegExp(escapeRegExp(StringType.start) + // start with start tokem
            '(?:[^' + escapeChars + escapedEndChar + ']' + // match all except end and escapes
            '(?:' + escapePatterns.join('|') + ')?)*' + // match escape then end
            escapeRegExp(StringType.end))
    }
    const greedy_token = StringType.greedy ? '' : '?'
    return new RegExp(`${escapeRegExp(StringType.start)}.*${greedy_token}${escapeRegExp(StringType.end)}`)
}

export function getStringsRegexp(StringTypes: StringType[]): RegExp {
    const allStringTypes = StringTypes.map((StringType) => {
        return getStringRegexp(StringType).source
    }).join('|')
    // console.log(allStringTypes)
    const string_regexp = new RegExp('^(' + allStringTypes + ')', 'i')
    return string_regexp
}

export class Tokenizer {
    tokenTypes: TokenType[]
    tokens: Token[]
    error: number

    constructor(config: TokenizerConfig) {
        // Define the token types
        const RESERVED_WORDS_TT = new TokenType(tokenNames.RESERVED_WORDS, regexpFromWords(config.RESERVED_WORDS))
        const STRING_TT = new TokenType(tokenNames.STRING, getStringsRegexp(config.STRING_TYPES))
        const BLOCK_COMMENT = new TokenType(tokenNames.BLOCK_COMMENT, /^\/\*[\s\S]*\*\//)
        const ONE_LINE_COMMENT_TT = new TokenType(tokenNames.ONE_LINE_COMMENT, oneLineComments(config.ONE_LINE_COMMENT_SYMBOLS))
        const IDENTIFIER_TT = new TokenType(tokenNames.IDENTIFIER, identifierRegexp)
        const WHITESPACE_TT = new TokenType(tokenNames.WHITESPACE, /^\s+/)
        const COMMA_TT = new TokenType(tokenNames.COMMA, /^,/)
        const OPEN_PARENTHESIS_TT = new TokenType(tokenNames.OPEN_PARENTHESIS, /^\(/)
        const CLOSE_PARENTHESIS_TT = new TokenType(tokenNames.CLOSE_PARENTHESIS, /^\)/)

        const NUMERIC_TT = new TokenType(tokenNames.NUMERIC, numericRegexp)
        const OPERATOR_TT = new TokenType(tokenNames.OPERATOR, /^(\+|\-|\*|\/|%|=|!=|<>|>|>=|<|<=|::|\.)/)
        const WORD_TT = new TokenType(tokenNames.WORD, startWordRegexp)
        this.tokenTypes = [
            RESERVED_WORDS_TT,
            STRING_TT,
            BLOCK_COMMENT,
            ONE_LINE_COMMENT_TT,
            IDENTIFIER_TT,
            WHITESPACE_TT,
            COMMA_TT,
            OPEN_PARENTHESIS_TT,
            CLOSE_PARENTHESIS_TT,

            NUMERIC_TT,
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
                // console.log(this.tokens)
                token = undefined // Reset the token
                return remainingInput
            }
        }
        if (token === undefined) {
            console.log(`WARNING - not able to find token: ${remainingInput.slice(0, 1)}`)
            this.error = 1
            this.tokens.push({
                name: tokenNames.ERROR_TOKEN,
                value: remainingInput,
                length: remainingInput.length
            })
            return remainingInput
        }
        return remainingInput
    }
}
