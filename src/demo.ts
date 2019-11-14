import { Tokenizer } from './tokenizer'
import { TokenFormatter } from './layout'

function listCurrentDefaultTokens() {
  console.log('Hello from ts, listing token kinds')
  new Tokenizer().tokenTypes.forEach(x => console.log(x.name))
}

let sqlExample = `
select 
current_date::date, T.col1-T2.col1,
row_number() over (partition by t2.col2,t2.col3 order by tt.col3),
count(*) as col2,
case when t2.column > 34 then true when t2.column < 2 and t2.column > 0then false else 3 end as columnsss, 
count(*) as count,
--fsd here is a comment
// and another -- lol
from database.table T
inner join database.table2 T2 on T.col1 = T2.col2
inner join "another"."fake"."example" XST on T.col1 = XST.name
where 1=1
and x >= 32
group by one, two, three
having count < 120
`


function addExampleToBody(): void {
  var node = document.createElement("div");
  node.innerHTML = sqlExample;
  document.body.append(node);
}

function exampleTokenizer() {
  // debugging
  var divideBy = "#"
  console.log('debugging Tokenizer' + '\n' + divideBy.repeat(40) + '\n')
  var demoTokenizer = new Tokenizer()
  var demoTokenFormatter = new TokenFormatter()
  // console.log(demoTokenizer.tokenTypes.forEach(x => console.log(x.regexp, x.name)))
  let tokens = demoTokenizer.tokenize(sqlExample)
  // console.log(tokens)
  console.log(demoTokenFormatter.formatTokens(tokens))
  // let fix = /^'(?:(?=([^\\']*))\1(?:[\\].|'')?)*'|^"(?:(?=([^\\"]*))\2(?:[\\].)?)*"|^\$\$.*?\$\$/
  // this is a very efficient fix to back tracking
}
exampleTokenizer()
