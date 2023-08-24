// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import { createApp } from 'vue'
import App from './App.vue'

import "./sass/screen.scss"

const app = createApp(App);
app.mount('#app');

