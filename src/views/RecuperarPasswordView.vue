<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>🔐 Recuperar Contraseña</h2>
        <p v-if="fase === 1">Ingresa tu correo para recibir un PIN</p>
        <p v-if="fase === 2">Ingresa el PIN simulado y tu nueva clave</p>
      </div>

      <!-- FASE 1: PEDIR EMAIL -->
      <form v-if="fase === 1" @submit.prevent="pedirCodigo" class="login-form">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" required placeholder="tu@email.com" />
        </div>
        <div v-if="mensaje" class="alert alert-info">{{ mensaje }}</div>
        <button type="submit" class="btn-submit">Enviar Código</button>
      </form>

      <!-- FASE 2: INGRESAR PIN Y NUEVA PASS -->
      <form v-if="fase === 2" @submit.prevent="cambiarPassword" class="login-form">
        <div class="input-group">
          <label>Código PIN</label>
          <input type="text" v-model="codigo" required placeholder="Ej: 123456" />
        </div>
        <div class="input-group">
          <label>Nueva Contraseña</label>
          <input type="password" v-model="nuevaPassword" required placeholder="••••••••" />
        </div>
        <div v-if="mensaje" class="alert alert-danger">{{ mensaje }}</div>
        <button type="submit" class="btn-submit" style="background-color: #10b981;">Actualizar Contraseña</button>
      </form>

      <router-link to="/login" class="link-back">← Volver al inicio de sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiViajes from '../api/axios'

const router = useRouter()
const fase = ref(1)
const email = ref('')
const codigo = ref('')
const nuevaPassword = ref('')
const mensaje = ref('')

const pedirCodigo = async () => {
  try {
    // Hace la petición. El backend tomará unos 2-3 segundos en enviar el email de Google.
    await apiViajes.post('/usuarios/recuperar-password', { email: email.value })
    
    // Ya no hay Alert del simulador. Pasamos a la fase 2 automáticamente.
    fase.value = 2; 
    mensaje.value = "¡Código enviado! Revisa tu bandeja de entrada (y la carpeta de SPAM).";
    
  } catch (error) {
    mensaje.value = "Hubo un error al enviar el correo. Intenta de nuevo.";
  }
}

const cambiarPassword = async () => {
  try {
    await apiViajes.post('/usuarios/resetear-password', {
      email: email.value,
      codigo: codigo.value,
      nuevaPassword: nuevaPassword.value
    })
    
    alert('✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
    router.push('/login')
  } catch (error) {
    mensaje.value = error.response?.data?.message || "Código incorrecto."
  }
}
</script>

<style scoped>
/* Usamos tus estilos base para que combine con el Login */
.login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.login-card { background: #ffffff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); width: 100%; max-width: 420px; }
.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h2 { color: #2c3e50; margin: 0 0 5px 0; font-size: 1.5rem; }
.login-header p { color: #7f8c8d; margin: 0; font-size: 0.9rem; }
.input-group { margin-bottom: 1.5rem; text-align: left; }
.input-group label { display: block; color: #34495e; margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; }
.input-group input { width: 100%; padding: 12px 15px; border: 1px solid #dfe6e9; border-radius: 8px; background-color: #fcfcfc; font-size: 1rem; }
.alert { padding: 10px; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; font-size: 0.85rem; }
.alert-info { background-color: #e0f2fe; color: #0369a1; }
.alert-danger { background-color: #f8d7da; color: #721c24; }
.btn-submit { width: 100%; padding: 12px; background-color: #0984e3; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: background-color 0.3s ease; }
.btn-submit:hover { background-color: #74b9ff; }
.link-back { display: block; text-align: center; margin-top: 1.5rem; color: #636e72; text-decoration: none; font-size: 0.9rem; }
.link-back:hover { text-decoration: underline; }
</style>