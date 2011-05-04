/** Tree:
 *
 *  Private:
 *    _tree: Map
 *
 *  Public:
 *    set: Position -> Alpha -> Void
 *    get: Position -> Alpha
 */
var Tree = function (reverse) {
  if (reverse === true) this._reverse = true;
  this._tree = {};
  return this;
};

Tree.prototype.set = function (location, alpha) {
  if (this._reverse)
    this.define(location.toPosition().reverse(), alpha.toPosition());
  else
    this.define(location.toPosition(), alpha);
};

Tree.prototype.get = function (location) {
  return this.find(location.toPosition());
};

Tree.prototype.find = function (position) {
  Debug.dump(position);
  return this._tree[position];
  return position;
};

Tree.prototype.define = function (position, alpha) {
  var key = Function.id(alpha);
  if (!(position instanceof Array)) throw new Error('bad argument');
  if (!(key) && !(this._reverse)) throw new Error('Tree.define: alpha have to be a single field map');
  var context = this._tree;
  var last = position.pop();
  for (var i = 0; i < position.length; i++) {
    if (''+position != position || position == '') throw new Error('bad field');
    if (!(position[i] in context)) context[position[i]] = {};
    context = context[position[i]];
    if (!('_tail' in context)) context._tail = {};
    context = context._tail;
  }
  if (!(last in context)) context[last] = {};
  if ('_head' in context[last]) {
    if (key in context[last]._head) context[last]._head[key].push(alpha);
    else context[last]._head[key].push(alpha[key]);
  } else {
    context[last]._head = {};
    context[last]._head[key] = [alpha[key]];
  }
  return alpha[key];
};
