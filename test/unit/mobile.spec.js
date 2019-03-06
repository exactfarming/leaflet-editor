import m from '../../src/js/utils/mobile.js';

describe('mobile', function() {
  it('navigator.userAgent', function() {
    expect(m.isMobileBrowser({ userAgent: '123' })).to.eql(false);

    expect(m.isMobileBrowser({ userAgent: 'android' })).to.eql(true);
  });

  it('navigator.vendor', function() {
    expect(m.isMobileBrowser({ vendor: '123' })).to.eql(false);

    expect(m.isMobileBrowser({ vendor: 'android' })).to.eql(true);
  });

  it('navigator.opera', function() {
    window.opera = '123';
    expect(m.isMobileBrowser({})).to.eql(false);
    window.opera = 'android';
    expect(m.isMobileBrowser({})).to.eql(true);
  });
});
