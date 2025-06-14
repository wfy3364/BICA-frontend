import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'
import VChart from 'vue-echarts'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(store)
app.component('v-chart', VChart)
app.mount('#app')
