Array.prototype.move = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
Array.prototype._each = function(func) {
  var length = this.length;
  var i = 0;
  for (; i < length; i++) {
    func.call(this, this[i], i);
  }
};
export default Array;
