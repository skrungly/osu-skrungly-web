import './assets/base.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUsers, faMusic, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUsers, faMusic, faRightToBracket)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component("font-awesome-icon", FontAwesomeIcon)
app.use(router)

app.mount('#app')
