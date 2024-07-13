<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { store } from '../store.ts'
import VuePlyr from "@skjnldsv/vue-plyr";
import { controls } from '../data/controls.ts'

const STREAM_URL = `${import.meta.env.VITE_STREAM_URL}`;
const JSON_URL = `${STREAM_URL}/status-json.xsl`;
let ts = (Date.now() / 1000) | 0;
let timerId: ReturnType<typeof setInterval> | null = null
const streamSource = store.genre === 'Principal' ? ref(`${STREAM_URL}/main?ts=${ts}`) : ref(`${STREAM_URL}/${store.genre.toLowerCase()}?ts=${ts}`);
const listeners = ref("0");
const listenersPeak = ref("0");
const plyr = ref(null);



const plyrOptions = { title: "Rhythm Place", controls };

const checkOffline = async () => {
  const check = await fetch(STREAM_URL)
  if (check.ok) return false
  return true
}

const changeGenre = (genre: string) => {
  const ts = (Date.now() / 1000) | 0;
  const streamGenre = genre === 'Principal' ? 'main' : genre.toLowerCase();
  streamSource.value = `${STREAM_URL}/${streamGenre}?ts=${ts}`;
  document.querySelector("audio").load();
  plyr.value.player.play();
}

watch(
  () => store.genre,
  () => {
    changeGenre(store.genre);
  }
);

timerId = setInterval(async () => {
  const offline = await checkOffline()
  const { icestats: { source } } = await (await fetch(JSON_URL)).json();

  const streamGenre = store.genre === 'Principal' ? 'Various' : store.genre;  
  const currentSource = await source.find((element: { genre: string }) => element.genre === streamGenre);

  if (currentSource) {
    const title = currentSource.title !== 'undefined' ? currentSource.title : 'Rhythm Place';
    listeners.value = currentSource.listeners;
    listenersPeak.value = currentSource.listener_peak;
    document.querySelector(".plyr__title").innerHTML = title;
  }

  if (!plyr.value.player.playing) {
    ts = (Date.now() / 1000) | 0;
    document.querySelector("audio").load();
    const streamGenre = store.genre === 'Principal' ? 'main' : store.genre.toLowerCase();
    streamSource.value = `${STREAM_URL}/${streamGenre}?ts=${ts}`;
  } 
  
  if (offline || !navigator.onLine) {
    console.info("Fonte ou navegador off-line, tentando reconectar...")
    ts = (Date.now() / 1000) | 0;
    document.querySelector("audio").load();
    const streamGenre = store.genre === 'Principal' ? 'main' : store.genre.toLowerCase();
    streamSource.value = `${STREAM_URL}/${streamGenre}?ts=${ts}`;
    if (plyr.value.player.playing) document.querySelector("audio").play();
  }
}, 1500);

onMounted(() => {
  const restart = document.getElementById("restart");
  restart?.addEventListener("click", () => {
    ts = (Date.now() / 1000) | 0;
    const streamGenre = store.genre === 'Principal' ? 'main' : store.genre.toLowerCase();
    streamSource.value = `${STREAM_URL}/${streamGenre}?ts=${ts}`;
    document.querySelector("audio").load();
    plyr.value.player.play();
  });
});

onUnmounted(() => {
  clearInterval(timerId);
});
</script>
<template>
  <div class="player-container">
    <vue-plyr ref="plyr" :options="plyrOptions">
      <audio controls crossorigin="anonymous" playsinline>
        <source :src="streamSource" type="audio/mp3" />
      </audio>
    </vue-plyr>
    <div class="stats">Ouvintes: {{ listeners }} Pico: {{ listenersPeak }}</div>
  </div>
</template>
