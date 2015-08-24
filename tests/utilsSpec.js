import m from '../src/js/utils/mobile';
import a from '../src/js/utils/array';

describe('sort layers', () => {
  beforeEach(() => {});
  afterEach(() => {});

  it('isMobileBrowser', () => {
    expect(m.isMobileBrowser()).toBe(false);
  });

  it('array.js - move', () => {
    var array = [0, 1, 2, 3];
    array.move(3, 0);
    expect(array).toEqual([3, 0, 1, 2]);
  });

  it('array.js - _each', () => {
    var array = [0, 1, 2, 3];
    array._each((item, index) => {
      expect(item).toEqual(index);
    });
  });
});