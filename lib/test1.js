var nf = (function () {

  var hidden = { call: null, apply: null, toString: null
               , _: null, $: null
               };

  return function build(reference, path) {

    if (! (reference instanceof Function)) {
      if (! (path instanceof Array)) path = ['$'];
      reference = defaultRef;
    }

    var host = function host() {
      var self = arguments.callee[name];
      if (self instanceof Function)
        arguments = self.apply(self, arguments);
      else if (self instanceof Array)
        for (var i = 0; i < self.length; ++i)
          arguments = self[i].apply(self, arguments);
      else if (self instanceof Object)
        for (var i in self) if (! (i in hidden))
          arguments = self[i].apply(self, arguments);
      else if (! (arguments.length > 0))
        arguments = self;
      return arguments.length > 1 ? arguments
        : arguments.length > 0 ? arguments[0]
        : arguments ? arguments
        : self;
    }

    return host;
  };
})()

      var args = arguments;
      return (function repeat(self) {
        var ctx = args.callee[name] || constructor;
        return this.apply(ctx, args) || { self: self };
      }).call(function engine() {
        if (this instanceof Function)
          arguments = this.apply(this, arguments);
        else if (this instanceof Array)
          for (var i = 0; i < this.length; ++i)
            arguments = this[i].apply(this, arguments);
        else if (this instanceof Object)
          for (var i in this) if (! (i in hidden))
            arguments = this[i].apply(this, arguments);
        else if (! (arguments.length > 0))
          arguments = this;
        return arguments.length > 1 ? arguments
          : arguments.length > 0 ? arguments[0]
          : arguments ? arguments
          : args.callee;
      }, this);
    };
    host.$ = $
    return host;
  };
}

var autoconstruct =
  { $: new Record('dollar')
  , _: new Record('underscore')
  };

/*

  var serialize = function (v) {
    if (typeof v == 'string') return "'"+v+"'";
    else if (typeof v == 'number') return ''+parseInt(v);
    else return ''+v;
  };
  host.toString = function toString() {
    var buffer = [];
    if ('list' in this)
      if ('map' in this) {
        for (var i = 0; i < this.list.length; i++)
          if (this.list[i] in this.map)
            buffer.push((i == 0 ? '{' : ',')+' "'+this.list[i]+'": '+this.map[this.list[i]]);
      } else
        buffer.push(this.list.join(' '));
    else
      for (var i in this)
        if (! (i in hidden))
          buffer.push('.'+i+'('+serialize(this[i])+')');
    return buffer.join('\n');
  };
  return host;
};

Host.prototype.make = function () {
  var result = new this;
  result.name = this.name;
  result.toString = this.serialize();
  result['']      = this;
  return this.prepare(result);
};
Host.prototype.relocate = function () {
  return function dollar() {};
};
Host.prototype.duplicate = function () {
  return function underscore() {};
};
Host.prototype.serialize = function () {
  return function toString() {};
};
Host.prototype.prepare = function (host) {
  var fields = { '$': 'relocate', '_': 'duplicate' };
  for (var f in fields) if (! (f in host))
    host[f] = this[fields[f]]();
  for (var i = 0; i < this.inherits.length; i++) {
    var methods = this.inherits[i];
    for (var f in fields) for (var m in methods[f]) {
      console.log(f+m);
      host[f][m] = (function () {
        var o = this; return function () {
          return o.exec.apply(o.ctx, arguments);
        }
      }).call({ ctx: this, exec: methods[m] });
    }
  }
  return host;
};
Host.prototype.serialize = function () {
  return function toString() {
    var str = '';
    if ('current' in this && 'list' in this.current)
      srt += list.join(', ');
    return '{ '+str+' }';
  };
};

var Model = function (view) {
  return view instanceof Object
    ? 'map' in view
      ? 'list' in view ? Select : Map
      : 'list' in view ? List : Empty
    : Empty;
};

// -----------------------------------------------------------------------------
console.log('empty');

var Empty =
  { $:
    { get: function ()
      {
        if (arguments.length < 2)
          this.handles.push({ get: arguments[0] });
        else {
          var self = this, callback = arguments[1];
          this._[arguments[0]] = function () {
            callback.apply(self, aarguments);
          };
        }
      }
    , unget: function (callback)
      {
        for (var i = 0; i < this.handles.length; i++)
          if (this.handles[i].get == callback)
            this.handles.splice(i--, 1);
      }
    , set: function (callback)
      {
        if (arguments.length < 2)
          this.handles.unshift({ set: arguments[0] });
        else {
          var self = this, callback = arguments[1];
          this.$[arguments[0]] = function () {
            callback.apply(self, arguments);
          };
        }
      }
    , unset: function (callback)
      {
        for (var i = 0; i < this.handles.length; i++)
          if (this.handles[i].set == callback)
            this.handles.splice(i--, 1);
      }
    , bind: function (before, after)
      {
        if (before) this.handles.unshift({ bind: before });
        if (after) this.handles.push({ bind: after });
      }
    , unbind: function (first, last)
      {
        for (var i = 0; i < this.handles.length; i++)
          if ('bind' in this.handles[i])
            switch (this.handles[i].bind) {
            case first: case last:
              this.handles.splice(i--, 1);
              break ;
            }
      }
    }
  };

// -----------------------------------------------------------------------------
console.log('list');

var List =
  { $:
    { append: function ()
      {
        var args = listOf(arguments);
        args.splice(0, 0, this.value.length, 0);
        Array.prototype.splice.apply(monad.view, args);
      }
    , prepend: function () {}
    , insert:  function () {}
    , remove:  function () {}
    , reverse: function () {}
    , sort:    function () {}
    , map:     function () {}
    }
  , _:
    { join:  function () {}
    , at:    function () {}
    , slice: function () {}
    , fold:  function () {}
    }
  };

//console.log(__filename+': loaded');


console.log(Host);

var test = new Host();
console.log(test);
test('a.b.c.d')
  .a()
  .b()
  .c()
  .d()
console.log(test);
console.log(test);
console.log(test);


/*var toto = new Host;
console.log(require('sys').inspect(toto, true));
toto()()()()()()()()()()();
*/
