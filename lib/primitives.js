var _Text = Map('charset', 'string')
  .$.get(function () {})
  .$.set(function () {})
  .charset(List('utf8', 'ascii'))
  .string(
    Map('words', 'separator')
      .words(List())
      .separator(List(' '))
  )
;

var _Image = Map('format', 'url', 'width', 'height')
  .$.get(function () {})
  .$.set(function () {})
  .format()
  .url()
  .width()
  .height()
;

var _Number = Map('value', 'divisor')
  .$.get(function () {})
  .$.set(function () {})
  .value()
  .divisor()
;

var _Date = Map('timestamp', 'epoch')
  .$.get(function () {})
  .$.get('format', function () {})
  .$.get('year', function () {})
  .$.get('month', function () {})
  .$.get('day', function () {})
  .$.get('hour', function () {})
  .$.get('minute', function () {})
  .$.get('seconde', function () {})
  .$.get('useconde', function () {})
  .$.set(function () {})
  .$.set('timestamp', function () {})
  .$.set('epoch', function () {})
  .timestamp(_Number())
  .epoch(_Number())
;

var _Url = Map( 'protocol', 'hostname', 'auth', 'port'
              , 'pathname', 'query', 'hash'
              )
  .protocol()
  .hostname()
  .auth()
  .port()
  .path()
  .query()
  .hash()
;
