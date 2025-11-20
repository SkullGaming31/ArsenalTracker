import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// global theme variables
import './styles/theme.css'

// Quasar
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, {})

app.mount('#app')
