var listOf = function (obj) {
  var list = [];
  if (! (obj instanceof Object)) return list;
  for (var i = 0; true; i++)
    if (i in obj) list.push(obj[i]);
    else return list;
};

var mapOf = function (list) {
  var map = {};
  if (! (list instanceof Array)) return map;
  for (var i = 0; i < list.length; i++)
    map[list[i]] = null;
  return map;
};

var Keywords =
  [ '_', '$', 'call', 'apply', 'name'
  , 'this', 'for', 'var', 'while', 'case'
  , 'switch', 'class', 'break', 'continue'
  , 'try', 'catch', 'finaly', 'if', 'else'
  , 'public', 'private', 'new', 'delete'
  , 'import', 'export', 'comment', 'void'
  , 'function', 'prototype', 'return', 'var'
  , 'with', 'abstract', 'boolean', 'byte'
  , 'char', 'double', 'false', 'true'
  , 'goto', 'in', 'int', 'implements'
  , 'long', 'instanceof', 'native', 'null'
  , 'package', 'protected', 'short', 'static'
  , 'synchronized', 'throws', 'transient'
  , 'throw', 'super', 'extends', 'enum'
  , 'debugger', 'const', 'toString'
  ];

// Tree
var Tree = function (obj) {
  this.value = typeof (obj) == 'object' ? obj : {};
  return this;
};

Tree._writer = {};

Tree._writer._this = function (value) {
  this._this = value;
  return this;
};

Tree._writer._child = function (value) {
  this._child = value;
  return this;
};

Tree.prototype.isSlice = function (element) {
  if (! (element instanceof Object)) return false;
  if ('_this' in element) return true;
  else return false;
}

Tree.prototype.pack = function (value, level) {
  return { _value: value, _level: level };
};

Tree.prototype.map = function (callback, depth, context) {
  var spool = [this.pack(this.value, 0)];
  var setters = [];
  depth = depth > 0 ? depth : Infinity;
  while (spool.length > 0) {
    var item = spool.shift();
    for (var i in item._value) {
      if (item._level < depth && typeof (item._value[i]) == 'object')
        spool.push(this.pack(item._value[i], item._level + 1));
      if (! (this.isSlice(item._value[i]))) {
        var result = callback.call(context || item._value, item._value[i], item._level);
        setters.push({ context: item._value, key: i, value: result });
      }
    }
  }
  while(setters.length)
    Set(setters.shift());
  return this;
};

// String
String.prototype.count = function () {
  var count = 0;
  for (var i = 0; i < arguments.length; i++)
    count += this.split(arguments[i]).length - 1;
  return count;
};

String.prototype.repeat = function (times) {
  var result = [];
  if (! (times > 0 && isFinite(times))) return result;
  for (var i = 0; i < times; i++)
    result.push(this);
  return result;
};

String.prototype.explode = function (separator, worker, pack, unpack) {
  if (!worker) worker = Identity;
  if (!pack) pack = Identity;
  if (!unpack) unpack = function (o) { return o.shift() };
  var result = this.split(separator).map(worker)
  if (result.length > 1) return pack(result);
  else return unpack(result);
};

// Array
if (typeof Array.prototype.map == 'undefined')
  Array.prototype.map = function (callback, context) {
    return this.map.call(this, callback, [], context);
  };

Array.prototype.has = function (alpha) {
  for (var i = 0; i < this.length; i++)
    if (this[i] == alpha) return true;
  return false;
}

Array.prototype.chain = function (head, tail, context) {
  var tailler = function (node) {
    return function () {
      var result = {};
      tail.call(node, result);
      return result;
    };
  };
  var result = tailler({})();
  this.fold.call(this, function (e, a) {
      var node = a();
      head.call(node, e);
      return tailler(node);
    }
  , function () { return result; }
  , context
  );
  return result;
};

Array.prototype.toTree = function () {
  return new Tree(this.chain(Tree._writer._this, Tree._writer._child));
};

Array.prototype.fold = function (callback, result, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++)
    result = callback.call(context, this[i], result, i);
  return result;
};

Array.prototype.except = function (callback, context) {
  return this.only(function () {
    return !(callback.apply(context, arguments));
  });
};

Array.prototype.only = function (callback, context) {
  context = context || this;
  var result = [];
  var response = false;
  for (var i = 0; i < this.length; i++) {
    response = callback.call(context, this[i], i);
    if (response == true) result.push(this[i]);
  }
  return result;
};

