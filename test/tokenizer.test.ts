import { TokenType, oneLineComments, getStringRegexp, numericRegexp } from '../src/tokenizer';
import { DefaultTokenizerConfig, stringType } from '../src/tokenizer_config'
import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';


export const hello = () => 'Hello world!';
describe('Hello function', () => {

    it('should return hello world', () => {
        const result = hello();
        expect(result).to.equal('Hello world!');
    });

});


describe('one line comments tokenType', () => {

    it('should capture comments for --', () => {
        const ONE_LINE_COMMENT_TT = new TokenType('one_line_comment', oneLineComments(['--']))
        const comment = '-- this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });

    it('should capture comments for //', () => {
        const ONE_LINE_COMMENT_TT = new TokenType('one_line_comment', oneLineComments(['//']))
        const comment = '// this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });
});

describe('stringType regexp', () => {
    interface TestCase {
        description?: string
        value: string
        stringType: stringType
        expected?: string

    }
    const tests: TestCase[] = [
        {
            value: "'this is a string'",
            description: 'match basic single quote string',
            stringType: { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true }
        },
        {
            value: "'this is single quote a string'",
            description: 'match basic single quote string with empty escapes',
            stringType: { start: "'", end: "'", escapes: [] }
        },
        {
            value: "'simple single quote string'",
            description: 'match basic single quote string with no escapes',
            stringType: { start: "'", end: "'" }
        },
        {
            value: '"this is a double quote string"',
            description: 'match basic double quote string with no escapes',
            stringType: { start: '"', end: '"' }
        },
        {
            value: '$$this is a string$$',
            description: 'match basic dollar quote string with no escapes',
            stringType: { start: '$$', end: '$$' }
        },

        // let's get more tricky and put in escapes
        {
            value: '$$this is $ a string$$',
            description: 'don\'t escape with one of the end tokens',
            stringType: { start: '$$', end: '$$' }
        },
        {
            value: "'do not be greedy' even if you're hungry'",
            expected: "'do not be greedy'",
            description: 'stop at first end token',
            stringType: { start: "'", end: "'" }
        },
        {
            value: "'do be greedy' if told to'",
            description: 'stop at first end token',
            stringType: { start: "'", end: "'",  greedy: true }
        },
        {
            value: "'do be greedy\\' if '' you '''' \\\\ have \\\ escapes'''",
            description: 'stop at first end token unless escaped when greedy not set or false',
            stringType: { start: "'", end: "'", escapes: ['\\'], endEscapeEnd: true }
        },
        // needless example
        {
            value: "case when end end",
            expected: "case when end",
            description: 'stop at first end token',
            stringType: { start: "case", end: "end", escapes: ["'", '\\'] }
        },
        {
            value: "case end when end end",
            description: 'stop at first end token',
            stringType: { start: "case", end: "end", escapes: ["'", '\\'], greedy: true }
        }
    ]
    for (let test of tests) {
        let description = test.description ? test.description : ""
        test.expected = test.expected ? test.expected : test.value
        console.log(test.expected)
        description += ` - should mathch ${test.expected}`
        it(description, () => {
            const stringRegexp = getStringRegexp(test.stringType)
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
    const NUMERIC_TT = new TokenType('numeric', numericRegexp)
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