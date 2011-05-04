// Ordered Map
var oMap = function (index) {
  if (index != ''+index || (''+index).length < 1)
    throw new Error('oMap: need an index');
  this.datas = {};
  this.order = [];
  this.index = index;
  this.length = 0;
};

/** oMap.syncLength
 *
 *  to synchronize length
 */
oMap.prototype.syncLength = function () {
  this.length = this.order.length;
};

/** oMap.add
 *
 *
 */
oMap.prototype.add = function (o) {
  if (!(o instanceof Object))
    throw new Error('oMap.add: can add only object');
  if (!this.index in o)
    throw new Error('oMap.add: can not find the index field: '+this.index)
  if (o[this.index] in this.datas)
    throw new Error('oMap.add: object: '+o[this.index]+' already exists');
  else {
    this.datas[o[this.index]] = this.order.length;
    this.order.push(o);
  }
  this.syncLength()
};

/** oMap.put
 *
 *  add or replace and move it to the index position
 *  where index < map.length
 */
oMap.prototype.put = function (o, index) {

  this.syncLength()
};

oMap.prototype.remove = function (key) {

  this.syncLength()
};

oMap.prototype.move = function (key, index) {
  if (!(index < this.length) || index < 0)
    throw new Error('oMap.move: index have to be lower than the map length');
};

oMap.prototype.find = function (key) {
  if (key in this.datas) return this.get(this.datas[key]);
  return null;
};

oMap.prototype.get = function (index) {
  if (!(index < this.length) || index < 0)
    throw new Error('oMap.get: index have to be lower than the map length');
  return this.order[index];
};

oMap.prototype.getIndex = function (key) {
  return key in this.datas ? this.datas[key] : -1;
};
