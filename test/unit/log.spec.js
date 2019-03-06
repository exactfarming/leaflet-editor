import log from '../../src/js/utils/log.js';

describe('log', function() {
  beforeEach(() => {
    chai.spy.on(console, 'log');
  });

  afterEach(() => {
    chai.spy.restore(console);
  });

  it('call', function() {
    log('test');
    expect(console.log).to.have.been.called.with('test');
  });
});
