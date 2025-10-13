import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import Ripple from 'primevue/ripple'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue)
app.directive('ripple', Ripple)
app.component('PCard', Card)
app.component('PCheckbox', Checkbox)
app.component('PButton', Button)
app.component('PBadge', Badge)
app.component('PProgressBar', ProgressBar)

app.mount('#app')
