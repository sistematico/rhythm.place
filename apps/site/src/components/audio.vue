<script setup lang="ts">
import { ref, onUnmounted } from "vue";

const URL = `${import.meta.env.VITE_STREAM_URL}/status-json.xsl`;
const song = ref("Rhythm Place");

let timerId = setInterval(async () => {
  const { icestats: { source: { title } } } = await (await fetch(URL)).json();
  song.value = title;
  console.log(song.value);
}, 1000);

onUnmounted(() => {
  clearInterval(timerId);
});
</script>
<template>
	<div>
		<h2>{{ song }}</h2>
		<vue-plyr>
			<audio controls crossorigin="anonymous" playsinline>
				<source src="https://stream.rhythm.place/main"	type="audio/mp3">
			</audio>
		</vue-plyr>
	</div>
</template>
