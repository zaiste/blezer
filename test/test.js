const chai = require('chai');
const expect = chai.expect;

const Job = require('../lib/job');
const Queue = require('../lib/queue');
const { enqueue } = require('../');

beforeEach(() => {});

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Job', () => {
  it('create a job with a specific task', async () => {
    const job = await new Job('default', 'BooWorker', [1, 'arg1', true]);

    expect(job.queue).to.be.equal('default');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });

  it('enque a job via Queue', async () => {
    const queue = new Queue();
    const job = await queue.enqueue('BooWorker', [1, 'arg1', true]);

    expect(job.queue).to.be.equal('blezer:queues:default');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });

  it('enque a job using a helper', async () => {
    const job = await enqueue('BooWorker', [1, 'arg1', true], { name: 'high' });

    expect(job.queue).to.be.equal('blezer:queues:high');
    expect(job.task).to.be.equal('BooWorker');
    expect(job.args).to.be.an('array');
  });

  it('enqueue a new job ', async () => {
    const job = await new Job('default', 'BooWorker', [1, 'arg1', true]);
    await timeout(1);
    job.emit('enqueued');

    expect(job.createdAt).to.exist;
    expect(job.enqueuedAt).to.exist;
    expect(job.enqueuedAt).not.to.be.equal(job.createdAt);
  });

});
