import { expect } from 'chai';
import 'mocha';
import { TokenFormatter } from '../src/layout';
import { DefaultLayoutConfig } from '../src/layout_config';
import { TokenNames } from '../src/tokenizer'

describe('initialising TokenFormatter', () => {
    const tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
    tokenFormatter.formatTokens(
        [{ name: TokenNames.RESERVED_WORDS, value: 'select', length: 6 }]
    )
    it('should have starting context global')
})

describe('handling reserved words', () => {
    it('should write single token without new line', () => {
        const expected = 'select'
        const tokens = [
            { name: TokenNames.WHITESPACE, value: '\n', length: 1 },
            { name: TokenNames.RESERVED_WORDS, value: 'select', length: 6 }]
        const tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
        const result = tokenFormatter.formatTokens(tokens)
        console.log(result)
        expect(result).to.equal(expected)
    })
})