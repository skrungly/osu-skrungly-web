import './assets/base.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUsers, faMusic, faRightToBracket, faChartSimple } from '@fortawesome/free-solid-svg-icons'

library.add(faUsers, faMusic, faRightToBracket, faChartSimple)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
