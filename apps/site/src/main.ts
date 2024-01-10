import { createApp } from 'vue'
import './assets/scss/main.scss'
import app from './app.vue'
import VuePlyr from '@skjnldsv/vue-plyr'
import './assets/css/plyr.css'

createApp(app)
  .use(VuePlyr)
  .mount('#app')