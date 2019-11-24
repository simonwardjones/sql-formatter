import { TokenFormatter } from './layout'
import { Tokenizer } from './tokenizer'


export class SqlFormatter {
    // helper class to tokenize and format
    tokenizer = new Tokenizer()
    tokenFormatter = new TokenFormatter()
    format(query: string) {
        let tokens = this.tokenizer.tokenize(query)
        return this.tokenFormatter.formatTokens(tokens)
    }
}