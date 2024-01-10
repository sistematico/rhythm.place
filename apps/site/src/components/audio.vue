<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import VuePlyr from '@skjnldsv/vue-plyr'

const STREAM_URL = `${import.meta.env.VITE_STREAM_URL}`;
const JSON_URL = `${STREAM_URL}/status-json.xsl`;
let ts = Date.now() / 1000 | 0
const source = ref(`${STREAM_URL}/main?ts=${ts}`)
const song = ref("Rhythm Place");
const plyr = ref(null);

let timerId = setInterval(async () => {
  const { icestats: { source: { title } } } = await (await fetch(JSON_URL)).json();
  song.value = title;

  if (!plyr.value.player.playing) { 
    ts = Date.now() / 1000 | 0
    plyr.value.player.currentTime = 0;
    source.value = `${STREAM_URL}/main?ts=${ts}`
  }
}, 1000);

onUnmounted(() => {
  clearInterval(timerId);
});

const controls = `
<div class="plyr__controls">
  <button id="restart" type="button" class="plyr__control" data-plyr="restart">
    <svg role="presentation"><use xlink:href="#plyr-restart"></use></svg>
    <span class="plyr__tooltip" role="tooltip">Restart</span>
  </button>
  <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
  </button>
  <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span>
  </button>
  <div class="plyr__volume">
    <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
  </div>
  <button type="button" class="plyr__control" data-plyr="captions">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-captions-on"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-captions-off"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Disable captions</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enable captions</span>
  </button>
  <button type="button" class="plyr__control" data-plyr="fullscreen">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span>
  </button>
</div>
`;

const plyrOptions = {
  title: 'Rhythm Place',
  controls
};

onMounted(() => {	
	const restart = document.getElementById("restart")
	restart?.addEventListener("click", function() {
    ts = Date.now() / 1000 | 0
    source.value = `${STREAM_URL}/main?ts=${ts}`
    plyr.value.player.currentTime = 0;
    plyr.value.player.play();
  })
})
</script>
<template>
	<div>
		<h2>{{ song }}</h2>
		<vue-plyr ref="plyr" :options="plyrOptions">
			<audio controls crossorigin="anonymous" playsinline>
				<source :src="source"	type="audio/mp3">
			</audio>
		</vue-plyr>
	</div>
</template>