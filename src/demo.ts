import { Tokenizer } from './tokenizer'
import { DefaultTokenizerConfig } from './tokenizer_config'
import { TokenFormatter } from './layout'
import { DefaultLayoutConfig, tablePrefixs } from './layout_config'

export function hello(): string {
  const world = '🦓';
  return `Hello ${world}! `;
}

function listCurrentDefaultTokens() {
  console.log('Hello from ts, listing token kinds')
  new Tokenizer().tokenTypes.forEach(x => console.log(x.name))
}

let sqlExample = `
select 
current_date::date, T.col1-T2.col1,
row_number() over (partition by t2.col2,t2.col3 order by tt.col3),
count(*) as col2,
case when t2.column > 34 then true when t2.column < 2 and    t2.column > 0then false else 3 end as columnsss, 
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
sqlExample=`select tablename.* from (select * from tablename.tablename) table`
sqlExample='select ((23746209837864023741-22378429387659723856)/5)'
sqlExample=' ((234023741-22378429387659723856)/9834754723015)'
// sqlExample=`insert all
// when n1 > 100 then
//   into t1
// when n1 > 10 then
//   into t1
//   into t2
// else
//   into t2
// select n1 from src;`
sqlExample='select * from (select * from (select * from t.gdf) a) b where 1=1'
// sqlExample=')'
// sqlExample='select t.column'
sqlExample=`create or replace table uk.ab_test.info copy grants as with test_variant_daily_users as ( select replace(UE.event_properties:test_name,'"','') as toggle, UE.event_properties:test_variant as variant, UE.event_time::date as date, min(UE.event_time::timestamp_ntz) as launch_date, max(UE.event_time::timestamp_ntz) as ended_at, count(*) as users from uk.amplitude_users.user_entered_ab_test UE group by 1,2,3 ), test_daily_users as ( select VDU.toggle, VDU.date, max(VDU.launch_date) as launch_date, min(VDU.ended_at) as ended_at, count(distinct VDU.variant) as variants, ( sum(case when VDU.variant not ilike 'control' and VDU.variant not ilike 'txn_usr_msg_messagefromdealer_v2_uk' then VDU.users end) / sum(case when VDU.variant ilike 'control' or VDU.variant ilike 'txn_usr_msg_messagefromdealer_v2_uk' then VDU.users end) ) as variant_ratio, sum(VDU.users) as users from test_variant_daily_users VDU where VDU.users > 10 group by 1,2 ), amplitude_test_info as ( select 'uk' as country, DU.toggle, max(DU.variants) as variants, min(DU.launch_date) as launch_date, max(DU.ended_at) as ended_at, 'amplitude' as source, current_timestamp as updated_at from test_daily_users DU where 1=1 and DU.variants > 1 and ((DU.variant_ratio > 0.3 and DU.variant_ratio <= 8) or DU.toggle ilike 'ab_leasing_budget_filter') group by 1,2 ), split_test_info as ( select 'uk' AS country, ST.name as toggle, array_size(ST.variants) AS variants, ST.started_at::TIMESTAMP_NTZ(9) as launch_date, coalesce(ST.ended_at, current_timestamp)::TIMESTAMP_NTZ(9) AS ended_at, 'internal' AS source, current_timestamp as updated_at from quotes_site.split_tests ST left join amplitude_test_info ATI on ATI.toggle = ST.name where 1=1 and ST.variants is not null and ATI.toggle is null order by ST.ended_at desc ) select * from amplitude_test_info union select * from split_test_info /* The ratio filter is to exclude days / users where the test has been rolled out into one variant, and therefore is no longer an actual test */ ;;; grant select on uk.ab_test.info to role read_only;`

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
