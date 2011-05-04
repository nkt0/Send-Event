Array.prototype.fold = function (accumulator, callback, context) {
  context = context || this;
  for (var i = 0; i < this.length; i++)
    accumulator = callback.call(context, this[i], accumulator, i);
  return accumulator;
};

Array.prototype.map = function (callback, context) {
  context = context || this;
  for (var i = 0, l = this.length; i < l; ++i)
    this[i] = callback.call(context, this[i], i);
  return this;
};

/*
var values = function (object) {
  var result = [];
  for (var i in object) result.push(object[i]);
  return result;
}

var concat = function () {
  return arguments.length > 1 ? Array.prototype.join.call(arguments, '')
    : arguments.length == 1
    ? arguments[0] instanceof Object ? values(arguments[0]).join('') : '' + arguments[0]
  : '';
}

var bounds = function (left, right) {
  var bounds = function (center) {
    return concat(arguments.callee.left, concat(center), arguments.callee.right);
  }
  bounds.left = left;
  bounds.right = right;
  return bounds;
};

*/

var $ = (function () {
  var cons = function (key, name, setter) {
    return function () {
      return (this[key] = function () {
        if (arguments.length > 0)
          arguments.callee[name] = setter.apply(arguments.callee, arguments);
        return arguments.callee[name];
      }).apply(this, arguments);
    }
  };

  var $root = function () {
    if (this instanceof arguments.callee) {
      if (arguments.length < 1) return this;
      else return this.$.apply(this, arguments);
    } else {
      arguments.callee.apply(new arguments.callee, arguments);
    }
  };

  $root.prototype = $root;

  $root.toString = (function () {
    return function () {
      var result = [];
      for (var i in this) {
        if (!(i in this.__proto__)) {
          result.push(i);
        }
      }
      return '$({ '+result.join(', ')+' })';
    };
  })();

  $root._ = (function () {
    var $output = function () {
      arguments.callee.reference = this;
      return arguments.callee;
    };

    $output.fold = function (accumulator, callback) {
      if (this.reference.$type) ;
    };

    $output.has = function (entity) {
      return this.fold(null, function (item, accu) {
	return accu;
      });
    };

    $output.regexp  = cons('regexp',  'pattern', function (p) { return new RegExp(p) })
    $output.number  = cons('number',  'value',   function (v) { return 0 + v });
    $output.string  = cons('string',  'value',   function (v) { return '' + v });
    $output.boolean = cons('boolean', 'true',    function (b) { return !!(t) });
    $output.array   = cons('array',   'list',    function (e) { return e instanceof Array ? e : [e] });
    $output.date    = function () {};

    return $output;
  })()

  $root.$ = (function () {
    // --
    var $query = function () {
      var queries = [];
      for (var i = 0; i < arguments.length; i++)
        switch (typeof arguments[i]) {
        case 'object':
          if (arguments[i] instanceof Object && '$' in arguments[i]) {
            // consider as an instance of $
          } else if (arguments[i] instanceof Array) {
            if (!('array' in this)) this.$.array(arguments[i]);
          } else if (arguments[i] instanceof String) {
            arguments[i--] += '';
          } else if (arguments[i] instanceof Number) {
            arguments[i--] += 0;
          } else if (arguments[i] instanceof Date) {
            if (!('date' in this)) this.$.date(arguments[i]);
          } else if (arguments[i] instanceof Object) {
            // import data
          } else {
            // only null can match
          }
          break ;
        case 'number':
          if (isFinite(arguments[i]) && arguments[i] != 0)
            this.$.number(arguments[i]);
          break ;
        case 'string':
          if (isQuery(arguments[i]) != null)
            queries.push(arguments[i]);
          else
            this.$.string(arguments[i]);
          break ;
        case 'boolean':
          break ;
        case 'function':
          if (arguments[i] instanceof RegExp)
            this.$.regexp(arguments[i]);
          break ;
        }

      // --

      if (queries.length > 0)
        queries
          .map(arguments.callee.sanitize)
          .map(arguments.callee.wrap)
          .map(arguments.callee.build, this)
      ;
      //console.log(queries);
      return this;
    };

    with ($query.Rx = {}) {
      $query.Rx.Dot               = '\\.';
      $query.Rx.Comma             = ',';
      $query.Rx.Underscore        = '_';
      $query.Rx.Dash              = '\\-';
      $query.Rx.Blank             = ' \t\r\n';
      $query.Rx.oBrace            = '\\(';
      $query.Rx.cBrace            = '\\)';
      $query.Rx.oBracket          = '\\[';
      $query.Rx.cBracket          = '\\]';
      $query.Rx._Decimal          = '0-9';
      $query.Rx._ABz              = 'A-Za-z';
      $query.Rx.Prefix            = Dot+Comma;
      $query.Rx.Separators        = Underscore+Dash;
      $query.Rx.$Blanks           = '(['+Blank+']+)';
      $query.Rx.$Separators       = '(['+Separators+']+)';
      $query.Rx.$Underscores      = '(['+Underscore+'](['+Separators+']*))';
      $query.Rx.$Name             = '((['+Underscore+_ABz+']*)['+_ABz+'](['+Underscore+_ABz+']*))';
      $query.Rx.$Digit            = '(['+_Decimal+']+)';
      $query.Rx.$Word             = '('+$Name+'(('+$Name+'|'+$Digit+')*))';
      $query.Rx.$Composed         = '('+$Word+'((['+Separators+']'+$Word+')*))';
      $query.Rx.$Element          = '(('+$Composed+')((['+Dot+Comma+']'+$Composed+')*))';
      $query.Rx.$Path             = '('+$Element+'(['+Blank+']'+$Element+')*)';
      $query.Rx.$TrimLeft         = '^(('+$Blanks+'|'+$Separators+')+)';
      $query.Rx.$TrimRight        = '(('+$Blanks+'|'+$Separators+')+)$';
      $query.Rx.$Match            = '^(['+Blank+']?)'+$Path+'(['+Blank+']?)$';
    }

    var isQuery = new RegExp($query.Rx.$Match);

    $query.sanitize = (function (Paterns) {
      var blank      = new RegExp(Paterns.$Blanks,     'g');
      var separator  = new RegExp(Paterns.$Separators, 'g');
      var left       = new RegExp(Paterns.$TrimLeft,   'g');
      var right      = new RegExp(Paterns.$TrimRight,  'g');
      return function (query) {
        return (''+query)
        .replace(left, '')
        .replace(right, '')
        .replace(blank, ' ')
        .replace(separator, '_')
      ;
      }
    })($query.Rx);

    $query.wrap = (function (constructor) {
      return constructor('route', ' ', constructor('choice', ',', function (request) {
        var position = request.indexOf('.');
	var result = new (function () {});
	result.__proto__.$order = [];
        result.__proto__.$type = 'set';
        return (position == 0 ? request.substr(1) : request)
          .split('.').map(function (field) {
            if (! (field in result)) {
              result.$order.push(field);
              result[field] = null;
	    }
            return result;
          }).pop();
      }));
    })(function (type, separator, each) {
      return function (request) {
	//console.log('wrapper');
        var position = request.indexOf(separator);
        if (position > 0) {
          var result = request.split(separator).map(each);
          if (!(result.__proto__.hasOwnProperty('$type')))
	    result.__proto__.$type = type;
        } else {
          var result = each(request);
        }
        return result;
      };
    });

    $query.build = (function () {
      var choice = function (reference, ways) {
        var modified = [];
        for (var i = 0; i < ways.length; i++) {
          var index = reference._.has(ways[i]);
          if (index == null) {
            for (var index = 0; index in reference; index++)
              ;
            reference[index] = new $root;
          }
          var result = dispatch(reference[index], ways[i]);
          reference[index] = result.reference;
          modified.push(result.modified);
        }
        return { reference: reference, modified: modified };
      };

      var route = function (reference, steps, index) {
        if (index >= steps.length) return { reference: reference, modified: [] };
        var result = dispatch(reference, steps[index]);
        console.log('step    :', result);
        for (var i = 0; i < result.modified.length; i++) {
          var context = reference[result.modified[i]];
          result.reference[result.modified[i]] =
            arguments.callee(context, steps, index + 1).reference;
        }
        return { reference: result.reference, modified: result.modified };
      };

      var set = function (reference, order, elements) {
        for (var i = 0; i < order.length; i++) {
          var context = order[i] in reference ? reference[order[i]] : new $root;
          reference[order[i]] = dispatch(context, elements[order[i]]).reference;
        }
        return { reference: reference, modified: order };
      };

      var dispatch = function (reference, model) {
        if (model) console.log('dispatch:', model.$type);
        if (model != null)
          switch (model.$type) {
          case 'set': return set(reference, model.$order, model);
          case 'route': return route(reference, model, 0);
          case 'choice': return choice(reference, model);
          };
        return { reference: reference, modified: [] };
      };

      return function () { return dispatch.call(null, this, arguments[0]); };
    })()

    return $query;
  })();

  return $root;
})();

