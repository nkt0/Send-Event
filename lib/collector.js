/** Collector:
 *  at( Location )
 *    driver
 *      by( Implementation )
 *    monad
 *      set( Alpha )
 *      all( Array( Alpha ) )
 *    checker
 *      of( Array )
 *      by( Implementation )
 *    handle
 *      as( Name )
 *        bind( Location )
 *    alias
 *      is( Location )
 *    cyclics
 *      every( Mili )
 *    tasks
 *      add()
 *
 */
var Collector = function () {
  this._cyclics     = new Array;
  this._tasks       = new Array;
  this._tasks.map   = {};
  this._alias       = new Tree(true);
  this._shortcut    = new Tree(true);
  this._gnosis      = new Tree;

  this.backend      = this.backend(Resolvers);

  return this;
};

/** Collector.fields:
 *
 *  first:  for scheduler tasks and cyclics
 *  second: for resolvers
 *  third:  for storing behavious
 *  all:    firse + second + third
 *  trees:  second + third
 */
Collector.prototype.fields = (function () {
  var first  = ['ordered', 'dated'];
  var second = ['inherits', 'shortcuts'];
  var third  = ['getters', 'setters', 'outputs', 'inputs'];

  return { first:  first
         , second: second
         , third:  third
         , all:    [].concat(first, second, third)
         , trees:  [].concat(second, third)
         };
})();

/** Collector.at
 *
 *  This function is use to define a specific location to add some
 *  behaviour.
 */
Collector.prototype.at = function (location) {
  return this.fields.all
    .fold({}, function (field, root) {
      var datas = this.fields.third.exists(field) ? this._gnosis : this['_'+field];
      root[field] = new this[field](location, datas, root);
      return root;
    }, this);
};

/** Collector.finalize
 *
 *  Retrun a object that contains the backend
 *
 */
Collector.prototype.finalize = function () {
  // PROD // Collector = null;
  return this.backend;
};

/** Collector.backend
 *
 *  This object provide a simple interface to handle behaviour getting
 *
 */
Collector.prototype.backend = function (resolvers) {
  var self = this;
  var result = { scheduler: {}, resolver: null };
  // resolv: location -> { into: kind -> result }
  result.resolv = function (location) {
    return { into: function (kind) { return result.resolver[kind](location); } };
  };
  // resolver:
  result.resolver = this.fields.third
    .fold({}, Function.inheritCall(this), resolvers);
  // scheduler.execute:
  result.scheduler.execute = function (callback, context) {
    if (self._tasks.length < 1) return false;
    var task = self._tasks.shift();
    delete self._tasks.map[task.location];
    return callback.call(context, task);
  };
  // scheduler.load:
  result.scheduler.load = function () {
    return self._tasks.length;
  };
  // scheduler.autocheck:
  result.scheduler.autocheck = function () {
    var current = (new Date).getTime();
    for (var i = 0; i < self._cyclics.length; i++)
      if (current > self._cyclics[i].expire) {
        self._cyclics[i].expire = current + self._cyclics[i].interval;
        self.spool(self._cyclics[i].location, Workspace.prototype.CYCLIC, null);
      }
  };

  return result;
};

/** Collector.spool
 *
 *  How to add a task ... like that
 *
 */
Collector.prototype.spool = function (location, reason, value) {
  var pool = this._tasks;
  if (!(location in pool.map)) {
    var task = { location: location, reasons: {} };
    task.reasons[reason] = value;
    pool.map[location] = task;
    pool.push(task);
  } else {
    var task = pool.map[location];
    task.reasons[reason] = value;
  }
};

// private methods
Collector.methods = {};

/** Collector.create:
 *
 *  To provide a common stoker constructor
 */
Collector.methods.create = function (name) {
  return function (location, target, root) {
    this.location       = location;
    this.stoker         = target;
    this.prepare        = Function.lazy(Object.prepare, name);
    this.root           = root;
    return this;
  };
};

/** Collector.is:
 *
 *  To assign a location
 */
Collector.methods.is = function (inherit) {
  this.stoker.set(this.location, inherit);
  return this.root;
};

/** Collector.as:
 *
 *  To define a name
 */
Collector.methods.as = function (name) {
  this.name = name;
  return { bind: this.bind.within(this) };
};

/** Collector.bind:
 *
 *  To listen a location
 */
Collector.methods.bind = function (address) {
  this.stoker.set(address, this.prepare({ name: this.name, address: this.location }));
  return this.root;
};

/** Collector.every:
 *
 *  To define a period
 */
Collector.methods.every = function (interval) {
  if (!(interval >= 200)) throw new Error('Collector.every: interval have to be over 200 ms');
  var listener = {};
  listener.interval = interval;
  listener.location = this.location;
  listener.expire = (new Date).getTime() + interval;
  if (this.stoker instanceof Array) this.stoker.push(listener);
  return this.root;
};

/** Collector.every:
 *
 *  To assign an implementation (function)
 */
Collector.methods.by = function (implementation) {
  if (!(implementation instanceof Function)) throw new Error('Collector.by: bad usage');
  this.stoker.set(this.location, this.prepare(implementation));
  return this.root;
};

/** Collector.set:
 *
 *  To assign a data
 */
Collector.methods.set = function (alpha) {
  this.stoker.set(this.location, this.prepare(alpha));
  return this.root;
};

/** Collector.all:
 *
 *   ??
 */
Collector.methods.all = function (inherit) {
  this.stoker.set(this.location, this.prepare(inherit));
  return this.root;
};

/** Collector.of:
 *
 *  To define that all of the data can be
 */
Collector.methods.of = function (posibilities) {
  if (!(posibilities instanceof Array)) throw new Error('Collector.of: bad usage');
  else posibilities = [].concat(posibilities);
  var implementation = function (value, state) {
    for (var i = 0; i < posibilities.length; i++)
      if (value == posibilities[i])
        return Check.ok(value);
    return Check.ko(value, 'unchecked');
  };
  this.stoker.set(this.location, this.prepare(implementation));
  return this.root;
};

Collector.prototype.fields.all
  .each( function (key, constructor) { this.prototype[key] = Collector.methods.create(key); }
       , Collector);

Collector.prototype.alias.prototype.is      = Collector.methods.is;
Collector.prototype.shortcut.prototype.is   = Collector.methods.is;
Collector.prototype.handle.prototype.as     = Collector.methods.as;
Collector.prototype.handle.prototype.bind   = Collector.methods.bind;
Collector.prototype.driver.prototype.by     = Collector.methods.by;
Collector.prototype.monad.prototype.set     = Collector.methods.set;
Collector.prototype.monad.prototype.all     = Collector.methods.all;
Collector.prototype.checker.prototype.of    = Collector.methods.of;
Collector.prototype.checker.prototype.by    = Collector.methods.by;
Collector.prototype.cyclics.prototype.every = Collector.methods.every;

var Collector = new Collector;
