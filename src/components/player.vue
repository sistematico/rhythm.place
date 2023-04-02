<script setup>
import { ref, onMounted } from "vue";

const streamUrl = "https://rhythm.place:8443/dance";
const player = ref(null);
const volumerange = ref(null);
const playbtn = ref(null);
const pausebtn = ref(null);
const refreshbtn = ref(null);
const songTitle = ref("Rhythm Place");

function toggle() {
  playbtn.value.classList.toggle("hidden");
  pausebtn.value.classList.toggle("hidden");

  if (player.value.paused) {
    player.value.play();
  } else {
    player.value.pause();
  }
}

function refresh() {
  player.value.src = `${streamUrl}?ts=` + ~~(Date.now() / 1000);
  player.value.load();
}

function reload() {
  player.value.currentTime = 0;
  player.value.src = `${streamUrl}?ts=` + ~~(Date.now() / 1000);
  player.value.load();
  player.value.play();
  pausebtn.value.classList.remove("hidden");
  playbtn.value.classList.add("hidden");
}

function updateVolume() {
  volumerange.value.nextElementSibling.value = volumerange.value.value;
  player.value.volume = Number(volumerange.value.value) / 100;
}

onMounted(_ => {
  volumerange.value.onchange = _ => updateVolume();
  player.value.onpause = _ => refresh();
  
  setInterval(_ => {
    fetch("https://rhythm.place:8443/status-json.xsl")
      .then((response) => response.json())
      .then((response) => {
        const { icestats: { source: { title } } } = response;
        songTitle.value = title;
      });
  }, 5000);
});
</script>
<template>
  <div>
    {{ songTitle }}
  </div>

  <div class="holder">
    <div class="audio-player">
      <div>
        <div ref="playbtn" class="play-btn" @click="toggle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24">
            <path d="M8.5 8.64L13.77 12L8.5 15.36V8.64M6.5 5v14l11-7" />
          </svg>
        </div>

        <div ref="pausebtn" class="pause-btn hidden" @click="toggle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24">
            <path d="M14 19h4V5h-4M6 19h4V5H6v14Z" />
          </svg>
        </div>

        <div class="refreshbtn" @click="reload">
          <svg class="animate-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.706 6.706 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95C10.46 2.64 18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0Z" />
          </svg>
        </div>
      </div>

      <div class="ell">
        <input ref="volumerange" class="volume-range" type="range" value="100" min="0" max="100" @change="updateVolume" />
        <output>100</output>%
      </div>

      <div class="volumebtn" @click="open = !open">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="m20.07 19.07l-1.41-1.41A7.955 7.955 0 0 0 21 12c0-2.22-.89-4.22-2.34-5.66l1.41-1.41A9.969 9.969 0 0 1 23 12c0 2.76-1.12 5.26-2.93 7.07m-2.83-2.83l-1.41-1.41A3.99 3.99 0 0 0 17 12c0-1.11-.45-2.11-1.17-2.83l1.41-1.41A5.98 5.98 0 0 1 19 12c0 1.65-.67 3.15-1.76 4.24M4 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m4 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 6a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m0 2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z" />
        </svg>
      </div>

      <audio ref="player" class="player" crossorigin>
        <source src="https://rhythm.place:8443/dance" type="audio/mpeg" />
      </audio>
    </div>
  </div>
</template>
<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito&display=swap");

* { box-sizing: border-box; }

html,
body,
.holder {
  height: 100%;
}

body {
  font-family: "Nunito", sans-serif;
  color: rgba(0, 0, 0, 0.33);
  background: #f8ffae;
  background: -webkit-linear-gradient(-65deg, #43c6ac, #f8ffae);
  background: linear-gradient(-65deg, #43c6ac, #f8ffae);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.holder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.audio-player {
  display: flex;
  // width: 100%;
  // max-width: 600px;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 5px;
  background-color: rgba(30, 30, 32, 0.51);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.72);
  padding: 0 10px;
  border: 3px solid rgba(0, 0, 0, 0.23);
}
.audio-player .hidden {
  display: none;
}
.audio-player div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.audio-player .title,
.audio-player .play-btn,
.audio-player .pause-btn,
.audio-player .refresh-btn,
.audio-player .volume-btn {
  cursor: pointer;
}
.audio-player .ell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.audio-player .volume {
  display: flex;
  align-items: center;
}
.audio-player svg {
  display: block;
  fill: rgba(0, 0, 0, 0.33);
  height: 20px;
}
.audio-player .play-btn svg,
.audio-player .pause-btn svg {
  height: 28px;
}
.audio-player input {
  max-width: 80px;
  min-width: 20px;
}

input[type="range"] {
  color: rgba(0, 0, 0, 0.23);
  font-size: 1.5rem;
  width: 12.5em;
  --track-color: rgba(255, 255, 255, 0.1);
  --thumb-opacity: 0;
  --thumb-height: 1.125em;
  --track-height: 0.125em;
  --track-color: rgba(0, 0, 0, 0.2);
  --brightness-hover: 180%;
  --brightness-down: 80%;
  --clip-edges: 0.125em;
}

/* === range commons === */
input[type="range"] {
  position: relative;
  background: #fff0;
  overflow: hidden;
}

/* === WebKit specific styles === */
input[type="range"],
input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  transition: all ease 100ms;
  height: var(--thumb-height);
}

input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]::-webkit-slider-thumb {
  position: relative;
}

input[type="range"]::-webkit-slider-thumb {
  --clip-top: calc((var(--thumb-height) - var(--track-height)) * 0.5 - 0.5px);
  --clip-bottom: calc(var(--thumb-height) - var(--clip-top));
  --clip-further: calc(100% + 1px);
  --box-fill: calc(-100vmax - var(--thumb-width, var(--thumb-height))) 0 0
    100vmax currentColor;
  width: var(--thumb-width, var(--thumb-height));
  background: linear-gradient(currentColor 0 0) scroll no-repeat left center/50%
    calc(var(--track-height) + 1px);
  background-color: currentColor;
  box-shadow: var(--box-fill);
  border-radius: 0;
  filter: brightness(100%);
  clip-path: polygon(
    100% -1px,
    var(--clip-edges) -1px,
    0 var(--clip-top),
    -100vmax var(--clip-top),
    -100vmax var(--clip-bottom),
    0 var(--clip-bottom),
    var(--clip-edges) 100%,
    var(--clip-further) var(--clip-further)
  );
}

input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(var(--track-color) 0 0) scroll no-repeat center
    100% calc(var(--track-height) + 1px);
}

input[type="range"]:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

/* === Firefox specific styles === */
input[type="range"],
input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-thumb {
  appearance: none;
  transition: all ease 100ms;
  height: var(--thumb-height);
}

input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-thumb,
input[type="range"]::-moz-range-progress {
  background: #fff0;
}

input[type="range"]::-moz-range-thumb {
  opacity: 0;
  background: currentColor;
  border: 0;
  width: var(--thumb-width, var(--thumb-height));
  border-radius: var(--thumb-width, var(--thumb-height));
  cursor: ponter;
}

input[type="range"]:active::-moz-range-thumb {
  cursor: pointer;
}

input[type="range"]::-moz-range-track {
  width: 100%;
  background: var(--track-color);
}

input[type="range"]::-moz-range-progress {
  appearance: none;
  background: currentColor;
  transition-delay: 30ms;
}

input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-progress {
  height: calc(var(--track-height) + 1px);
  border-radius: var(--track-height);
}

input[type="range"]::-moz-range-thumb,
input[type="range"]::-moz-range-progress {
  filter: brightness(100%);
}
</style>
