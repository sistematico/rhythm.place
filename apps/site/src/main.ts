import '@/styles/scss/main.scss'
import '@/styles/css/plyr.css'
import { createApp } from 'vue'
import app from './app.vue'
import VuePlyr from '@skjnldsv/vue-plyr'
import { controls } from '@/data/controls'

const options = {
  title: 'Rhythm Place',
  controls
}

createApp(app)
  .use(VuePlyr, { plyr: options })
  .mount('#app')