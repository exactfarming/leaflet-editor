import MsgHelper from '../extended/MsgHelper.js';
import m from '../utils/mobile.js';

import EVENTS from '../event-names.js';

export default function () {

  this.touchZoom.disable();
  this.doubleClickZoom.disable();

  this.boxZoom.disable();
  this.keyboard.disable();

  var msgHelper = this.msgHelper = new MsgHelper({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap,
  });

  this.on('msgHelperAdded', () => {

    var text = this.options.text;

    this.on(EVENTS.marker_group_select, () => {

      const _disallowToExecuteEvent = () => {
        const selectedMGroup = this.getSelectedMGroup()

        return selectedMGroup && selectedMGroup.hasFirstMarker();
      };

      this.off(EVENTS.not_selected_marker_mouseover);
      this.on(EVENTS.not_selected_marker_mouseover, (data) => {
        msgHelper.msg(text.clickToSelectEdges, null, data.marker);
      });

      this.off(EVENTS.selected_marker_mouseover);
      this.on(EVENTS.selected_marker_mouseover, (data) => {
        msgHelper.msg(text.clickToRemoveAllSelectedEdges, null, data.marker);
      });

      this.off(EVENTS.selected_middle_marker_mouseover);
      this.on(EVENTS.selected_middle_marker_mouseover, (data) => {
        msgHelper.msg(text.clickToAddNewEdges, null, data.marker);
      });

      // on edit polygon
      this.off(EVENTS.edit_polygon_mousemove);
      this.on(EVENTS.edit_polygon_mousemove, (data) => {
        msgHelper.msg(text.clickToDrawInnerEdges, null, data.layerPoint);
      });

      this.off(EVENTS.edit_polygon_mouseout);
      this.on(EVENTS.edit_polygon_mouseout, () => {
        msgHelper.hide();
      });

      // on view polygon
      this.off(EVENTS.view_polygon_mousemove);
      this.on(EVENTS.view_polygon_mousemove, (data) => {
        if (_disallowToExecuteEvent()) {
          return;
        }

        msgHelper.msg(text.clickToEdit, null, data.layerPoint);
      });

      this.off(EVENTS.view_polygon_mouseout);
      this.on(EVENTS.view_polygon_mouseout, () => {
        msgHelper.hide();
      });
    });

    // hide msg
    this.off(EVENTS.marker_mouseout);
    this.on(EVENTS.marker_mouseout, () => {
      msgHelper.hide();
    });

    this.on(EVENTS.marker_dragstart, () => {
      msgHelper.hide();
    });

    // on start draw polygon
    this.off(EVENTS.first_marker_mouseover);
    this.on(EVENTS.first_marker_mouseover, (data) => {
      msgHelper.msg(text.clickToJoinEdges, null, data.marker);
    });

    // dblclick to join
    this.off(EVENTS.last_marker_dblclick_mouseover);
    this.on(EVENTS.last_marker_dblclick_mouseover, (data) => {
      msgHelper.msg(text.dblclickToJoinEdges, null, data.marker);
    });

    this.on(EVENTS.join_path, (data) => {
      if (data.marker) {
        msgHelper.msg(this.options.text.clickToRemoveAllSelectedEdges, null, data.marker);
      }
    });
  });

  if (!m.isMobileBrowser()) {
    this.addControl(msgHelper);
  }
}
