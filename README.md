# sql-formatter
Configurable SQL formatter


# Instalation

```bash
npm install @simonwardjones/sql-formatter
```

# Usage

```javascript
var sql = require('@simonwardjones/sql-formatter');
tokenizer = new sql.Tokenizer(sql.DefaultTokenizerConfig)
console.log(tokenizer.tokenize('select * from schema.table'))
```

# Publish
> note this and install calls prepare from scripts

```bash
npm publish --access public .
```

# To DO
- [X] Add to npm `@simonwardjones/sql-formatter`
- [X] ~Use function of contexts for context depth~ N/A context depth not equal to contextStack lenght (inline contexts)
- [X] Check word breaks after regexp e.g. `selectselect` (added test case)
- [X] Get rid or sql block type !! not requred any more!
- [X] Fix when for case statement!
- [ ] change formatter lists to tokenizer (find them earlier, or at least handle in seperate functions)
- [ ] Fix or/and in BLOCK
- [ ] when error write the first half formatted then write out raw tokens
- [ ] Use contexts from config
- [ ] temporarily set the context to inline when clculating line length
- [ ] fix the case to only be on tokens that are allowed to change e.g. not strings
- [ ] Lots of test cases!

# Layout Rules

### general

Considerations:
 - Expressions should be indented (assuming we are in a query)
 - Key words like from shouldn't be

Rules:
    - top level words start new line at current depth e.g. select from
        - some of these demand a newline after as well, e.g. select
    - commas start new line with current depth + indent
    - commas should act differenetly in row number for example
    - tokens should write space before unless they are the first word.

### Parenthesis

Considerations:
 - mathematical grouping
 - sub queries 
 - functions e.g. count(*)

Rules:
 - write the open in the current context then push tokens to stack checking how long it is until close
    - if we meet a reserved word start writing the tokens as normal


### Commas 
Considerations:
 - order by numbers shouldn't start new row, words should.
 - partition by shouldn't start new row unless really long

### Reserved Words

Rules
 - If first newLineReservedWord just write