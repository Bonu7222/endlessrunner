## neon endless runner

built this bcs i wanted to make a classic endless runner but give it that 'juice'. hte stuff that makes indie games feel so addictive. you run automatically, u jump, u try not to hit the oink wallas. it fast, its neon and it gets pretty intense.

## features

--smooth canvas movement: everything is rendered on an HTML5 canvas. the player has a glowing trail, and the game speeds up the longs you survive.
--parallax background: two layers of neon mountains move at different speeds to create a fake 3D depth. i makes the game feel way faster than it actually is.
--double jump: u can jump in mid-air once. t gives u a bit of a saftey net, but u still have to time it right.
--screen shake and particles: when u die, the screen violently shakes and ur character explodes into cyan particles. every jump leaves little burst of dust behind.
--synth audio: used the web api again. jumping makes a quick rising chime and hitting a wall makes a nasty falling buzz. no audio files, just math.
--dynamic difficulty: as ur score goes up, the speed increases, and the gaps between obstacles get tighter.


## how to run

open index.html in ur browser. click 'start' and use spacebar, click or tap to jump.

# what i learned:

--background scrolling: making the moauntains loop seamlessly was a headache. i had to use modulo with offset variables. i also accidentally made one layer move at the wrong speed and it looked super weird.
--the obx bug: i spent way too long debugging why obstacles were crashing the game turns out i typed obx.width instead of obs.width. one wrong letter and whole loop dies.
--template literal commas: missing a single comma inside an rgba() template string (`rgba(0,255,255 ${alpha})` instead of `rgba(0,255,255 ${alpha})` makes the color completely invisible. the browser console didnt help much with that one.
--audio context rules: browsers literally refuse to play sound untill the user clicks smth. hooking the audioContext initialization to the start button fixed it.

overall its supper snappy and really fun to play for a few minutes.