Array.prototype.callAll = function () {
  for (var i = 0; i < this.length; i++)
    if (this[i] instanceof Function)
      this[i].apply(this, arguments);
};

/*
Function.prototype.toString = (function () {
  var execpts = mapOf(Keywords);
  return function () {
    return 'function';
    var keys = [];
    for (var i in arguments.callee)
      if (! (i in execpts))
        keys.push(i);
    return keys.join('');
  };
})();
*/
/* ********************** */

// Constructor
var _and     = function (e) { return { '_and': e }; };
var _or      = function (e) { return { '_or': e }; };
var _with    = function (e) { return { '_with': e }; };
var _without = function (e) { return { '_without': e }; };

// Checker
var isEmptyString = function (e) { return (''+e) == ''; };

// Identities
var Set = function (item) {
  item.context[item.key] = item.value;
  return item;
};

var Identity = function (alpha) {
  return alpha;
};

// Splitter
var Parser = function (item) {
  return (''+item).replace(/\ +/g, ' ').split(' ').toTree()
    .map(function (value) {
      return value.explode('.', function (value) {
        return value.explode(',', function (value) {
          if (value.indexOf('?') == 0)
            return _with(value.substr(1));
          else if (value.indexOf('!') == 0)
            return _without(value.substr(1));
        }, _or);
      }, _and);
    });
};

/* ************************** */


/* *************************** */
var flatten = function (obj) {
  var list = [];
  for (var i in obj) list.push(i);
  return list.join(' ');
}

