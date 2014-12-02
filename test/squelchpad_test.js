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
  /* global console */

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
    strictEqual($('#qunit-bt1').squelch({ baseColor: 'red'}).css('backgroundColor'), 'rgb(76, 8, 8)', 'should be red');
    strictEqual($('#qunit-bt2').squelch({ baseColor: 'green'}).css('backgroundColor'), 'rgb(8, 76, 8)', 'should be green');
    strictEqual($('#qunit-bt3').squelch({ baseColor: 'blue'}).css('backgroundColor'), 'rgb(8, 8, 76)', 'should be blue');
    strictEqual($('#qunit-bt1').squelch().css('backgroundColor'), 'rgb(230, 25, 25)', 'should be light red');
    strictEqual($('#qunit-bt2').squelch().css('backgroundColor'), 'rgb(25, 230, 25)', 'should be light green');
    strictEqual($('#qunit-bt3').squelch().css('backgroundColor'), 'rgb(25, 25, 230)', 'should be light blue');
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

  test('is togglable', function() {
    expect(4);
    var bt1 = $('#qunit-bt1');

    bt1.squelch({ baseColor: 'red', toggle: true});

    var mdEvent = $.Event('mousedown');
    var muEvent = $.Event('mouseup');
    // note sure why the 'parentOffset' here is set to '-10000'?!
    $.extend(mdEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });
    $.extend(muEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });

    var squelched = false, level = -1, levelCalled = false;

    bt1.on("squelchOn squelchLevel", function(e, args) { squelched = true; level = args.level; });
    bt1.on("squelchOff", function() { console.log("Called squelchOff"); squelched = false; levelCalled = true; });

    bt1.trigger(mdEvent);
    strictEqual(squelched, true, 'callback happened');

    stop();
    setTimeout(function() {
      strictEqual($('#qunit-bt1').css('backgroundColor'), 'rgb(207, 23, 23)', 'should be light red');

      bt1.trigger(muEvent);
      strictEqual(squelched, true, 'still squelched');

      bt1.trigger(mdEvent);
      strictEqual(squelched, false, 'toggled');

      setTimeout(function() {
        strictEqual($('#qunit-bt1').css('backgroundColor'), 'rgb(76, 8, 8)', 'should be red');

        bt1.trigger(muEvent);
        strictEqual(squelched, false, 'still toggled');
        start();
      }, 300);
    }, 300);

  });

  test('is multitoggleable', function() {
    expect(4);
    var bt1 = $('#qunit-bt1');

    bt1.squelch({ toggle: 2});

    var mdEvent = $.Event('mousedown');
    var muEvent = $.Event('mouseup');
    // note sure why the 'parentOffset' here is set to '-10000'?!
    $.extend(mdEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });
    $.extend(muEvent, { target: bt1, pageX: 70 - 10000, pageY: 70 - 10000 });

    var squelched = false, level = -1, levelCalled = false;

    bt1.on("squelchOn", function(e, args) { squelched = true; level = args.level; });
    bt1.on("squelchOff", function() { squelched = false; levelCalled = true; });

    bt1.trigger(mdEvent);
    strictEqual(level, 1, 'set level 1');
    strictEqual(squelched, true, 'callback happened');
    strictEqual($('#qunit-bt1').css('backgroundColor'), 'rgb(230, 25, 25)', 'should be light red');

    bt1.trigger(muEvent);
    strictEqual(squelched, true, 'still squelched');

    bt1.trigger(mdEvent);
    strictEqual(squelched, true, 'callback happened');
    strictEqual(level, 2, 'set level 2');
    strictEqual($('#qunit-bt1').css('backgroundColor'), 'rgb(230, 25, 25)', 'should be light red');

    bt1.trigger(muEvent);
    strictEqual(squelched, true, 'still squelched');

    bt1.trigger(mdEvent);
    strictEqual(squelched, false, 'toggled');
    strictEqual($('#qunit-bt1').css('backgroundColor'), 'rgb(76, 8, 8)', 'should be red');

    bt1.trigger(muEvent);
    strictEqual(squelched, false, 'still toggled');

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
