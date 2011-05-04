var Resolvers = function () {};

Resolvers.prototype.create = function (request) {
  if (!(request.engine instanceof Function))
    throw new Error('Resolvers.create: needs a function');
  return function (callback) {
    return request.engine.call(request.context, request.location(), callback);
  };
};

Resolvers.prototype.make = function (context) {
  var Constructor = function (location) {
    this.location = function () {
      return this.find(location.toPosition());
    };
    return this;
  };
  Constructor.prototype.context = context;
  Constructor.prototype.find = this.finder(context);
  return Constructor;
};

Resolvers.prototype.release = function (context, method) {
  var self = this;
  var Constructor = this.make(context);
  Constructor.prototype.engine = method;
  return function (location) {
    return { browse: self.create(new Constructor(location)) };
  };
};

// #########################################################
Resolvers.prototype.finder = function (context) {
  var getBase = function (position) {
    for (var i = 0; i < position.length; i++) {
      if (!(position[i] in context._alias._tree)) return [position[i]];
      else {
        var aliases = context._alias._tree;
        for (var j = 0; j < position; j++)
          Debug.dump(position[i]);
      }
    }
    return position;
  };

  return function (position) {
    var path = {};
    position.map(function (i) {
      Debug.dump(context._alias.find(i));
      return i;
    });
    Debug.dump(this);
    Debug.dump(position);
    return null;
  };
};

// #########################################################

Resolvers.prototype.setter = function (context) {
  var engine = function (path, callback) {
    Debug.dump(path);
  };
  return this.release(context, engine);
};

Resolvers.prototype.handle = function (context) {
  var engine = function (path, callback) {

  };
  return this.release(context, engine);
};

Resolvers.prototype.getter = function (context) {
  var engine = function (path, callback) {

  };
  return this.release(context, engine);
};

Resolvers.prototype.monad = function (context) {
  var engine = function (path, callback) {

  };
  return this.release(context, engine);
};

var Resolvers = new Resolvers;
