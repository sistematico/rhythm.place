<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { store } from '../store.ts'
import VuePlyr from '@skjnldsv/vue-plyr'
import { controls } from '../data/controls.ts'

const STREAM_URL = `${import.meta.env.VITE_STREAM_URL}`
const JSON_URL = `${STREAM_URL}/status-json.xsl`
let timerId: ReturnType<typeof setInterval> | null = null
const streamSource = store.genre === 'main' ? ref(`${STREAM_URL}/main?ts=${+new Date()}`) : ref(`${STREAM_URL}/${store.genre.toLowerCase()}?ts=${+new Date()}`)
const listeners = ref('0')
const listenersPeak = ref('0')
const plyr = ref(null)
const plyrOptions = { title: "Rhythm Place", controls }

const changeGenre = (genre: string) => {
  document.querySelector("source").src = `${STREAM_URL}/${genre.toLowerCase()}?ts=${+new Date()}`
  document.querySelector("audio").load()
  plyr.value.player.play()
}

watch(
  () => store.genre,
  () => {
    changeGenre(store.genre)
  }
)

timerId = setInterval(async () => {
  // const offline = await checkOffline()
  const { icestats: { source } } = await (await fetch(JSON_URL)).json()

  const streamGenre = store.genre === 'main' ? 'Varios' : store.genre.charAt(0).toUpperCase() + store.genre.slice(1)
  const currentSource = await source.find((element: { genre: string }) => element.genre === streamGenre)
  const title = currentSource.title.trim() !== 'undefined' ? currentSource.title : 'Rhythm Place'
  document.querySelector(".plyr__title").innerHTML = title

  if (currentSource) {    
    listeners.value = currentSource.listeners
    listenersPeak.value = currentSource.listener_peak
  }

  if (!plyr.value.player.playing) {
    document.querySelector("source").src = `${STREAM_URL}/${store.genre.toLowerCase()}?ts=${+new Date()}`
    document.querySelector("audio").load()
  } 
  
  // if (offline || !navigator.onLine) {
  //   console.info("Fonte ou navegador off-line, tentando reconectar...")
  //   document.querySelector("source").src = `${STREAM_URL}/${store.genre.toLowerCase()}?ts=${+new Date()}`
  //   document.querySelector("audio").load()
  //   if (plyr.value.player.playing) document.querySelector("audio").play()
  // }
}, 500)

onMounted(() => {
  document.getElementById("restart").addEventListener("click", () => {
    document.querySelector("source").src = `${STREAM_URL}/${store.genre.toLowerCase()}?ts=${+new Date()}`
    document.querySelector("audio").load()
    plyr.value.player.play()
  })
})

onUnmounted(() => {
  clearInterval(timerId)
})
</script>
<template>
  <div class="player-container">
    <vue-plyr ref="plyr" :options="plyrOptions">
      <audio controls crossorigin="anonymous" playsinline>
        <!-- <source :src="streamSource" type="audio/mp3" /> -->
        <source :src="streamSource" type="audio/ogg" />
         <!-- <source src="/path/to/audio.ogg" type="audio/ogg" /> -->
      </audio>
    </vue-plyr>
    <div class="stats">Ouvintes: {{ listeners }} Pico: {{ listenersPeak }}</div>
  </div>
</template>
