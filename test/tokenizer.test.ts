import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';
import { getStringRegexp, getStringsRegexp, identifierDotRegexpPart, identifierQuotedRegexpPart, identifierRegexp, numericRegexp, oneLineComments, tokenNames, TokenType } from '../src/tokenizer';
import { DefaultTokenizerConfig, StringType } from '../src/tokenizer_config';


export const hello = () => 'Hello world!';
describe('Hello function', () => {

    it('should return hello world', () => {
        const result = hello();
        expect(result).to.equal('Hello world!');
    });

});


describe('one line comments tokenType', () => {

    it('should capture comments for --', () => {
        const ONE_LINE_COMMENT_TT = new TokenType(tokenNames.ONE_LINE_COMMENT, oneLineComments(['--']))
        const comment = '-- this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });

    it('should capture comments for //', () => {
        const ONE_LINE_COMMENT_TT = new TokenType(tokenNames.ONE_LINE_COMMENT, oneLineComments(['//']))
        const comment = '// this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });
});


describe('StringType regexp', () => {
    interface TestCase {
        description?: string
        value: string
        StringType: StringType
        expected?: string

    }
    const tests: TestCase[] = [
        {
            value: "'this is a string'",
            description: 'match basic single quote string',
            StringType: { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true }
        },
        {
            value: "'this is single quote a string'",
            description: 'match basic single quote string with empty escapes',
            StringType: { start: "'", end: "'", escapes: [] }
        },
        {
            value: "'simple single quote string'",
            description: 'match basic single quote string with no escapes',
            StringType: { start: "'", end: "'" }
        },
        {
            value: '"this is a double quote string"',
            description: 'match basic double quote string with no escapes',
            StringType: { start: '"', end: '"' }
        },
        {
            value: '$$this is a string$$',
            description: 'match basic dollar quote string with no escapes',
            StringType: { start: '$$', end: '$$' }
        },

        // let's get more tricky and put in escapes
        {
            value: '$$this is $ a string$$',
            description: 'don\'t escape with one of the end tokens',
            StringType: { start: '$$', end: '$$' }
        },
        {
            value: "'do not be greedy' even if you're hungry'",
            expected: "'do not be greedy'",
            description: 'stop at first end token',
            StringType: { start: "'", end: "'" }
        },
        {
            value: "'do be greedy' if told to'",
            description: 'do not stop at first non escaped end token if greedy',
            StringType: { start: "'", end: "'", greedy: true }
        },
        {
            value: "'do be greedy\\' if '' you '''' \\\\ have \\ escapes'''",
            expected: "'do be greedy\\' if '' you '''",
            description: 'stop at first end token unless escaped when greedy ',
            StringType: { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true }
        },
        {
            value: "'do not be greedy\\' if '' you '''' \\\\ have \\\ escapes'''",
            expected: "'do not be greedy\\'",
            description: 'don\'t escape if told not to',
            StringType: { start: "'", end: "'", endEscapeEnd: true }
        },
        {
            value: "case when end end",
            expected: "case when end",
            description: 'stop at first end token',
            StringType: { start: "case", end: "end", }
        },
        {
            value: "case end when end end",
            description: 'stop at first end token',
            StringType: { start: "case", end: "end", greedy: true }
        }
    ]
    for (let test of tests) {
        let description = test.description ? test.description : ""
        test.expected = test.expected ? test.expected : test.value
        // console.log(test.expected)
        description += ` - should mathch ${test.expected}`
        it(description, () => {
            const stringRegexp = getStringRegexp(test.StringType)
            // console.log(stringRegexp)
            const result = test.value.match(stringRegexp)
            // console.log(result)
            expect(result).to.exist
            if (result) {
                expect(result[0]).to.equal(test.expected)
                // console.log(result[0])
            }
        })
    }
    it('should error if endChar palced in escapes', () => {
        expect(() => {
            getStringRegexp({ start: '"', end: '"', escapes: ['"'] })
        }
        ).to.throw()
    })
    it('should error if escape has lenght != 1', () => {
        expect(() => {
            getStringRegexp({ start: '"', end: '"', escapes: [''] })
        }
        ).to.throw()
    })
    it('should error if endEscapeEnd and end has lenght != 1', () => {
        expect(() => {
            getStringRegexp({ start: '"', end: 'SIMON', endEscapeEnd: true })
        }
        ).to.throw()
    })
    it('should error if greedy and escaped', () => {
        expect(() => {
            getStringRegexp({ start: '"', end: 'SIMON', escapes: ['\\'], greedy: true })
        }
        ).to.throw()
    })
    it('should error if greedy and endEscaped', () => {
        expect(() => {
            getStringRegexp({ start: '"', end: 'SIMON', endEscapeEnd: true, greedy: true })
        }
        ).to.throw()
    })
})


describe('getStringsRegexp', () => {
    it('should not hang!', () => {
        const stringsRegexp = getStringsRegexp(DefaultTokenizerConfig.STRING_TYPES)
        // console.log(stringsRegexp)
        let demo = `'This is a very long hanging example to check that it does not
        do catestrophic backtracking on when matching strings
        fdsfsfskjb isdb viubsd vbsdiubvousdb vusdbfovbsdo`.match(stringsRegexp)
    })
})

describe('identifier Regexp', () => {
    it('identifierQuotedRegexpPart should match double quotes identifiers', () => {
        const test_identifier = '"table.name"'
        const result = test_identifier.match(identifierQuotedRegexpPart)
        expect(result).is.not.null
        if (result) {
            expect(result[0]).to.equal(test_identifier)
        }
    })
    it('identifierDotRegexpPart should match dot identifiers', () => {
        const test_identifier = '"table.name"."column"'
        const result = test_identifier.match(identifierDotRegexpPart)
        // console.log(identifierDotRegexpPart)
        expect(result).is.not.null
        if (result) {
            expect(result[0]).to.equal(test_identifier)
        }
    })
    it('identifierRegexp should match full identifier example', () => {
        console.log(identifierRegexp)
        const test_identifier = '"schema21".table_2."column"'
        const result = test_identifier.match(identifierRegexp)
        expect(result).to.exist
        if (result) {
            expect(result[0]).to.equal(test_identifier)
        }
    })
    it('identifierRegexp should match full example with spaces', () => {
        const test_identifier = '"schema21" . table_2 . "column"'
        const result = test_identifier.match(identifierRegexp)
        expect(result).to.exist
        if (result) {
            expect(result[0]).to.equal(test_identifier)
        }
    })
    it('identifierRegexp should not match one unquotes identifier', () => {
        const test_identifier = 'table1'
        const result = test_identifier.match(identifierRegexp)
        expect(result).to.not.exist
    })
})


describe('numeric tokenType', () => {
    const example_numbers = [
        '15',
        '1.3459',
        '0.2',
        '123.',
        '15e-03',
        '1.234E2',
        '1.234E+2',
    ]
    const NUMERIC_TT = new TokenType(tokenNames.NUMERIC, numericRegexp)
    for (let example_numeric of example_numbers) {
        it(`should handle format like '${example_numeric}'`, () => {
            const result = NUMERIC_TT.eatToken(example_numeric)
            expect(result[1]).not.undefined
            if (result[1]) {
                expect(result[1].value).to.equal(example_numeric);
            }
        })
    }
    it('should not handle numbers preceding operator - let operator handle this', () => {
        const example_numeric = '-132.'
        const result = NUMERIC_TT.eatToken(example_numeric)
    })
})