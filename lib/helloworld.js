var debug = true;
//debug = false;

var hello1 = _('words.separator.suffixe').$name('hello-1')
  ._(function () { return this.words._join(this.separator())+this.suffixe(); })
  .$(function (value) { this.words.$replace(1, value); })
  .separator(' ')
  .words(_('hello').$name('word'), 'world')
  .suffixe('!')
;

console.log('------------------------ EXECUTION ----------------------');

console.log('TEST 1:', hello1());
// -> 'hello world'

console.log('TEST 2:', hello1('nico')());
// -> 'hello nico'

console.log('TEST 3:', hello1.words());
// -> ['hello', 'nico']

console.log('TEST 4:', hello1());
// -> 'hello nico'

console.log('TEST 5:'
           , hello1.words.$replace(0, 'Bonjour')
                  ('Cam00')
                  .words()
           );
// -> ['Bonjour', 'Cam00']

var hello2 = hello1._().$name('hello-2');
hello1('Fooby')

console.log('TEST 6:', hello2());
// 'Bonjour Cam00'

console.log('TEST 7:', hello2.separator('_')());
// 'Bonjour_Cam00'

console.log('TEST 8:', hello1());
// 'Bonjour Fooby'

console.log('TEST 9', _()
  .$(function () { this.toto(this.toto() + 1); })
  ._(function () { return this.toto() + 1; })
  .$and('toto')
  .toto(40)
  (NaN)
  ())
;
// 42
