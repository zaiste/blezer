const chai = require('chai');
const expect = chai.expect;

const Job = require('../lib/job');
const Queue = require('../lib/queue');

beforeEach(() => {});

describe('Job', () => {
  it('create a job with a specific task', async () => {
    const job = await new Job('default', 'BooWorker', [1, 'arg1', true]);

    expect(job.queue).to.be.equal('default');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });

  it('enque a job', async () => {
    const queue = new Queue();
    const job = await queue.enqueue('BooWorker', [1, 'arg1', true]);

    expect(job.queue).to.be.equal('blezer:queues:default');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });
});
