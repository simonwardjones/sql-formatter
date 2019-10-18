import { Tokenizer } from './tokenizer'
import { DefaultTokenizerConfig } from './tokenizer_config'
import { TokenFormatter } from './layout'
import { DefaultLayoutConfig } from './layout_config'

export function hello(): string {
  const world = '🦓';
  return `Hello ${world}! `;
}


function listCurrentDefaultTokens() {
  console.log('Hello from ts, listing token kinds')
  new Tokenizer(DefaultTokenizerConfig).tokenTypes.forEach(x => console.log(x.name))
}

// const sqlExample = '$current_date select'

const sqlExample = `
select 
current_date::date, T.col1-T2.col1,
row_number() over (partition by t2.col2),
count(*) as col2,
count(*) as count,
/* test the 
block */
--fsd here is a comment
// and another -- lol
from database.table T
inner join database.table2 T2 on T.col1 = T2.col2
inner join "another"."fake"."example" XST on T.col1 = XST.name
where 1=1
and x >= 32
group by 1,2,3,4,5
having count < 120
`

function addExampleToBody(): void {
  var node = document.createElement("div");
  node.innerHTML = sqlExample;
  document.body.append(node);
}

function exampleDebug() {
  // debugging
  var divideBy = "#"
  console.log('debugging' + '\n' + divideBy.repeat(40) + '\n')
  var demoTokenizer = new Tokenizer(DefaultTokenizerConfig)
  var demoTokenFormatter = new TokenFormatter(DefaultLayoutConfig)
  console.log(demoTokenizer.tokens)
  var tokens = demoTokenizer.tokenize(sqlExample)
  // console.log(tokens)
  console.log(demoTokenFormatter.formatTokens(tokens))
}
exampleDebug()

// let fix = /^'(?:(?=([^\\']*))\1(?:[\\].|'')?)*'|^"(?:(?=([^\\"]*))\2(?:[\\].)?)*"|^\$\$.*?\$\$/
// this is a very efficient fix to back tracking