import { createApp } from 'vue'
import './assets/scss/main.scss'
import app from './app.vue'
import VuePlyr from '@skjnldsv/vue-plyr'
// import '@skjnldsv/vue-plyr/dist/vue-plyr.css'
import './assets/css/plyr.css'

// const controls = ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
const controls = ['play-large', 'play', 'mute', 'volume']

const plyrOptions = {
  title: 'Rhythm Place',
  controls
};

createApp(app)
  .use(VuePlyr, { plyr: plyrOptions })
  .mount('#app')