<script setup>
import { ref, onMounted } from "vue";

const streamUrl = "https://rhythm.place:8443/dance";
const player = ref(null);
const volumerange = ref(null);
const playbtn = ref(null);
const pausebtn = ref(null);
const songTitle = ref("Rhythm Place");
const listen = ref("0");
const defaultPic = new URL('../assets/img/favicon.svg', import.meta.url).href;
const picture = ref(null);

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
  volumerange.value.nextElementSibling.value = volumerange.value.value + '%';
  player.value.volume = Number(volumerange.value.value) / 100;
}

onMounted(_ => {
  picture.value.src = defaultPic

  refresh();

  volumerange.value.onchange = _ => updateVolume();
  player.value.onpause = _ => refresh();
  
  setInterval(_ => {
    fetch("https://rhythm.place:8443/status-json.xsl")
      .then((response) => response.json())
      .then((response) => {
        const { icestats: { source: { title } } } = response;
        const { icestats: { source: { listeners } } } = response;
        songTitle.value = title;
        listen.value = listeners;
      });
  }, 5000);
});
</script>
<template>
  <div class="title">
    <h3>
      {{ songTitle }}
    </h3>
  </div>

  <div class="audio-player">
    <img ref="picture" class="picture" src="" alt="" />

    <div ref="playbtn" class="playbtn" @click="toggle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24">
        <path d="M8.5 8.64L13.77 12L8.5 15.36V8.64M6.5 5v14l11-7" />
      </svg>
    </div>

    <div ref="pausebtn" class="pausebtn hidden" @click="toggle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24">
        <path d="M14 19h4V5h-4M6 19h4V5H6v14Z" />
      </svg>
    </div>

    <div class="refreshbtn" @click="reload">
      <svg class="animate-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.706 6.706 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95C10.46 2.64 18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0Z" />
      </svg>
    </div>

    <div class="volume">
      <input ref="volumerange" class="volumerange" type="range" value="100" min="0" max="100" @change="updateVolume" />
      <output>100%</output>
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

  <div class="listeners">
    Ouvintes: {{ listen }}
  </div>
</template>
<style lang="scss">
@import "@/assets/scss/player.scss";

.picture {
  max-height: 45px;
  width: auto;
}

.listeners {
  font-size: .8rem;
}

.title {
  max-width: 90vw;
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis; 
  text-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.72);
}

.title h3 {
  font-size: 1rem;
  color: #fff;
  // animation: glow .8s ease-in-out infinite alternate;
}

@-webkit-keyframes glow {
  from {
    text-shadow: 0 0 2px #fff, 0 0 2px #fff, 0 0 7px #07ee54, 0 0 9px #07ee54, 0 0 13px #07ee54, 0 0 18px #07ee54, 0 0 20px #07ee54;
  }
  
  to {
    text-shadow: 0 0 2px #fff, 0 0 7px #ff4da6, 0 0 9px #ff4da6, 0 0 13px #ff4da6, 0 0 18px #ff4da6, 0 0 20px #ff4da6, 0 0 22px #ff4da6;
  }
}

@keyframes glow {
  from {
    text-shadow: 0 0 2px #fff, 0 0 2px #fff, 0 0 7px #07ee54, 0 0 9px #07ee54, 0 0 13px #07ee54, 0 0 18px #07ee54, 0 0 20px #07ee54;
  }
  
  to {
    text-shadow: 0 0 2px #fff, 0 0 7px #ff4da6, 0 0 9px #ff4da6, 0 0 13px #ff4da6, 0 0 18px #ff4da6, 0 0 20px #ff4da6, 0 0 22px #ff4da6;
  }
}
</style>
