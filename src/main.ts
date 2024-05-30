import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { VueFire } from 'vuefire'
import { firebaseApp } from './firebase'
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faCalendar, faCheck, faChevronLeft,faChevronRight, faCircle, faList, faPlus, faStar } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faChevronLeft,faChevronRight,faCheck,faPlus,faList,faCalendar,faCircle,faStar)
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(VueFire,{
    firebaseApp,
})


app.mount('#app')