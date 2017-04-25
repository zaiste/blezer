const chai = require('chai');
const expect = chai.expect;

const Job = require('../lib/job');

beforeEach(() => {});

describe('Job', () => {
  it('create a job with a specific task', async () => {
    const job = await new Job('default', 'BooWorker', [1, 'arg1', true]);

    expect(job.queue).to.be.equal('default');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });
});
