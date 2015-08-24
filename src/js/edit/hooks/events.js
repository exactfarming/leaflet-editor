export default (_this) => {
  //  return () => {
  //  var group = this.getEGroup();
  //
  //  var self = this;
  //  group.on('layeradd', function (e) {
  //    e.layer.on('mousedown', function (e) {
  //      if (this._map.isMode('edit') && e.target._path) {
  //        console.log('diff from actual active layer', self._getActiveEditLayer() !== e.target);
  //        if (self._getActiveEditLayer() !== e.target) {
  //          var layer = self._getActiveEditLayer() && $(self._getActiveEditLayer()._container);
  //
  //          if (layer) {
  //            L.DomUtil.removeClass(self._getActiveEditLayer()._path, 'edit-polygon');
  //          }
  //
  //          var selectedPath = e.target._path;
  //          if(!L.DomUtil.hasClass(selectedPath, 'edit-polygon')) {
  //            L.DomUtil.addClass(selectedPath, 'edit-polygon');
  //          }
  //
  //          self._setActiveEditLayer(e.target);
  //
  //          //self.getELineGroup().clearLayers();
  //          self.getEMarkersGroup().clearLayers();
  //          //self.getEMarkersGroup().getELineGroup().clearLayers();
  //          self.getEHMarkersGroup().clearLayers();
  //
  //          if (!layer) {
  //            layer = $(e.target._container.parentElement).children().last();
  //          }
  //          if (e.target._container !== layer[0]) {
  //            $(e.target._container).detach().insertAfter(layer);
  //          }
  //
  //          self.restoreEPolygon(e.target);
  //
  //          self._fitEBounds();
  //        }
  //        // reset marker selection
  //        self.getEMarkersGroup().resetSelected();
  //
  //        self.$.trigger('change_edited_polygon');
  //      }
  //    });
  //  });
  //}
}