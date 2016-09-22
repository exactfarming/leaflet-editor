import SearchBtn from '../extended/SearchBtn';
import TrashBtn from '../extended/TrashBtn';
import LoadBtn from '../extended/LoadBtn';
import BtnControl from '../extended/BtnControl';
import MsgHelper from '../extended/MsgHelper';
import m from '../utils/mobile';

import zoomTitle from '../titles/zoomTitle';
import fullScreenTitle from '../titles/fullScreenTitle';

export default function () {

  zoomTitle(this);
  fullScreenTitle(this);

  if (this.options.defaultControlLayers) {
    var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });
    // OSM.addTo(map);
    this.addLayer(OSM);

    this._controlLayers = new L.Control.Layers({
      Google: new L.Google(),
      OSM
    });

    this.addControl(this._controlLayers);
  }

  this.touchZoom.disable();
  this.doubleClickZoom.disable();

  //this.scrollWheelZoom.disable();
  this.boxZoom.disable();
  this.keyboard.disable();

  var controls = this.options.controls;

  if (controls) {
    if (controls.geoSearch) {
      this.addControl(new SearchBtn());
    }
  }

  this._BtnControl = BtnControl;

  var trashBtn = new TrashBtn({
    btns: [
      { className: 'fa fa-trash' },
    ],
  });

  let loadBtn;

  if (controls && controls.loadBtn) {
    loadBtn = new LoadBtn({
      btns: [
        { className: 'fa fa-arrow-circle-o-down load' },
      ],
    });
  }

  var msgHelper = this.msgHelper = new MsgHelper({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap,
  });

  this.on('msgHelperAdded', () => {
    var text = this.options.text;

    this.on('editor:marker_group_select', () => {

      this.off('editor:not_selected_marker_mouseover');
      this.on('editor:not_selected_marker_mouseover', (data) => {
        msgHelper.msg(text.clickToSelectEdges, null, data.marker);
      });

      this.off('editor:selected_marker_mouseover');
      this.on('editor:selected_marker_mouseover', (data) => {
        msgHelper.msg(text.clickToRemoveAllSelectedEdges, null, data.marker);
      });

      this.off('editor:selected_middle_marker_mouseover');
      this.on('editor:selected_middle_marker_mouseover', (data) => {
        msgHelper.msg(text.clickToAddNewEdges, null, data.marker);
      });

      // on edit polygon
      this.off('editor:edit_polygon_mousemove');
      this.on('editor:edit_polygon_mousemove', (data) => {
        msgHelper.msg(text.clickToDrawInnerEdges, null, data.layerPoint);
      });

      this.off('editor:edit_polygon_mouseout');
      this.on('editor:edit_polygon_mouseout', () => {
        msgHelper.hide();
        this._storedLayerPoint = null;
      });

      // on view polygon
      this.off('editor:view_polygon_mousemove');
      this.on('editor:view_polygon_mousemove', (data) => {
        msgHelper.msg(text.clickToEdit, null, data.layerPoint);
      });

      this.off('editor:view_polygon_mouseout');
      this.on('editor:view_polygon_mouseout', () => {
        msgHelper.hide();
        this._storedLayerPoint = null;
      });
    });

    // hide msg
    this.off('editor:marker_mouseout');
    this.on('editor:marker_mouseout', () => {
      msgHelper.hide();
    });

    // on start draw polygon
    this.off('editor:first_marker_mouseover');
    this.on('editor:first_marker_mouseover', (data) => {
      msgHelper.msg(text.clickToJoinEdges, null, data.marker);
    });

    // dblclick to join
    this.off('editor:last_marker_dblclick_mouseover');
    this.on('editor:last_marker_dblclick_mouseover', (data) => {
      msgHelper.msg(text.dblclickToJoinEdges, null, data.marker);
    });

    this.on('editor:__join_path', (data) => {
      if (data.marker) {
        msgHelper.msg(this.options.text.clickToRemoveAllSelectedEdges, null, data.marker);
      }
    });

    //todo: continue with option 'allowCorrectIntersection'
    this.on('editor:intersection_detected', (data) => {
      // msg
      if (data.intersection) {
        msgHelper.msg(this.options.text.intersection, 'error', (this._storedLayerPoint || this.getSelectedMarker()));
        this._storedLayerPoint = null;
      } else {
        msgHelper.hide();
      }

      var selectedMarker = this.getSelectedMarker();

      if (!this.hasLayer(selectedMarker)) {
        return;
      }

      if (selectedMarker && !selectedMarker._mGroup.hasFirstMarker()) {
        //set marker style
        if (data.intersection) {
          //set 'error' style
          selectedMarker.setIntersectedStyle();
        } else {
          //restore style
          selectedMarker.resetStyle();

          //restore other markers which are also need to reset style
          var markersToReset = selectedMarker._mGroup.getLayers().filter((layer) => {
            return L.DomUtil.hasClass(layer._icon, 'm-editor-intersection-div-icon');
          });

          markersToReset.map((marker) => marker.resetStyle());
        }
      }
    });
  });

  if (!m.isMobileBrowser()) {
    this.addControl(msgHelper);

    if (controls && controls.loadBtn) {
      this.addControl(loadBtn);
    }
  }

  if (controls && controls.trashBtn) {
    this.addControl(trashBtn);
  }
}
