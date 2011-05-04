Array.prototype.has = function (elem) {
  for (var i = 0; i < this.length; i++)
    if (this[i] == elem)
      return true;
  return false;
};

var toto =
(
  (function () {
    // ---------------------------- Comment --------------------------------- //
    var Comment = {};
    // ---------------------------------------------------------------------- //


    // --------------------------- Worker ----------------------------------- //
    var Worker =
      { stack: []
      , simplifier:
        { dot:   { separator: '.', map: { find: null, wrap: null } }
        , comma: { separator: ',', map: { order: null } }
        }
      };

    // -- Worker: Rooter
    Comment.WorkerRooter                = '// -- Worker : Rooter';

    Worker.rooter = function () {
      //**/console.log(Comment.WorkerRooter);
      var reference = Constructor.$function();
      for (var i = 0; i < arguments.length; i++)
        Worker.stack.push({ source: arguments[i], target: reference });
      while (Worker.stack.length > 0) {
        var item = Worker.stack.shift();
        Worker.builder(item.source, item.target);
      }
      return reference;
    };

    // -- Worker: Element Builder
    Comment.WorkerBuilter               = '// -- Worker : Builder';

    Worker.builder = function (source, target) {
      //**/console.log(Comment.WorkerBuilter);
      for (var key in source) if (source.hasOwnProperty(key))
        if (key.indexOf('$') != 0) Worker.attribute.call(target, key, source[key]);
        else Worker.builtin.call(target, key.substr(1), source[key]);
    };

    // -- Worker: Builtin Definer
    Comment.WorkerBuiltin               = '// -- Worker : Buidler : Builtin';

    Worker.builtin = function (name, item) {
      //**/console.log(Comment.WorkerBuiltin);
      //**/console.log('$$', name);
      if (!(item instanceof Array))
        for (var i in Worker.simplifier)
          if (name in Worker.simplifier[i].map)
            return this.$[name] = ('' + item).split(Worker.simplifier[i].separator);
      return this.$[name] = item;
    };

    // -- Worker: Attibute Definer
    Comment.WorkerAttribute             = '// -- Worker : Builder : Attribute';

    Worker.attribute = function (name, item) {
      //**/console.log(Comment.WorkerAttribute);
      //**/console.log('--', name);
      if (item instanceof Object)
        if (item instanceof Function) this[name] = item;
        else {
          this[name] = Constructor.$function();
          this[name]._.parent = this;
          this[name]._.keys.push(name);
          Worker.stack.push({ source: item, target: this[name] });
        }
      else this[name] = Figure.constant(item);

      return this[name];
    };

    // ---------------------------------------------------------------------- //


    // -------------------------- Figure ------------------------------------ //
    var Figure  = {};

    // -- Figure: Constant
    Comment.FigureConstant              = '// -- Figure : Constant';

    Figure.constant = function () {
      /**/console.log(Comment.FigureConstant);
      var reference = [];
      for (var i = 0; i < arguments.length; i++)
        reference.push(arguments[i]);

      return function () {
        if (reference.length > 1) return reference.concat();
        else if (reference.length == 1) return reference[0];
        else if (arguments.length == 0) return arguments.callee;
        for (var i = 0; i < arguments.length; i++)
          if (arguments[i]) {
            if (arguments[i] instanceof Object)
              /**/console.log('[WARNING] reference in constante');
            reference.push(arguments[i]);
          }
        arguments.callee.toString = arguments.callee;
        return arguments.callee();
      };
    };

    // -- Figure: Identity
    Comment.FigureIdentity              = '// -- Figure : Identity';

    Figure.identity = function (arg) {
      /**/console.log(Comment.FigureIdentity);
      return arg;
    }

    // ---------------------------------------------------------------------- //
    

    // ---------------------------- Tools ----------------------------------- //
    var Tools = {};

    // -- Tools: Get Path To Root
    Comment.ToolsGetRoot                = '// -- Tools : getRoot';

    Tools.getRoot = function (context) {
      /**/console.log(Comment.ToolsGetRoot);

      var path = [];
      while (context._.parent != null) {
        path.unshift(context._.keys);
        context = context._.parent;
      }
      return path;
    };

    // ---------------------------------------------------------------------- //


    // ------------------------------ Constructor --------------------------- //
    var Constructor = { singles: ['find', 'figure', 'wrap', 'default'], stack: {} };
    
    // -- Constructror: New Function
    Comment.ConstructorFunction         = '// -- Constructor : Function';

    Constructor.$function = function () {
      //**/console.log(Comment.ConstructorFunction);

      var reference = function () {
        var context = arguments.callee;
        var callpath = Tools.getRoot(context).join('.');
        /**/console.log('-->', callpath);
        /**/console.log(Comment.ConstructorFunction, ': Execution');
	
	/*
        if (callpath in Constructor.stack) throw new Error(callpath+' already exists');
        else Constructor.stack[callpath] = null;
        */

        var args = Builtin.$order(context);
        for (var i = 0; i < Constructor.singles.length; i++)
          if (context.$.hasOwnProperty(Constructor.singles[i]))
            return Builtin['$' + Constructor.singles[i]](context, args);

        //delete Constructor.stack[callpath];
      };
      reference.__proto__ = Constructor.$proto(reference);
      return reference;
    };


    // -- Constructor: Function Prototype
    Comment.ConstructorProto            = '// -- Constructor : Function : Prototype';

    Constructor.$proto = function (underscore) {
      //**/console.log(Comment.ConstructorProto);
      return new (function (underscore) {
        this._        = Constructor.underscore.apply(underscore);
        this.$        = Constructor.dollar();
	this.toString = Constructor.$toString;
      })(underscore);
    };


    // -- Constructor: Prototyper Dollar
    Comment.ConstructorDollar           = '// -- Constructor : Prototyper : Dollar';

    Constructor.dollar = function () {
      //**/console.log(Comment.ConstructorDollar);
      return function () {
        /**/console.log(Comment.ConstructorDollar, ': Execution');
      };
    };


    // -- Constructor: Prototyper Underscore
    Comment.ConstructorUnderscore       = '// -- Constructor : Prototyper : Underscore';

    Constructor.underscore = function (reference) {
      //**/console.log(Comment.ConstructorUnderscore);
      var underscore = function () {
        /**/console.log(Comment.ConstructorUnderscore, ': Execution');
      };
      underscore.parent    = null;
      underscore.uid       = Math.random();
      underscore.keys      = [];
      underscore.reference = reference;
      return underscore;
    };


    // -- Constructor: Prototyper To String
    Comment.ConstructorToString         = '// -- Constructor : Prototyper : To String';

    Constructor.$toString = function (reference) {
      //**/console.log(Comment.ConstructorToString);
      var buff = [];
      for (var i in this) 
	if (this.hasOwnProperty(i))
	  buff.push(i);
      buff.push();
      return '{ ' + buff.join('; ') + ' }';
    };
    // ---------------------------------------------------------------------- //


    // ---------------------------- Builtin --------------------------------- //
    var Builtin = {};

    Builtin.seek = function (context, path) {
      while (context._.parent != null)
        if (context._.keys.has(path[0])) break ;
        else context = context._.parent;
      
      if (context)
        for (var i = 1; i < path.length; i++) {
          if (context instanceof Object && context.hasOwnProperty(path[i]))
            context = context[path[i]];
          else
            throw new Error(path.join('.')+' not found from '+Tools.getRoot(context).join('.'));
        }

      return context;
    };

    // -- Builtin: Default
    Comment.BuiltinDefault              = '// -- Builtin : Default';

    Builtin.$default = function (context, args) {
      /**/console.log(Comment.BuiltinDefault);

      if (context.$.hasOwnProperty('default'))
	return context[context.$.default]();

      return args;
    }

    // -- Builtin: Find
    Comment.BuiltinFind                  = '// -- Builtin : Find';

    Builtin.$find = function (context, args) {
      /**/console.log(Comment.BuiltinFind);

      var element = Builtin.seek(context, context.$.find);

      return element instanceof Function ? element() : element;
    };

    // -- Builtin: Wrap
    Comment.BuiltinWrap                  = '// -- Builtin : Wrap';

    Builtin.$wrap = function (context, args) {
      /**/console.log(Comment.BuiltinWrap);

      if (context.$.wrap instanceof Function)
	return context.$.wrap.apply(context, args);
      else if (context.$.wrap instanceof Array)
	return Builtin.seek(context, context.$.wrap).apply(context, args);

      return args;
    };


    // -- Builtin: Figure
    Comment.BuiltinFigure              = '// -- Builtin : Figure';

    Builtin.$figure = function (context, args) {
      /**/console.log(Comment.BuiltinFigure);
      if (context.$.figure in Figure)
        return Figure[context.$.figure];
    };

    // -- Builtin: Order
    Comment.BuiltinOrder               = '// -- Builtin : Order';

    Builtin.$order = function (context) {
      /**/console.log(Comment.BuiltinOrder);
      var args = [];
      if (context.$.hasOwnProperty('order'))
        for (var i = 0; i < context.$.order.length; i++)
          args.push(context[context.$.order[i]]());
      else
        for (var i in context)
          if (context.hasOwnProperty(i))
            args.push(context[i]());
      return args;
    };
    // ---------------------------------------------------------------------- //

    // ---------------------------- Return ---------------------------------- //
    return Worker.rooter;
  })()
)(
  { text:
    { concat: function () { return Array.prototype.join.call(arguments, ''); }
    , pattern:
      { quantity:
        { $default:  'One'
        , One:       { $figure: 'identity' }
        , OneOrMore:
          { $wrap:   'text.concat'
          , $lambda: 1
          , $order:  'begin,end'
          , begin:   '('
          , end:     '+)'
          }
        , MayOne:
          { $wrap:   'text.concat'
          , $lambda: 1
          , $order:  'begin,end'
          , begin:   '('
          , end:     '?)'
          }
        , MayMany:
          { $wrap:   'text.concat'
          , $lambda: 1
          , $order:  'begin,end'
          , begin:   '('
          , end:     '*?)'
          }
        }
      , single:
        { dot:        '\\.'
        , comma:      ','
        , underscore: '_'
        , hyphen:     '\\-'
        , semicolon:  ';'
        , space:      ' '
        , cr:         '\r'
        , lf:         '\n'
        }
      , couple:
        { braces:
          { $wrap: 'text.concat'
          , open:  '\\('
          , close: '\\)'
          }
        , brakets:
          { $wrap: 'text.concat'
          , open:  '\\['
          , close: '\\]'
          }
        }
      , classes:
        { $wrap: function (chars) { return '[' + chars + ']'; }
        , blanks:
          { $wrap: 'text.concat'
          , space: { $find: 'pattern.single.space' }
          , crlf:
            { $wrap: 'text.concat'
            , cr:    { $find: 'pattern.single.cr' }
            , lf:    { $find: 'pattern.single.lf' }
            }
          , tabs:
            { $wrap:      'text.concat'
            , horizontal: '\t'
            , vertical:   '\v'
            }
          }
        , decimal:
          { $wrap:
	    function () {
	      return arguments.length > 0
		? Array.prototype.join.call(arguments, '')
		: '0-9';
	    }
          , one:   '1'
          , two:   '2'
          , three: '3'
          , four:  '4'
          , five:  '5'
          , six:   '6'
          , seven: '7'
          , eight: '8'
          , nine:  '9'
          , zero:  '0'
          }
        , hexadecimal:
          { $wrap:   'text.concat'
          , hexa:    'A-Fa-f'
          , decimal: { $find: 'classes.decimal' }
          }
        , alpha:
          { $wrap:     'text.concat'
          , uppercase: 'A-Z'
          , lowercase: 'a-z'
          }
        }
      , boundaries:
        { start:
          { $lambda:   1
          , $wrap:     'text.concat'
          , $order:    'delimiter'
          , delimiter: '^'
          }
        , finish:
          { $lambda:   0
          , $wrap:     'text.concat'
          , $order:    'delimiter'
          , delimiter: '$'
          }
        }
      , bundles:
        { blanks:
          { $wrap:       'classes'
          , blanksClass:
            { $root:       'pattern'
            , $wrap:       'quantity.OneOrMany'
            , blanksChars: 'classes.blanks'
            }
          }
        , separators:
          { $wrap:    'classes'
          , sepClass:
            { $wrap:    'pattern.quantity.One'
            , sepChars:
              { $wrap:      'text.concat'
              , underscore: { $find: 'pattern.single.underscore' }
              , hyphen:     { $find: 'pattern.single.hyphen' }
              }
            }
          }
        , word:
          { $wrap:  'text.concat'
          , $order: 'simple,addon'
          , simple:
            { $root: 'pattern'
            , $wrap: 'quantity.OneOrMore'
            , $with: ['classes.alpha']
            }
          , addon:
            { $wrap:  'text.concat'
            , $order: 'glue,needle'
            , glue:   { $find: 'bundles.separators' }
            , needle: { $find: 'word.simple' }
            }
          }
        }
      }
    }
  }
);

/**/console.log('----------------------');
/**/console.log('----------------------');
/**/console.log('----------------------');
/**/console.log(toto);

/**/console.log('----------------------');
/**/console.log('----------------------');
/**/console.log('------- Blanks -------');
/**/console.log('"', toto.text.pattern.bundles.separators(), '"');
