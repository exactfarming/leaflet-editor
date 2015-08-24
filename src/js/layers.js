import ViewGroup from './view/group';
import EditPolygon from './edit/polygon';
import HolesGroup from './edit/holesGroup';
import EditLineGroup from './edit/line';
import DashedEditLineGroup from './draw/dashed-line';

import './edit/marker-group';

export default {
  viewGroup: null,
  editGroup: null,
  editPolygon: null,
  editMarkersGroup: null,
  editLineGroup: null,
  dashedEditLineGroup: null,
  editHoleMarkersGroup: null,
  setLayers () {
    this.viewGroup = new ViewGroup([]);
    this.editGroup = new L.FeatureGroup([]);
    this.editPolygon = new EditPolygon([]);
    this.editMarkersGroup = new L.MarkerGroup([]);
    this.editLineGroup = new EditLineGroup([]);
    this.dashedEditLineGroup = new DashedEditLineGroup([]);
    this.editHoleMarkersGroup = new HolesGroup([]);
  }
}