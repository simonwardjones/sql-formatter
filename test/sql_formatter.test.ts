import { expect } from 'chai';
import 'mocha';
import { SqlFormatter } from '../src/sql_formatter';

describe('test sqlFormatter', () => {
    it('should format miniaml select * query', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from schema.table'
        const result = sqlFormatter.format(query)
        const expected = "select\n" +
            "    *\n" +
            "from schema . table"
        expect(result).to.equal(expected)
    })

    it('should format minimal nested select * query', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select T.column1, T.column2 from (select * from schema.table) T'
        const result = sqlFormatter.format(query)
        const expected = "select\n" +
            "    t.column1,\n" +
            "    t.column2\n" +
            "from (\n" +
            "    select\n" +
            "        *\n" +
            "    from schema . table\n" +
            ") t"
        expect(result).to.equal(expected)
    })

    it('should format "and" and "or" within block parenthesis context', () => {
        const sqlFormatter = new SqlFormatter()
        // change settings to use block layout
        sqlFormatter.tokenFormatter.config.maxLineLength = 2
        sqlFormatter.tokenFormatter.config.minBlockLength = 2
        const query = "(true and (not not true or (true and 1=1)))"
        const result = sqlFormatter.format(query)
        const expected = "(\n" +
            "    true\n" +
            "    and (\n" +
            "        not not true\n" +
            "        or (\n" +
            "            true\n" +
            "            and 1 = 1\n" +
            "        )\n" +
            "    )\n" +
            ")"
        expect(result).to.equal(expected)
    })

    it('should write the first half formatted then write out raw tokens when erroring in tokenizer', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from (select \\ from schema.table)'
        const result = sqlFormatter.format(query)
        const expected = "select\n" +
            "    *\n" +
            "from (\n" +
            "    select\n" +
            "        \\ from schema.table)"
        expect(result).to.equal(expected)
    })

    it('should write the first half formatted then write out raw tokens when erroring in formatter', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from (select end from schema.table)'
        const result = sqlFormatter.format(query)
        const expected = "select\n" +
            "    *\n" +
            "from (\n" +
            "    select\n" +
            "        end from schema.table)"
        expect(result).to.equal(expected)
    })

    it('should format case statement as inline block if less than max line length', () => {
        const sqlFormatter = new SqlFormatter()
        const query = "case when 1 = 1 then 'likely' when 1 = 2 then 'unlikely' else 0 end "
        const result = sqlFormatter.format(query)
        const expected = "case when 1 = 1 then 'likely' when 1 = 2 then 'unlikely' else 0 end"
        expect(result).to.equal(expected)
    })

    it('should format case statement as block if more than max line length', () => {
        const sqlFormatter = new SqlFormatter()
        sqlFormatter.tokenFormatter.config.maxLineLength = 5
        const query = "case when 1 = 1 then 'likely' when 1 = 2 then 'unlikely' else 0 end "
        const result = sqlFormatter.format(query)
        const expected = "case\n" +
            "    when 1 = 1\n" +
            "        then 'likely'\n" +
            "    when 1 = 2\n" +
            "        then 'unlikely'\n" +
            "    else 0\n" +
            "end"
        expect(result).to.equal(expected)
    })

    it('should format case statement as inline if more than max line length but less than min block', () => {
        const sqlFormatter = new SqlFormatter()
        sqlFormatter.tokenFormatter.config.maxLineLength = 5
        sqlFormatter.tokenFormatter.config.minBlockLength = 100
        const query = "case when 1 = 1 then 'likely' when 1 = 2 then 'unlikely' else 0 end "
        const result = sqlFormatter.format(query)
        const expected = "case when 1 = 1 then 'likely' when 1 = 2 then 'unlikely' else 0 end"
        expect(result).to.equal(expected)
    })

    it('should format multile ctes with empty line between', () => {
        const sqlFormatter = new SqlFormatter()
        const query = `with sub_query1 as (select  one, two  from db.schema.table1 ),
        sub_query2 as (select three, four,five from db.schema.table1)
        select * from sub_query1 SQ1 inner join sub_query2 SQ2 on SQ1.one = SQ2.two`
        const result = sqlFormatter.format(query)
        const expected = "with sub_query1 as (\n" +
            "    select\n" +
            "        one,\n" +
            "        two\n" +
            "    from db.schema.table1\n" +
            "),\n\n" +
            "sub_query2 as (\n" +
            "    select\n" +
            "        three,\n" +
            "        four,\n" +
            "        five\n" +
            "    from db.schema.table1\n" +
            ")\n\n" +
            "select\n" +
            "    *\n" +
            "from sub_query1 sq1\n" +
            "inner join sub_query2 sq2\n" +
            "    on sq1.one = sq2.two"
        expect(result).to.equal(expected)
    })

    it('should format mulktiple nested queries', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from (select * from (select * from t.gdf) a) b where 1=1'
        const result = sqlFormatter.format(query)
        const expected = "select\n" +
            "    *\n" +
            "from (\n" +
            "    select\n" +
            "        *\n" +
            "    from (\n" +
            "        select\n" +
            "            *\n" +
            "        from t.gdf\n" +
            "    ) a\n" +
            ") b\n" +
            "where 1 = 1"
        expect(result).to.equal(expected)
    })
})
