import { expect } from 'chai';
import 'mocha';
import { TokenFormatter } from '../src/layout';
import { DefaultLayoutConfig } from '../src/layout_config';
import { TokenNames } from '../src/tokenizer'

describe('initialising TokenFormatter', () => {
    const tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
    it('should have starting context global', () => {
        expect(tokenFormatter.currentContext().name).to.equal('GLOBAL_CONTEXT')
    })
})

describe.only('handling reserved words', () => {
    it('should write token and new line if in global context', () => {
        const expected = 'select\n'
        const tokens = [
            { name: TokenNames.WHITESPACE, value: '\n', length: 1 },
            { name: TokenNames.RESERVED_WORDS, value: 'select', length: 6 }]
        const tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
        const result = tokenFormatter.formatTokens(tokens)
        console.log(result)
        expect(result).to.equal(expected)
    })
    it('should write newline token and space unless inner join or equivalent')
    it('should the reservered words as all other words')
})


// select * from (select * from (select * from table)x)a