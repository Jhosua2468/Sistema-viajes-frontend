import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router' // <-- Conectamos el mapa de rutas
import './style.css'
import App from './App.vue'

// 1. Preparamos la aplicación
const app = createApp(App)

// 2. Le inyectamos la memoria (Pinia) y la navegación (Router)
app.use(createPinia())
app.use(router)

// 3. Encendemos la app
app.mount('#app')
