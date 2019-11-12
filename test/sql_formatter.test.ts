import { expect } from 'chai';
import 'mocha'
import { SqlFormatter } from '../src/sql_formatter'

describe.only('test sqlFormatter', () => {
    it('should format miniaml select * query', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from schema.table'
        const result = sqlFormatter.format(query)
        // console.log(result)
        const expected = "select\n" +
            "    *\n" +
            "from schema . table"
        expect(result).to.equal(expected)
    })
    it('should format minimal nested select * query', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select T.column1, T.column2 from (select * from schema.table) T'
        const result = sqlFormatter.format(query)
        // console.log(result)
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
    it('should write the first half formatted then write out raw tokens when erroring', () => {
        const sqlFormatter = new SqlFormatter()
        const query = 'select * from schema.table'
        const result = sqlFormatter.format(query)
        // console.log(result)
        const expected = "select\n" +
            "    *\n" +
            "from schema . table"
        expect(result).to.equal(expected)
    })
})
