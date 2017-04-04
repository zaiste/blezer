const chai = require('chai');

chai.should();

const Job = require('../lib/job');

beforeEach(() => {
});

describe('#find()', () => {
  it('respond with ...', async () => {
    const job = await new Job('BooWorker', '[1, "arg1", true]')

    job.should.not.be.equal(2)
  });
});
