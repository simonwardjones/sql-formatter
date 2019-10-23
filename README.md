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
- [ ] Check word breaks after regexp e.g. `selectselect`
- [X] Add to npm

