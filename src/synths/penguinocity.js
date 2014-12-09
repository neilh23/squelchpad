/* -- global console */
function Penguinosity(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  /* TODO: design:
   * 6 source oscillators:
   * 1. sin. base frequency - 2 octaves, amp modulated LFO 1 (not freq modulated)
   * 2. sin. base frequency - 1 octave, freq modulated by LFO 2 (detune). amp modulated by LFO 3
   * 3. sin. base frequency, freq modulated by LFO 2 (detune)
   * 4. square. base frequency, freq modulated by LFO 4 (detune)
   * 5. square. base frequency - 2hz, freq modulated by LFO 4 (detune), + phase modulated by LFO 5 (*)
   * 6. triangle - base frequency + 1 octave, freq modulated by OSCFM1 - set at 2 thirds base frequency
   *
   * 4, 5, 6 piped through low-pass filter controlled by LFO 6
   * 1, 2, 3 piped through compression
   * 3, 4, 5, 6 piped through slight reverb
   * everything piped through waveshaper set to gentle valve distortion (TODO - need to learn how to do this!)
   *   - waveshaper function for testing (gnuplot syntax)
   *   (sgn(x) * abs(x)**(1./3.)) + (1-abs(x))*sin(x*8*pi)/12
   *
   * ADSR - attack affects gain on LFO for low-pass filter + master gain, release only master gain
   *
   * ... 
   *
   * simples ;-)
   *
   * (*) Web audio api doesn't do phase modulation! Can't even simply set the phase on an oscillator, which seems
   *     a huuuuuge oversight in the spec. Can simulate this with a delay on osc5
   */

  this.attack = 0.18||args.attack;
  this.release = 1.8||args.release;
}

Penguinosity.prototype = Object.create(null, {
  // FIXME: create function for note 2 cps, e.g. 'C4', 'D#6', 'Gb3'
  playNote: { value: function(/*args */) {
    "use strict";
    // todo
  }},
  stopNote: { value: function() {
    // todo
  }}
});
