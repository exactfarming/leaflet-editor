window.editor = window.editor || {};

describe('e2e tests', function () {

  beforeEach(() => {
    const content = document.querySelector('#test-container');

    if (!content) {
      document.querySelector('body').innerHTML = '<div id=\'test-container\'></div>';
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

  it('render map', function () {
    expect(document.querySelector('.leaflet-container')).to.exist;
  });

  it('draw polygon', async function () {
    const x = 100;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y: y}});

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('click to start draw polygon on map');

    await triggerEvent('mouseout', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[0]);
    await triggerEvent('mouseover', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[1]);

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('double click to join edges');

    await triggerEvent('mouseout', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[1]);
    await triggerEvent('mouseover', document.querySelector('.m-editor-div-icon-first'));

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('click to join edges');

    expect(document.querySelector('.m-editor-div-icon-first')).to.exist;

    await triggerEvent('click', '.m-editor-div-icon-first');

    await triggerEvent('mousemove', '.editable-polygon', {position: {x: 15, y: 15}});

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('click to draw inner edges');

    await triggerEvent('mouseout', '.editable-polygon', {position: {x: 5, y: 5}});

    await triggerEvent('click', '#map', { position: {x: x - 10, y: y - 10 } });

    await triggerEvent('mousemove', '.view-polygon', {position: {x: 5, y: 5}});

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('click to edit');

    await triggerEvent('mouseout', '.view-polygon');

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)')).not.to.exist;
  });

  it('draw polygon (less than 2 points)', async function () {
    const x = 100;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});

    await triggerEvent('click', '.m-editor-div-icon-first');

    expect(document.querySelector('.m-editor-div-icon-first')).to.exist;
  });

  it('draw polygon (dblclick)', async function () {
    const x = 100;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y: y + 250}});

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('click to start draw polygon on map');

    await triggerEvent('mouseout', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[0]);
    await triggerEvent('mouseover', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[1]);

    expect(document.querySelector('.leaflet-msg-container:not(.title-hidden)').innerText).to.eql('double click to join edges');

    expect(document.querySelector('.editable-polygon').getAttribute('d')).not.to.eql('M0 0');

    await triggerEvent('dblclick', document.querySelectorAll('.leaflet-marker-icon.m-editor-div-icon')[1]);

    await triggerEvent('click', '#map', {position: {x: x + 100, y: y + 100}});

    expect(document.querySelector('.m-editor-div-icon-first')).not.to.exist;
    expect(document.querySelector('.editable-polygon').getAttribute('d')).to.eql('M0 0');
  });

  it('draw polygon + 1 hole; remove polygon', async function () {
    const x = 200;
    const y = 150;

    //draw polygon
    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y}});

    expect(document.querySelector('.m-editor-div-icon-first')).to.exist;

    await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
    await triggerEvent('click', '.m-editor-div-icon-first');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(4);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(4);

    await triggerEvent('click', '#map', {position: {x: x - 10, y: y - 10}});

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(0);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(0);

    expect(document.querySelector('path.view-polygon')).to.exist;

    await triggerEvent('click', 'path.view-polygon', {position: {x: 40, y: 40}});

    await triggerEvent('click', '#map', {position: {x: x - 10, y: y - 10}});

    await triggerEvent('click', 'path.view-polygon', {position: {x: 40, y: 40}});

    //draw first hole
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 50, y: 50}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 100, y: 50}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 100, y: 100}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 50, y: 100}});

    await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
    await triggerEvent('click', '.m-editor-div-icon-first');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(8);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(8);

    //remove outer edge

    await triggerEvent('click', '.m-editor-div-icon:not(.group-selected)');

    //remove points
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(4);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(3);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(0);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(0);
  });
  it('draw polygon + 2 holes; remove holes; remove polygon', async function () {
    const x = 200;
    const y = 150;

    //draw polygon
    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y}});

    expect(document.querySelector('.leaflet-marker-pane .m-editor-div-icon-first')).to.exist;

    await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
    await triggerEvent('click', '.m-editor-div-icon-first');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(4);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(4);

    //draw first hole
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 50, y: 50}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 100, y: 50}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 100, y: 100}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 50, y: 100}});

    await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
    await triggerEvent('click', '.m-editor-div-icon-first');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(8);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(8);

    //draw second hole
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 120, y: 120}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 170, y: 120}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 170, y: 170}});
    await triggerEvent('click', 'path.editable-polygon', {position: {x: 120, y: 170}});

    await triggerEvent('mouseout', '.m-editor-div-icon:nth-child(4)');
    await triggerEvent('click', '.m-editor-div-icon-first');

    await triggerEvent('click', '#map', {position: {x: x - 10, y: y - 10}});

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(0);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon').length).to.eql(0);

    await triggerEvent('click', 'path.view-polygon', {position: {x: 40, y: 40}});

    //select inner edge
    await triggerEvent('click', '.m-editor-div-icon:not(.group-selected)');

    //remove points
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(4);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(3);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(0);

    //select inner edge
    await triggerEvent('click', '.m-editor-div-icon:not(.group-selected):nth-child(9)');

    //remove points
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(4);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(3);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(0);

    //remove outer edge

    await triggerEvent('click', '.m-editor-div-icon:not(.group-selected)');

    //remove points
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(4);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(3);

    await triggerEvent('click', '.m-editor-div-icon.group-selected');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-middle-div-icon.group-selected').length).to.eql(0);
  });

  it('draw: clear', async function () {
    const x = 200;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon-first').length).to.eql(1);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(1);

    expect(document.querySelector('path.leaflet-clickable')).to.exist;

    editor.clear();

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon-first').length).to.eql(0);
    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(0);
  });

  it('move cursor (check dash line)', async () => {
    const x = 200;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});

    const d1 = document.querySelector('.dash-line').getAttribute('d');

    await triggerEvent('mousemove', '#map', {position: {x: x + 50, y: y + 50}});

    const d2 = document.querySelector('.dash-line').getAttribute('d');

    expect(d1).not.to.eql(d2);
  });

  it('add marker', async () => {
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

    await triggerEvent('click', '.leaflet-marker-pane .m-editor-middle-div-icon');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(5);
  });
  it('add marker + move', async () => {
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

    let {x: _x, y: _y} = document.querySelector('.leaflet-marker-pane .m-editor-middle-div-icon').getBoundingClientRect();

    await triggerEvent('mousedown', '.leaflet-marker-pane .m-editor-middle-div-icon');
    await triggerEvent('mousemove', '#map', {position: {x: _x, y: _y}});
    await triggerEvent('mousemove', '.leaflet-marker-pane', {position: {x: 14, y: 7 + 125}});
    await triggerEvent('mouseup', '.leaflet-marker-pane');
    await triggerEvent('mouseout', '.leaflet-marker-pane .m-editor-div-icon');

    expect(document.querySelectorAll('.leaflet-marker-pane .m-editor-div-icon').length).to.eql(5);
  });

  it('change area', async function () {
    const x = 100;
    const y = 150;

    await triggerEvent('click', '#map', {position: {x, y}});
    await triggerEvent('click', '#map', {position: {x, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: x + 250, y: y}});

    await triggerEvent('click', '.m-editor-div-icon-first');

    await triggerEvent('click', '#map', {position: {x: 40, y: 40}});

    expect(editor.area()).to.eql(1221117532965.0015);

    const xSecond = 400;

    await triggerEvent('click', '#map', {position: {x: xSecond, y}});
    await triggerEvent('click', '#map', {position: {x: xSecond, y: y + 250}});
    await triggerEvent('click', '#map', {position: {x: xSecond + 250, y: y}});

    await triggerEvent('click', '.m-editor-div-icon-first');

    await triggerEvent('click', '#map', {position: {x: 40, y: 40}});

    expect(editor.area()).to.eql(2442235065930.003);

    await triggerEvent('click', document.querySelectorAll('path.view-polygon')[1], { position: { x: 10 , y: 10 } });
    await triggerEvent('click', '.leaflet-marker-icon');

    expect(editor.area()).to.eql(1221117532965.0015);
  });
});
