import { Tokenizer } from './tokenizer'
import { DefaultTokenizerConfig, TokenizerConfig } from './tokenizer_config'
import { TokenFormatter } from './layout'
import { DefaultLayoutConfig } from './layout_config'

export class SqlFormatter {
    tokenizer = new Tokenizer(DefaultTokenizerConfig)
    tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
    format(query: string) {
        let tokens = this.tokenizer.tokenize(query)
        return this.tokenFormatter.formatTokens(tokens)
    }
}