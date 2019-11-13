import { TokenFormatter } from './layout'
import { Tokenizer } from './tokenizer'


export class SqlFormatter {
    tokenizer = new Tokenizer()
    tokenFormatter = new TokenFormatter()
    format(query: string) {
        let tokens = this.tokenizer.tokenize(query)
        return this.tokenFormatter.formatTokens(tokens)
    }
}