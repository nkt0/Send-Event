Function.prototype.stub = function () {
  if (!('args' in this)) this.args = [];
  for (var i = 0; i < arguments.length; i++)
    this.args.push(arguments[i]);
  var self = this;
  return function () {
    for (var i = 0; i < arguments.length; i++)
      self.args.push(arguments[i]);
    self.apply(this, self.args);
  };
};

Function.prototype.within = function (context) {
  var self = this;
  return function () { return self.apply(context, arguments); };
};

String.prototype.trim = (function () {
  var whitespace = ' \t\n\r';
  return function (chars) {
    for (var b = 0; b < this.length; b++)
      if ((chars || whitespace).indexOf(this[b]) < 0)
        break ;
    for (var e = this.length - 1; e >= 0; e--)
      if ((chars || whitespace).indexOf(this[e]) < 0)
        break ;
    return this.substr(b, b + e + 1);
  };
})();

String.prototype.toPosition = (function () {
  var separator = '.';
  return function () {
    var location = this == ''+this ? ''+this : '';
    location = location.replace(/\.+/g, separator).trim(separator);
    if (location.length < 1) return [];
    return location.split(separator);
  };
})();

String.prototype.explode = function (separator) {
  if (this.length < 1) return [];
  return this.split(separator);
};

Array.prototype.exists = function () {
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i] != null)
      break ;
  if (i == arguments.length) return false;
  for (var i = 0; i < this.length; i++) {
    for (var j = 0; j < arguments.length; j++)
      if (this[i] == arguments[j]) return true;
  }
  return false;
};

Array.prototype.of = function () {
  for (var i = 0; i < this.length; i++)
    for (var j = 0; j < arguments.length; j++)
      if (this[i] == arguments[j]) return this[i];
  return null;
};

Array.prototype.within = function (map) {
  for (var i = 0; i < this.length; i++)
    if (this[i] in map)
      return { as: this[i], is: map[this[i]] };
  return null;
};

Array.prototype.which = function (map) {
  for (var i = 0; i < this.length; i++)
    if (this[i] in map)
      return this[i];
  return null;
};

Array.prototype.whichin = function (map, callback, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++)
    if (this[i] in map)
      callback.call(context, this[i], map[this[i]]);
};

Array.prototype.each = function (callback, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++)
    if (callback.call(context, this[i], i) === false)
      return false;
  return true;
};

Array.prototype.last = function (item) {
  var temp = [item];
  var decal = 0;

  for (var i = 0; i < this.length; i++) {
    for (var j = 0; j < arguments.length; j++)
      if (this[i] == arguments[j]) {
        decal++;
        if (!temp.exists(this[i])) temp.push(this[i]);
      }
    if (decal > 0 && i + decal < this.length)
      this[i] = this[i + decal];
  }
  while (temp.length > 0) this.push(temp.shift());
};

Array.prototype.flush = function () {
  while (this.length > 0) this.pop();
};

Array.prototype.remove = function (item) {
  for (var i = 0; i < this.length; i++)
    if (this[i] == item) {
      for (var j = i; j < (this.length - 1); j++)
        this[j] = this[j + 1];
      this.pop();
      i--;
    }
};

Array.prototype.equiv = function (item) {
  if (!is.array(item))
    throw new Error('Array.equiv: bad argument');
  if (this.length != item.length) return false;
  for (var i = 0; i < this.length; i++)
    if (item[i] != this[i]) return false;
  return true;
};

Array.prototype.map = function (callback, context) {
  context = context || this;
  for (var i = 0, l = this.length; i < l; ++i)
    this[i] = callback.call(context, this[i], i);
  return this;
};

Array.prototype.fold = function (accumulator, callback, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++)
    accumulator = callback.call(context, this[i], accumulator, i);
  return accumulator;
};

Array.prototype.foldr = function (accumulator, callback, context) {
  context = context || this;
  for (var i = this.length - 1; i >= 0; i--)
    accumulator = callback.call(context, this[i], accumulator, i);
  return accumulator;
};

Array.prototype.find = function (callback, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++) {
    var value = callback.call(context, this[i], i);
    if (value != null) return value;
  }
  return null;
};

// Pervasives

Function.noop = function () { return null ;};

Function.identity = function (alpha) { return alpha; };

Function.lambda = function (alpha) {
  return alpha instanceof Function
    ? alpha
    : function (beta) { return alpha || beta || null; }
};

Function.inherit = function (key, target) {
  target[key] = this[key];
  return target;
};
var inherit = Function.inherit;

Function.inheritCall = function () {
  var args = arguments;
  return function (key, target) {
    target[key] = this[key].apply(this, args);
    return target;
  };
};

Function.id = function (alpha) {
  if (alpha instanceof Object)
    for (var key in alpha) {
      if (!flag) var flag = key; // if once
      else return null;          // then null
    }
  return key || null;            // if key == '' then null
};

Function.lazy = function (callback) {
  var begin = Array.prototype.slice.call(arguments, 1);
  var self = this;
  return function () {
    var args = Array.prototype.concat.call(begin, arguments);
    return callback.apply(self, args);
  };
};

Object.prepare = function (key, value) {
  var one = {};
  one[''+key] = value;
  return one;
};

// Debug
var Debug = function () {};

Debug.prototype.dump = function (alpha) {
  if (typeof console == 'object') {
    if (typeof console.log == 'function')
      console.log(alpha);
  } else if (typeof document == 'object') {
    var elem = document.getElementById('debug');
    if (elem != null) $(elem).append('<div>'+alpha+'</div>');
  }
};

var Debug = new Debug;