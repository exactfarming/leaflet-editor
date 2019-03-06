window.editor = window.editor || {};

describe('options', function () {

  beforeEach(() => {
    const content = document.querySelector('#test-container');

    if (!content) {
      document.querySelector('body').innerHTML = '<div id="test-container"></div>';
    }
    document.querySelector('#test-container').innerHTML = window.mapTemplate;

    editor = window.initMap({
      notifyClickMarkerDeletePolygon: true,
      style: {
        startDraw: {
          color: '#ff0000'
        },
        draw: {
          color: '#0aaec9'
        },
        drawLine: {
          color: '#ff0000'
        }
      }
    });
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

  it('remove polygon', async () => {
    let x = 200;
    let y = 100;

    const drawPolygon = async () => {

      await triggerEvent('click', '#map', {position: {x, y}});
      await triggerEvent('click', '#map', {position: {x, y: y + 250}});
      await triggerEvent('click', '#map', {position: {x: x + 250, y: y + 250}});
      await triggerEvent('click', '#map', {position: {x: x + 250, y}});

      await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
      await triggerEvent('click', '.m-editor-div-icon-first');
    };

    await drawPolygon();

    await triggerEvent('click', '.m-editor-div-icon');
    await triggerEvent('click', '.m-editor-div-icon');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(3);

    expect(document.querySelector('.leaflet-msg-container.title-error').innerText).to.eql("Click again to remove polygon");

    await triggerEvent('mouseout', '.m-editor-div-icon');

    expect(document.querySelector('.leaflet-msg-container.title-error').classList.contains('title-hidden')).to.be.true;

    await triggerEvent('mouseover', '.m-editor-div-icon');

    expect(document.querySelector('.leaflet-msg-container.title-error').classList.contains('title-hidden')).to.be.false;

    await triggerEvent('click', '.m-editor-div-icon');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(0);
  });

  it('options.style', async () => {
    let x = 200;
    let y = 100;

    const drawPolygon = async () => {

      await triggerEvent('click', '#map', {position: {x, y}});
      await triggerEvent('click', '#map', {position: {x, y: y + 250}});
      await triggerEvent('click', '#map', {position: {x: x + 250, y: y + 250}});
      await triggerEvent('click', '#map', {position: {x: x + 250, y}});

      await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');

      expect(document.querySelector('.leaflet-clickable.editable-polygon').getAttribute('stroke')).to.eql('#ff0000');
      expect(document.querySelector('.leaflet-clickable.editable-polygon').getAttribute('fill')).to.eql('#ff0000');
      expect(document.querySelector('.dash-line').getAttribute('stroke')).to.eql('#ff0000');

      await triggerEvent('click', '.m-editor-div-icon-first');

      expect(document.querySelector('.leaflet-clickable.editable-polygon').getAttribute('stroke')).to.eql('#0aaec9');
      expect(document.querySelector('.leaflet-clickable.editable-polygon').getAttribute('fill')).to.eql('#0aaec9');
    };

    await drawPolygon();
  });
});
