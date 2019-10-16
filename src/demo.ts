import { DefaultTokenizerConfig } from './tokenizer_config'
import { Tokenizer } from './tokenizer'

export function hello(): string {
  const world = '🦓';
  return `Hello ${world}! `;
}


function listCurrentDefaultTokens() {
  console.log('Hello from ts, listing token kinds')
  new Tokenizer(DefaultTokenizerConfig).tokenTypes.forEach(x => console.log(x.kind))
}

const sqlExample = `
select T.column1 as col, 
count(*),
$current_date::date,
489c ehr hw.';.[.\[.\[;/.'.\'.]]]
--fsd here is a comment
// and another -- lol
col2 from demo_sb.table T
inner join "another"."fake"."example"
where 1=1
and x >= 32
where 'this is a

-- string,'`

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
  console.log(demoTokenizer.tokens)
  console.log(demoTokenizer.tokenize(sqlExample))

}
exampleDebug()