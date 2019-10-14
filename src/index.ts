const world = '🦓';
import { TokenTypes } from './tokenizer'

export function hello(word: string = world): string {
  return `Hello ${world}! `;
}

console.log('Hello from ts, listing token kinds')
TokenTypes.forEach(x => console.log(x.kind))

function addExampleToBody(): void {
  const sqlExample = `
  select T.column1 as col, 
  sum(T.column2) as 
  col2 from demo_sb.table T
  `
  var node = document.createElement("div");
  node.innerHTML = sqlExample;
  document.body.append(node);
}



