import search from '../utils/search';
import TrashBtn from '../extended/TrashBtn';
import LoadBtn from '../extended/LoadBtn';
import BtnControl from '../extended/BtnControl';
import MsgHelper from '../extended/MsgHelper';
import m from '../utils/mobile';

export default function () {
  search();

  var ggl = new L.Google();

  this.addLayer(ggl);

  this._controlLayers = new L.Control.Layers({
    'Google': ggl
  });

  this.addControl(this._controlLayers);

  this.touchZoom.disable();
  this.doubleClickZoom.disable();
  //this.scrollWheelZoom.disable();
  this.boxZoom.disable();
  this.keyboard.disable();

  this.addControl(L.control.search());

  var trashBtn = new TrashBtn({
    btns: [
      {'className': 'fa fa-trash'}
    ]
  });

  var loadBtn = new LoadBtn({
    btns: [
      {'className': 'fa fa-arrow-circle-o-down load'}
    ]
  });

  var msgHelper = new MsgHelper({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap
  });

  this.on('msgHelperAdded', (data) => {
    var msgContainer = data.control._titleContainer;

    this._msgContainer = msgContainer;
    var text = this.options.text;

    this.on('editor:marker_group_select', () => {

      this.off('editor:not_selected_marker_mouseover');
      this.on('editor:not_selected_marker_mouseover', () => {
        msgContainer.msg(text.clickToSelectEdges);
      });

      this.off('editor:selected_marker_mouseover');
      this.on('editor:selected_marker_mouseover', () => {
        msgContainer.msg(text.clickToRemoveAllSelectedEdges);
      });

      this.off('editor:selected_middle_marker_mouseover');
      this.on('editor:selected_middle_marker_mouseover', () => {
        msgContainer.msg(text.clickToAddNewEdges);
      });

      // on edit polygon
      this.off('editor:edit_polygon_mouseover');
      this.on('editor:edit_polygon_mouseover', () => {
        msgContainer.msg(text.clickToDrawInnerEdges);
      });

      this.off('editor:edit_polygon_mouseout');
      this.on('editor:edit_polygon_mouseout', () => {
        msgContainer.hide();
      });
      // on view polygon
      this.off('editor:view_polygon_mouseover');
      this.on('editor:view_polygon_mouseover', () => {
        msgContainer.msg(text.clickToEdit);
      });

      this.off('editor:view_polygon_mouseout');
      this.on('editor:view_polygon_mouseout', () => {
        msgContainer.hide();
      });
    });

    // hide msg
    this.off('editor:marker_mouseout');
    this.on('editor:marker_mouseout', () => {
      msgContainer.hide();
    });
    // on start draw polygon
    this.off('editor:first_marker_mouseover');
    this.on('editor:first_marker_mouseover', () => {
      msgContainer.msg(text.clickToJoinEdges);
    });
    // dblclick to join
    this.off('editor:last_marker_dblclick_mouseover');
    this.on('editor:last_marker_dblclick_mouseover', () => {
      msgContainer.msg(text.dblclickToJoinEdges);
    });

    this.on('editor:join_path', () => {
      msgContainer.msg(this.options.text.clickToRemoveAllSelectedEdges);
    });

    //todo: continue with option 'allowCorrectIntersection'
    this.on('editor:intersection_detected', (data) => {
      // msg
      if (data.intersection) {
        msgContainer.msg(this.options.text.intersection);
      } else {
        msgContainer.hide();
      }

      var selectedMarker = this.getSelectedMarker();

      if(!this.hasLayer(selectedMarker)) {
        return;
      }

      if(selectedMarker && !selectedMarker._mGroup.hasFirstMarker()) {
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
    this.addControl(loadBtn);
  }

  this.addControl(trashBtn);
}