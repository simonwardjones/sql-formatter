import { expect } from 'chai';
import 'mocha';
import { TokenFormatter } from '../src/layout';
import { DefaultLayoutConfig } from '../src/layout_config';

describe('initialising TokenFormatter', () => {
    const tokenFormatter = new TokenFormatter(DefaultLayoutConfig)
    it('should have starting context global', () => {
        expect(tokenFormatter.currentContext().name).to.equal('GLOBAL_CONTEXT')
    })
})