<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>✈️ Bienvenido de nuevo</h2>
        <!-- Texto corregido para que sirva para cualquier usuario -->
        <p>Inicia sesión para continuar tu aventura</p>
      </div>
      
      <form @submit.prevent="iniciarSesion" class="login-form">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" required placeholder="ejemplo@gmail.com" />
        </div>
        
        <div class="input-group">
          <label>Contraseña</label>
          <!-- Input limpio. El navegador pondrá su ojito nativo automáticamente -->
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>

        <!-- Opciones de Recuérdame y Olvidaste tu contraseña -->
        <div class="login-options">
          <label class="remember-me">
            <input type="checkbox" v-model="recuerdame" />
            <span>Recuérdame</span>
          </label>
          <router-link to="/recuperar" class="forgot-password">¿Olvidaste tu contraseña?</router-link>
        </div>

        <div v-if="errorMsg" class="error-alert">
          ⚠️ {{ errorMsg }}
        </div>

        <button type="submit" class="btn-submit">Iniciar Sesión</button>
      </form>
      
      <router-link to="/registro" class="link-back">¿No tienes cuenta? Regístrate aquí</router-link>
      <router-link to="/" class="link-back" style="margin-top: 10px;">← Volver al catálogo público</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const recuerdame = ref(false)

const iniciarSesion = async () => {
  try {
    errorMsg.value = ''
    await authStore.login(email.value, password.value, recuerdame.value)
    
    // 💡 SOLUCIÓN: Leemos directamente de la memoria cruda para evitar el micro-retraso de Vue
    const usuarioMemoria = JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || '{}')
    
    if (usuarioMemoria.rol === 'admin') {
      // Usamos window.location.href en lugar de router.push para forzar 
      // una recarga limpia del panel de administrador
      window.location.href = '/admin'
    } else {
      router.push('/')
    }
  } catch (error) {
    errorMsg.value = 'Credenciales incorrectas. Intenta nuevamente.'
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
