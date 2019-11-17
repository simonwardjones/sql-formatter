# sql-formatter
Configurable SQL formatter


# Instalation

```bash
npm install @simonwardjones/sql-formatter
```

# Usage

```javascript
var sql = require('@simonwardjones/sql-formatter');
tokenizer = new sql.Tokenizer()
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
- [X] Get rid or sql block type - not requred any more!
- [X] Fix when for case statement!
- [X] Handle in key word levels in different functions
- [X] Fix or/and in BLOCK
- [X] When error write the first half formatted then write out raw tokens
- [X] Don't lower comments or strings
- [X] Move all examples from demo to test cases
- [X] ~Use contexts from config~ Can't think why I said that
- [X] Calculate the exact line length
- [X] Move functions to config for open parenthesis layout
- [ ] Enable capitalisation of alias
- [ ] Implement key word cases
- [ ] parametrise some things and, on, nl after from or select
- [ ] Update comments and README with detail on logic and rules

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