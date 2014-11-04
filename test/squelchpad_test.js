(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery.squelchpad', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.squelch(), this.elems, 'should be chainable');
  });

  test('is colorful', function() {
    expect(6);
    strictEqual($('#qunit-bt1').squelch({ baseColor: 'red'}).css('backgroundColor'), 'rgb(115, 13, 13)', 'should be red');
    strictEqual($('#qunit-bt2').squelch({ baseColor: 'green'}).css('backgroundColor'), 'rgb(13, 115, 13)', 'should be green');
    strictEqual($('#qunit-bt3').squelch({ baseColor: 'blue'}).css('backgroundColor'), 'rgb(13, 13, 115)', 'should be blue');
    strictEqual($('#qunit-bt1').squelch().css('backgroundColor'), 'rgb(207, 23, 23)', 'should be light red');
    strictEqual($('#qunit-bt2').squelch().css('backgroundColor'), 'rgb(23, 207, 23)', 'should be light green');
    strictEqual($('#qunit-bt3').squelch().css('backgroundColor'), 'rgb(23, 23, 207)', 'should be light blue');
  });

  test('is sizable', function() {
    expect(6);
    $('#qunit-bt1').squelch();
    $('#qunit-bt2').squelch({width: '50px'});
    $('#qunit-bt3').squelch({width: '70px', height: '100px'});

    strictEqual($('#qunit-bt1').width(), 140, 'should be default width');
    strictEqual($('#qunit-bt1').height(), 140, 'should be default height');
    strictEqual($('#qunit-bt2').width(), 50, 'should be configured width');
    strictEqual($('#qunit-bt2').height(), 50, 'should be height matching width');
    strictEqual($('#qunit-bt3').width(), 70, 'should be configured width');
    strictEqual($('#qunit-bt3').height(), 100, 'should be configured height');
  });

  test('is clickable', function() {
    expect(4);
    var bt1 = $('#qunit-bt1');

    bt1.squelch();

    var mdEvent = $.Event('mousedown');
    var muEvent = $.Event('mouseup');
    // note sure why the 'parentOffset' here is set to '-10000'?!
    $.extend(mdEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });
    $.extend(muEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });

    var velocity = -1, squelched = false;

    bt1.on("squelchOn", function(e, args) { squelched = true; velocity = args.velocity; });
    bt1.on("squelchOff", function() { squelched = false; });

    bt1.trigger(mdEvent);

    strictEqual(squelched, true, 'callback happened');

    strictEqual(velocity, 1.0, 'set velocity - full');

    bt1.trigger(muEvent);
    strictEqual(squelched, false, 'was unsquelched');

    mdEvent = $.Event('mousedown');
    $.extend(mdEvent, { target: bt1, pageX: 35 - 10000, pageY: 35 - 10000 });

    bt1.trigger(mdEvent);
    strictEqual(velocity, 0.5, 'set velocity - 0.5');
  });


  /*
  module('jQuery.squelchpad');
  test('is awesome', function() {
    expect(2);
    strictEqual($.awesome(), 'awesome.', 'should be awesome');
    strictEqual($.awesome({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

  module(':awesome selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is awesome', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':awesome').get(), this.elems.last().get(), 'knows awesome when it sees it');
  });
  */

}(jQuery));