var _ = (function () {
  var __LIST__      = {};
  var __MAP__       = {};
  var __ENUM__      = {};
  var __SINGLE__    = [__LIST__, __MAP__, __ENUM__];
  var __EMPTY__     = [__SINGLE__, __LIST__, __MAP__, __ENUM__];
  var __RECORD__    = {};
  var __SET__       = {};
  var __ITER__      = {};
  __LIST__.toString   = function () { return '(list)'; };
  __MAP__.toString    = function () { return '(map)'; };
  __ENUM__.toString   = function () { return '(enum)'; };
  __SINGLE__.toString = function () { return '(single)'; };
  __EMPTY__.toString  = function () { return '(empty)'; };
  __RECORD__.toString = function () { return '(record)'; };
  __SET__.toString    = function () { return '(set)'; };
  __ITER__.toString   = function () { return '(iterator)'; };

  var Secure = (function () {
    var token, Checker = function () {
      this.id = Math.random()
      this.match = function (reference) {
        return reference === token;
      };
      return this;
    };
    token = new Checker;
    return { protect: function (data) {
               return function (check) {
                 if (! (check instanceof Checker)) return null;
                 if (! check.match(token)) return null;
                 return data;
               };
             }
           , token: token
           };
  })();

  var Resolver = function () {
    var self = this;
    var Primitive =
      { name: '([a-zA-Z]([a-zA-Z0-9]*))'
      , dot = '[\\.]'
      , comma = '[,]'
      , decimal = '([0-9]+)'
      , hexadecimal = '((0[xX])?([0-9A-Fa-f]+))'
      , color = '[#]([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})'
      };
    var Types =
      { Map:     '^('+Primitives.name+'('+Primitives.dot+Primitives.name+')+)$'
      , Single:  '^'+Primitives.name+'$'
      , Enum:    '^('+Primitives.name+'('+Primitives.comma+Primitives.name+')+)$'
      , Figure:  '^'+Primitives.decimal+'$'
      , Range:   '^'+Primitives.decimal+'-'+Primitives.decimal+'$'
      , Keyword: '(^|'+Primitives.dot+')('+Keywords.join('|')+')('+Primitives.dot+'|$)'
      };
    var Regexps =
      { Map:     new RegExp(Types.Map)
      , Single:  new RegExp(Types.Single)
      , Enum:    new RegExp(Types.Enum)
      , Range:   new RegExp(Types.Range)
      , KeyWord: new RegExp(Types.Keyword)
      };
    var Compare =
      { gt: function (left, right) { return left > right; }
      , lt: function (left, right) { return left < right; }
      , ge: function (left, right) { return left >= right; }
      , le: function (left, right) { return left <= right; }
      , eq: function (left, right) { return left == right; }
      };
    var Models =
      { empty: function (m) { return ! ('x' in m || 'y' in m); }
      , list:  function (m) { return m.x instanceof Array && ! ('y' in m); }
      , map:   function (m) { return ! ('x' in m) && m.y instanceof Object; }
      , set:   function (m) { return m.x instanceof Array && m.y instanceof Object; }
      , iter:  function (m) { return m.x instanceof Function && m.y instnanceof Object; }
      };

    this.model = function (first) {
      if (first instanceof Function) {
        if ('$$' in first && '$$' instanceof Function) {
          var monad = first.$$(Secure.token);
          if (monad instanceof Monad) {
            switch (monad.model) {
            case __SINGLE__: case __LIST__:
            case __MAP__: case __ENUM__:
              return monad.model;
            default: return __LIST__;
            }
          }
          else if (first instanceof RegExp) { return __ENUM__; }
          else throw __LIST__;
        }
      } else {
        switch (typeof (first)) {
        case 'string':
          if (Regexps.Keyword(first)) {
            console.log('keywords detected in: '+first);
            return __LIST__;
          }
          else if (Regexps.Single(first)) return __SINGLE__;
          else if (Regexps.Map(first))    return __MAP__;
          else if (Regexps.Enum(first))   return __ENUM__;
          else if (Regexps.Range(first)
               && Compare.le.apply(null, (''+first).split('-')))
            return __LIST__;
          else return __LIST__;
        case 'number': return __LIST__;
        case 'boolean': return __ENUM__;
        default:
          if (first instanceof Array) return __LIST__;
          else if (first instanceof Date) return __LIST__;
          else if (first instanceof Object) return __MAP__;
          else return __LIST__;
          break ;
        }
      }
      throw new Error('typing fail');
    };
  };
  Resolver.prototype.view = function (args, model) {
    switch (model) {
    case __SINGLE__:
      break ;
    case __MAP__:
      break ;
    case __ENUM__:
      break ;
    case __LIST__:
      break ;
    default : throw new Error('unknown type');
    }
  };

  Resolver.prototype.name = function (args, model, view) {
  };

  Resolver = new Resolver;

  var Monad = function (name, parent) {
    if (parent) this.parent = parent;
    try { if (debug) this.verbose = true; } catch (e) {};
    if (name instanceof Array) this.names = name;
    else if (name) this.names  = [name];

    this.log('new Monad('+name+')');
    this.initialize();

    return this;
  };
  Monad.prototype.apply = function (args) {
    this.log('apply', args);
    if (args.length == 0) return this.get();
    else return this.set.apply(this, args);
  };
  Monad.prototype.toString = function () {
    var str = '', spool = [];
    if (this.view instanceof Array)
      for (var i = 0; i < this.view.length; i++)
        spool.push(this.view[i]);
    else
      for (var i in this.view)
        spool.push(i);
    if (this.model == __MAP__) return spool.join('.');
    else if (this.model == __LIST__) return '['+spool.join(',')+']';
    else if (this.model == __ENUM__) return spool.join(',');
  };
  Monad.prototype.get = function () {
    this.log('get');
    var result, i;
    if ((this.getter || []).length > 0) {
      this.log('get', 'getter perso (exec)')
      for (var i = 0; i < this.getter.length; i++)
        result = this.getter[i].call(this.host, result);
      return result;
    } else if ([__MAP__, __ENUM__].has(this.model)) {
      result = {};
      for (i in this.view)
        result[i] = this.view[i].host();
      return result;
    } else if (this.model == __LIST__) {
      result = [];
      for (i = 0; i < this.view.length; i++)
        result.push(this.view[i] instanceof Monad
                    ? this.view[i].host()
                    : this.view[i]);
      return result.length > 1 ? result : result[0];
    } else if (this.model == __SINGLE__) {
      for (i in this.view) return ''+i;
    } else return this.host;
  };
  Monad.prototype.set = function () {
    this.log('set', arguments);
    var model = Resolver.model(arguments);




    if ((this.setter || []).length > 0) {
      for (i = 0, result = listOf(arguments); i < this.setter.length; i++)
        result = this.setter[i].apply(
          this.host, result instanceof Array ? result : [result]
        );
    } else {
      
      view = Resolver.view(arguments, model);
      name = Resolver.name(arguments, model, view);
      switch (this.model) {
      case undefined: case __EMPTY__:
        switch (model) {
        default:
          this.view = view;
          this.model = model;
          break ;
        }
        break ;
      case __LIST__:
        switch (model) {
        case __LIST__: this.host.$append(listOf(arguments)); break ;
        default: throw new Error(this.model+' <- '+model);
        }
        break ;
      case __SINGLE__: case __MAP__:
        switch (model) {
        case __SINGLE__: case __MAP__: this.host.$and(arguments) break ;
        case __LIST__: for (var l = listOf(arguments); l.length > 0; l.shift())
          arguments.callee.apply(this, l[0]);
          break ;
        default: throw new Error(this.model+' <- '+model);
        }
        break ;
      case: __ENUM__:
        switch (model) {
        case __SINGLE__: case __ENUM__: this.host.$or(arguments) break ;
        case __LIST__: for (var l = listOf(arguments); l.length > 0; l.shift())
          arguments.callee.apply(this, l[0]);
          break ;
        default: throw new Error(this.model+' <- '+model);
        }
        break ;
      }
      return arguments.callee.apply(this, arguments);
    return 'parent' in this
      ? this.initialize(this.parent).parent.host.$(this.names)
      : this.initialize().host;
  };
  Monad.prototype.initialize = function (root) {
    root = root instanceof Monad ? root : this;
    this.log('initialize');
    var monad    = this;
    this.host    = function () { return monad.apply(listOf(arguments)); };
    this.host._  = function () { return monad.underscore.apply(monad, arguments); };
    this.host.$  = function () { return monad.dollar.apply(monad, arguments); };
    this.host.$$ = Secure.protect(this);
    this.overload(root);
    return this;
  };
  Monad.prototype.sync = function (remote, index) {
    var monad = (remote || this.host).$$(Secure.token);
    this.parent.view[index || this.names[0]] = monad;
    return monad;
  };
  Monad.prototype.overwrite = function (value, index) {
    this.log('overwrite', value.model, index);
  };
  Monad.prototype.underscore = function () {
    this.log('underscore');
    if (arguments.length < 1) return this.clone().host;
    else if (arguments.length == 1 && arguments[0] instanceof Function) {
      this.getter = listOf(arguments);
      return this.host;
    } else
      return this.filter.apply(this, arguments).clone().host
  };
  Monad.prototype.dollar = function () {
    this.log('dollar');
    if (arguments.length < 1) return this.reference();
    else if (arguments.length == 1 && arguments[0] instanceof Function) {
      this.setter = listOf(arguments).concat(this.setter || []);
      return this.host;
    } else
      return this.filter.apply(this, arguments).reference();
  };
  Monad.prototype.filter = function () {
    this.log('filter');
    var limit = this.limit, field, i, k;
    for (i = 0; i < arguments[i]; i++, limit = this.limit) {
      this.limit = {};
      if (arguments[i] instanceof Array)
        for (k = 0; k < arguments[i].length; k++) {
          field = arguments[i][k];
          if (field in limit) this.limit[field] = limit[field];
        }
    }
    this.limit = limit;
    return this.initialize();
  };
  Monad.prototype.clone = function (parent) {
    this.log('clone');
    var clone = new Monad(this.names, parent);
    clone.model = this.model;
    if ('getter' in this) clone.getter = [].concat(this.getter);
    if ('setter' in this) clone.setter = [].concat(this.setter);
    switch (clone.model) {
    case __LIST__:
      clone.view = [];
      for (var i = 0 ; i < this.view.length; i++)
        clone.view.push(this.view[i] instanceof Monad
                        ? this.view[i].clone(clone)
                        : this.view[i]);
      break ;
    case __MAP__: case __ENUM__: case __SINGLE__:
      clone.view = {};
      for (var i in this.view)
        clone.view[i] = this.view[i].clone(clone);
      break ;
    }
    return clone.initialize();
  };
  Monad.prototype.reference = function () {
    this.log('reference');
    return this.host;
  };
  Monad.prototype.overload = function (root) {
    this.log('overload');
    this.toAll(root);
    switch (this.model) {
    case __ENUM__: case __MAP__: this.toFields(root); break ;
    case __LIST__: this.toList(root); break ;
    default: case __SINGLE__:
      this.toSingle(root); break ;
    };
    return this;
  };
  Monad.prototype.toAll = function (root) {
    this.log('toAll');
    var monad = this;
    this.host.$name = function () {
      return monad.names = listOf(arguments), monad.log('$name'), monad.host;
    };
    this.host._at = function (n) {
      return monad.view[n] instanceof Monad ? monad.view[n].host : monad.view[n];
    };
    this.host._fold = function (callback, result) {
      switch (monad.model) {
      case __LIST__:
        for (var i = 0; i < monad.view.length; i++)
          if (monad.view[i] instanceof Monad)
            result = callback.call(monad.view[i].host, i, result);
        return result;
      case __MAP__: case __ENUM__: case __SINGLE__:
        for (var i in monad.view)
          result = callback.call(monad.view[i].host, i, result);
        return result;
      default: throw new Error('not yet implemented');
      };
    };
  };
  Monad.prototype.toFields = function (root) {
    this.log('toFields');
    this.host.$with = function () {}; // Input
    this.host.$without = function () {}; // Input
    for (var i in this.view)
      this.host[i] = this.host._at(i);
  };
  Monad.prototype.toList = function (root) {
    this.log('toList');
    var monad = this;
    this.host.$append = function () {
      var args = listOf(arguments);
      args.splice(0, 0, monad.view.length, 0);
      Array.prototype.splice.apply(monad.view, args);
      return root.host;
    }; // Input
    this.host.$prepend = function () {}; // Input
    this.host._join = function (separator) {
      var result = [];
      for (var i = 0; i < monad.view.length; i++) {
        if (monad.view[i] instanceof Monad)
          result.push(monad.view[i].host());
        else result.push(monad.view[i]);
      }
      return result.join(separator);
    }; // Output
    this.host.$insert = function (offset) {}; // Input
    this.host.$replace = function (offset) {
      var args = listOf(arguments);
      args.splice(0, 1, offset, arguments.length - 1);
      Array.prototype.splice.apply(monad.view, args);
      return root.host;
    }; // Input
    this.host.$remove = function (offset, length) {
      monad.view.splice(offset, length);
      return root.host;
    }; // Input
    this.host._slice = function (offset, length) {}; // Output
    this.host.$reverse = function (offset, length) {}; // Input
    this.host.$sort = function (offset, length) {}; // Input
  };
  Monad.prototype.toSingle = function (root) {
    this.log('toSingle');
    var monad = this;
    this.host.$or = function () {}; // Input
    this.host.$add = function () {}; // Input
    this.host.$and = function () {
      monad.model = __MAP__;
      if (! ('view' in monad)) monad.view = {};
      var fields; console.log('-------------');
      for (var i = 0; i < arguments.length; i++) {
        console.log(arguments[i]);
        if (Resolver.isMap(arguments[i])) fields = (''+arguments[i]).split('.');
        else if (Resolver.isSingle(arguments[i])) fields = [''+arguments[i]];
        else fields = [];
        for (var j = 0; j < fields.length; j++)
          if (! (fields[j] in monad.view)) {
            monad.view[fields[j]] = new Monad(fields[j], monad);
          }
      }
      return root.initialize().host;
    }; // Input
  };
  Monad.prototype.log = (function () {
    if (typeof (debug) != 'undefined')
      setInterval(function () {
        if (date + 500 < (new Date).getTime()) {
          flush(' ...');
        }
      }, 1000);
    var last, str, date;
    var flush = function () {
      if (str) console.log(str+listOf(arguments));
      str = '';
      date = (new Date).getTime();
      last = NaN;
    };
    flush();
    return function (name) {
      if (! (this.verbose)) return ;
      var local = 'names' in this && this.names.length > 0 ? ''+this.names : '(???)';
      if (last != local) {
        flush();
        last = local;
        str = local+': '+(this.model || __EMPTY__);
        var args = listOf(arguments).slice(1);
        str += ': '+name;
        for (var i = 0; i < args.length; i++)
          if (args[i] instanceof Array || ''+args[i] == '[object Arguments]') {
            if (args[i].length == 1) {
              if (Resolver.isRecord(args[i][0]))
                str += '('+args[i][0].$$(Secure.token)+')';
              else str += '('+args[i][0]+')';
            }
          } else if (args[i] instanceof Object) {
            str += '('+flatten(args[i])+')';
          } else str += '('+args[i]+')';
      } else {
        str += ', '+name;
        date = (new Date).getTime();
        return this;
      };
    }
  })();

  return function () {
    var monad = new Monad;
    return monad.host.apply(monad, arguments);
  };
})();


/**


*/

