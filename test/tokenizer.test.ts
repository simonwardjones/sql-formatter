import { TokenType, oneLineComments, getStringRegexp } from '../src/tokenizer';
import { DefaultTokenizerConfig } from '../src/tokenizer_config'
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


describe('one line comments', () => {

    it('should capture comments for --', () => {
        const ONE_LINE_COMMENT_TT = new TokenType('one_line_comment', oneLineComments(DefaultTokenizerConfig.ONE_LINE_COMMENT_SYMBOLS))
        const comment = '-- this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });

    it('should capture comments for //', () => {
        const ONE_LINE_COMMENT_TT = new TokenType('one_line_comment', oneLineComments(DefaultTokenizerConfig.ONE_LINE_COMMENT_SYMBOLS))
        const comment = '// this is an example comment'
        const result = ONE_LINE_COMMENT_TT.eatToken(comment)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(comment);
        }
    });
});

describe('string comments', () => {
    it('should capture strings not stopping at escaped end', () => {
        const STRING_TT = new TokenType(
            'string',
            getStringRegexp(DefaultTokenizerConfig.STRING_TYPES))
        const string_example = '"capture\\" the\n full string"'
        const result = STRING_TT.eatToken(string_example)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(string_example);
        }
    })
    it('shouldn\'t ignore double escape', () => {
        const STRING_TT = new TokenType(
            'string',
            getStringRegexp(DefaultTokenizerConfig.STRING_TYPES))
        const string_example = '"capture\\\\" the full string"'
        const result = STRING_TT.eatToken(string_example)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal('"capture\\\\"');
        }
    })
    it('should ignore triple escape', () => {
        const STRING_TT = new TokenType(
            'string',
            getStringRegexp(DefaultTokenizerConfig.STRING_TYPES))
        const string_example = '"capture\\\\\\" the full string"'
        const result = STRING_TT.eatToken(string_example)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(string_example);
        }
    })
    it('should allow same string start as escape', () => {
        const STRING_TT = new TokenType(
            'string',
            getStringRegexp(DefaultTokenizerConfig.STRING_TYPES))
        const string_example = '"capture"" the full string"'
        const result = STRING_TT.eatToken(string_example)
        expect(result[1]).not.undefined
        if (result[1]) {
            expect(result[1].value).to.equal(string_example);
        }
    })
})