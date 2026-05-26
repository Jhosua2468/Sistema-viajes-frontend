<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>✈️ Únete a la aventura</h2>
        <p>Crea tu cuenta para planificar tus viajes</p>
      </div>
      
      <form @submit.prevent="crearCuenta" class="login-form">
        <div class="input-group">
          <label>Nombre Completo</label>
          <input type="text" v-model="nombre" required placeholder="Ej. Ana Pérez" />
        </div>

        <div class="input-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" required placeholder="ejemplo@gmail.com" />
        </div>
        
        <div class="input-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>

        <div v-if="mensaje" :class="['alert', error ? 'alert-danger' : 'alert-success']">
          {{ mensaje }}
        </div>

        <button type="submit" class="btn-submit">Registrarme</button>
      </form>
      
      <router-link to="/login" class="link-back">¿Ya tienes cuenta? Inicia sesión aquí</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth' // Asegúrate de tener esta ruta correcta
import apiViajes from '../api/axios'

const router = useRouter()
const authStore = useAuthStore()

const nombre = ref('')
const email = ref('')
const password = ref('')
const error = ref(false)
const mensaje = ref('')

const crearCuenta = async () => {
  error.value = false
  mensaje.value = ''

  // 1. Validaciones
  if (nombre.value.length < 4) {
    error.value = true; mensaje.value = 'El nombre debe tener al menos 4 caracteres.'; return;
  }
  if (!email.value.includes('@') || !email.value.includes('.')) {
    error.value = true; mensaje.value = 'Por favor, ingresa un correo electrónico válido.'; return;
  }
  if (password.value.length < 6) {
    error.value = true; mensaje.value = 'La contraseña debe tener al menos 6 caracteres.'; return;
  }

  try {
    // PASO A: Creamos la cuenta en el backend
    await apiViajes.post('/usuarios/registro', {
      nombre: nombre.value,
      email: email.value,
      password: password.value
    })
    
    // PASO B: AUTO-LOGIN usando tu authStore (le pasamos el email, password y 'false' para no recordarlo por siempre)
    await authStore.login(email.value, password.value, false)

    // PASO C: Redirigimos al catálogo
    router.push('/')

  } catch (err) {
    error.value = true
    const mensajeReal = err.response?.data?.message || err.message || "Error desconocido";
    mensaje.value = `Error: ${mensajeReal}`;
  }
}
</script>

<style scoped>
/* ESTILOS EXACTOS DE TU LOGIN */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.5rem;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

.input-group {
  margin-bottom: 1.5rem; /* Ajustado un poco para que respiren los inputs */
  text-align: left;
}

.input-group label {
  display: block;
  color: #34495e;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  background-color: #fcfcfc;
  font-size: 1rem;
  color: #2d3436;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #74b9ff;
  box-shadow: 0 0 0 3px rgba(116, 185, 255, 0.2);
  background-color: #ffffff;
}

.alert {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.alert-success { background-color: #d4edda; color: #155724; }
.alert-danger { background-color: #f8d7da; color: #721c24; }

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: #0984e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.btn-submit:hover { background-color: #74b9ff; }
.btn-submit:active { transform: scale(0.98); }

.link-back {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: #636e72;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link-back:hover { color: #2d3436; text-decoration: underline; }

/* --- ESTILOS DEL BOTÓN DE CONTRASEÑA --- */
/* .password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
 // Mantiene tu diseño, pero hace espacio a la derecha para que el texto no pise el ojito 
  padding-right: 45px; 
}
 */

/* .btn-eye {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.btn-eye:hover {
  transform: scale(1.1);
} */

</style>
