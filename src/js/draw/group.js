export default L.FeatureGroup.extend({
  isEmpty() {
    return this.getLayers().length === 0;
  }
});