// ******************************************************************** //

var toto1 = $('a b.c');
console.log(toto1+'');
console.log('--------------------');

var toto2 = $('a b,c');
console.log(toto2+'');
console.log('--------------------');

var toto3 = $('a b.c d');
console.log(toto3+'');
console.log('--------------------');

var toto4 = $('a b,c d');
console.log(toto4+'');
/*

var a = function () {
  for (var i = 0; i < arguments.length; i++) {
    var a = $.$.sanitize(arguments[i]);
    if (a.length > 0) console.log('[ OK ] -------------- "'+arguments[i]+'" <---> "'+a[i]+'"');
    else console.log('[fail] -------------- "'+arguments[i]+'"');
    if (a != null) {
      a = $.$.wrap(a);
    //      console.log('---------------------------');
    //      console.log(a);
    //      console.log('---------------------------');
    }
  }
  return a;
};

//throw new Error('STOP');

console.log('> OK < --------------------------------------------------');
a('A');
a('Ab');
a('AB');
a('AaBcD');
a('a');
a('ab');
a('aC');
a('a-');
a('-a');
a('_a-');
a('-a_');
a('-a-');
a('-_a');
a('0');
a('0-1');
a('A-B');
a('A-b');
a('A_B');
a('A_b');
a('A_1');
a('A-2');
a('A');
a('A');
a(' A');
a('A ');
a(' A ');
a('\t A');
a('A\t ');
a('\t A \t');
a('42a');
a('ds54af42a');
a('a.c');
a('a_');
a('_a');
a('_a_');
a('ads_sdg_Adsg_a');
a('ads_-_-_-_-sdg_Adsg_a');
a('ads--__-_sdg_Adsg_a');
a('_-a');
a('a b c d e');
a('t.c,f');
a('a', 'b', 'c');
a('a', 'a b.c d.e f,g h,i.j,k,l.m.n,o.p.q.r.s,t');
console.log('>fail< --------------------------------------------------');
a('');
a(' ');
a('-');
a('_');
a('.c');
a(',c');
a(',c.f');
a('.c,f');
a('c.,f');
a('c,.f');
console.log('>END < --------------------------------------------------');

/*
{ inline: {} }
{ block: {
  { geometry:
    { x:
      { relative:
        { margin:
          { before: { length: {} }
          , after: { length: {} }
          }
        , padding:
          { before: { length: {} }
          , after: { length: {} }
          }
        , border:
          { before: { length: {} }
          , after: { length: {} }
          }
        }
      , absolute:
        { margin:
          { before: { length: {} }
          , after: { length: {} }
          }
        , size: { length: {} }
        }
      }
      , y: 'Same as block geometry x'
    }
  , content:
    { single: {}
    , table: {}
    , list: {}
    }
  , container:
    { image:
      [
        { remote:
          { format: [{ png: null }, { gif: null }, { jpg: null }]
          , url: {}
          }
        }
      , { local:
          { format: 'Same as block container image remote format'
          , content: {}
          }
        }
      , { instance: {} }
      ]
    , position: { x: {}, y: {} }
    , attachment: [{ fixed: null }, { scroll: null }]
    , repeat: {}
    , color: {}
    }
  }
}
}

//*/

