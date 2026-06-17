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
        <div class="input-group">
          <label>Confirmar Nueva Contraseña</label>
          <input type="password" v-model="confirmarNuevaPassword" required placeholder="••••••••" />
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
const confirmarNuevaPassword = ref('')
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
  // 💡 VALIDACIÓN ANTES DE ENVIAR
  if (nuevaPassword.value !== confirmarNuevaPassword.value) {
    mensaje.value = 'Las contraseñas no coinciden.';
    return;
  }
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
/* 💡 FONDO DINÁMICO. Usamos un degradado que lee las variables */
.login-wrapper { 
  display: flex; justify-content: center; align-items: center; min-height: 100vh; 
  background: linear-gradient(135deg, var(--bg-layout) 0%, var(--bg-header) 100%); 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
}

/* 💡 TARJETAS DINÁMICAS */
.login-card { 
  background: var(--bg-card); 
  padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
  width: 100%; max-width: 420px; 
  border: 1px solid var(--color-border); /* Borde para el modo oscuro */
}

.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h2 { color: var(--text-main); margin: 0 0 5px 0; font-size: 1.5rem; }
.login-header p { color: var(--text-muted); margin: 0; font-size: 0.9rem; }

.input-group { margin-bottom: 1.5rem; text-align: left; }
.input-group label { display: block; color: var(--text-main); margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; }
.input-group input { 
  width: 100%; padding: 12px 15px; border: 1px solid var(--color-border); border-radius: 8px; 
  background-color: var(--bg-layout); font-size: 1rem; color: var(--text-main); 
  box-sizing: border-box; transition: all 0.3s ease; 
}
.input-group input:focus { 
  outline: none; border-color: var(--color-primary); 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); background-color: var(--bg-card); 
}

.login-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-size: 0.85rem; }
.remember-me { display: flex; align-items: center; gap: 5px; color: var(--text-muted); cursor: pointer; }
.forgot-password { color: var(--color-primary); text-decoration: none; font-weight: 600; }
.forgot-password:hover { text-decoration: underline; }

.error-alert { background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger); padding: 10px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: bold; border: 1px solid var(--color-danger); }

/* Alertas de Registro y Recuperación */
.alert { padding: 10px; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; font-size: 0.85rem; }
.alert-success { background-color: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid var(--color-success); }
.alert-info { background-color: rgba(59, 130, 246, 0.1); color: var(--color-primary); border: 1px solid var(--color-primary); }
.alert-danger { background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid var(--color-danger); }

.btn-submit { width: 100%; padding: 12px; background-color: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: opacity 0.3s ease, transform 0.1s ease; }
.btn-submit:hover { opacity: 0.9; }
.btn-submit:active { transform: scale(0.98); }

.link-back { display: block; text-align: center; margin-top: 1rem; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.3s ease; }
.link-back:hover { color: var(--text-main); text-decoration: underline; }
</style>