window.editor = window.editor || {};

describe('MsgHelper', function () {

  beforeEach(() => {
    const content = document.querySelector('#test-container');

    if (!content) {
      document.querySelector('body').innerHTML = '<div id="test-container"></div>';
    }
    document.querySelector('#test-container').innerHTML = window.mapTemplate;

    editor = window.initMap();
  });

  afterEach(() => {
    const content = document.querySelector('#test-container');

    if (content) {
      editor.on('unload', () => {
        document.querySelector('#test-container').innerHTML = '';
      });

      editor.remove();
    }
  });

  it('MsgHelper: getOffset', async () => {
    let x = 200;
    let y = 100;

    await triggerEvent('click', '#map', {position: {x, y}});

    expect(editor.msgHelper.getOffset(document.querySelector('.m-editor-div-icon-first'))).to.exist;
  });
  it('MsgHelper: msg', (done) => {

    editor.whenReady(() => {
      editor.msgHelper.msg('test');

      expect(document.querySelector('.leaflet-msg-container').innerHTML).to.eql('test');

      editor.msgHelper.hide();

      expect(document.querySelector('.leaflet-msg-container.title-hidden')).to.exist;

      done();
    });
  });
});