/*
var a = new $(/42/);
//var b = a();

console.log('->', a.regexp()('aasdf42b'));

a.$('toto').toto = 2;


console.log(a.toString());

//a.dump()






/*
var isNull = function (i) {
//  console.log(i.toString());
  return (! i && typeof i == 'object'
    || i instanceof Function ? i.toString() === null
       : i === null);
};
var isString = function (i) {
  return typeof a == 'string'
    || a instanceof String
    || '' + a == a
};
var isNumber = function (i) {
  return typeof a == 'number'
    || a instanceof Number
    || ! isNaN(parseInt(i))
};
var isDifferent = function (a, b) {
  return a != b
};
var isNan = function (a) {
  return a !== a
};
var isSame = function (a, b) {
  if (isString(a))
    return a == (b).to.string();
  else if (isNumber(a))
    return a == (b).to.string();
  return a == b
};
var isSum = function (a, b, c) {
  return a + b == c;
}
var isEqual = function (a, b) {
  if (b && b instanceof Object)
    return a === b.toString();
  else return a === b;
}

var reference = [Math.random()];
var a, b;
try {
[
  [ isNull, _  ]
, [ isNull, _() ]
, [ isDifferent, _(), _ ]
, [ isNull, _(null) ]
, [ isNan, _(NaN) ]
, [ isSame, '{}', _({}), ]
, [ isSame, '42', _('42') ]
, [ isSame, '42', _([42]) ]
, [ isSame, 42, 6 * _(7) ]
, [ isSame, 42, function () { return _({ ok: 42 }).ok } ]
, [ isSame, (a = _(6), a) * a + a, 42 ]
, [ isSame, _([[[6]]]) * 7, 42 ]
, [ isSame
  , 42
  , ((a = _(6), a)
     .$ = [ function (b) { return this * b }
          , function (b) { return this + b }
          ]
    , a
    )
  ]
, console.log('-- bug --')
, [ isSum, 4, function () { return '' + _({ 2: function () {} }) }, '42' ]
, [ isSum, function () { return '' + _({ 4: null }) }, 2, '42' ]
, [ isSum, function () { return '' + _({ 4: '' }) }, 2, '42' ]
, [ isEqual, _({ a: false }), false ]
, [ function ($) { return 0 + $ != 0 + $ }
  , _({ b: NaN })
  ]
, [ function (a, b, c) { return a * b == c }
  , _({ a: 21 })
  , 2
  , 42
  ]
, [ function (a, b, c) { return a / b == c }
  , 42
  , _({ a: 0 })
  , Infinity
  ]
, [ function (a, b) { return a == b }
  , _({ a: 24, b: 42 }).$('b')
  , 42
  ]
, [ function (a, b, c) { return a(a.b) == c }
  , a = _.call({ a: 6, b: 7 })
  , a.$ = function ($) { return $ * this.a }
  , 42
  ]
, [ function (a, b, c) { return a(b) == c }
  , _(function (f) { return f * 6 })
  , 7
  , 42
  ]
, [ function (a, b, c) { a[b] = c }
  , _.call({ a: 42 })
  , 'a'
  , 42
  ]
, [ function (a, b) { return '' + a == b }
  , _.call(null)
  , 'null'
  ]
, [ isSame, _([[[6]]]) * 7, 42 ]
, [ isSame, _([{ q: [[{t: 6}]] }])._(function () { this.number * this.to.number() + this._('q.t') }), 42 ]
, [ function ($) { return isNaN($ / $) }
  , _.call(Infinity)
  ]
].map(function (e, i) {
  console.log('########################## TEST '+i+' #####################################');
  var args = [];
  for (var j = 1; j < e.length; j++)
    args.push(e[j] instanceof Function && ! ('$' in e[j]) ? e[j]() : e[j]);
  if (e[0].apply(e, args)) console.log('----> [OK]');
  else
    throw console.log('--> [FAIL]\n', 1);
});
} catch (e) {
  console.log('test failure:', e);
  if (e instanceof Error)
    console.log(e.stackTrace || e.stack);
}
//*/
