<template>
  <nav class="navbar">
    <div class="logo">✈️ Planifica Viajes</div>
    
    <div class="nav-center">
      <router-link to="/" class="nav-item">Explorar Destinos</router-link>
      <router-link to="/comunidad" class="nav-item">Planes de Viajeros</router-link>
    </div>
    
    <div class="nav-right">
      <div v-if="!authStore.estaAutenticado" class="nav-buttons">
        <router-link to="/login" class="btn-link">Iniciar Sesión</router-link>
        <router-link to="/registro" class="btn-primary">Crear Cuenta</router-link>
      </div>

      <div v-else class="user-menu-container">
        <div class="user-trigger" @click="toggleMenu">
          <span class="user-greeting">Hola, <strong>{{ authStore.usuario?.nombre }}</strong></span>
          <span class="chevron" :class="{ 'rotate': menuAbierto }">▼</span>
        </div>

        <transition name="fade">
          <div v-if="menuAbierto" class="dropdown-menu" @click="menuAbierto = false">
            <router-link v-if="authStore.usuario?.rol === 'admin'" to="/admin" class="dropdown-item admin-link">
              ⚙️ Panel de Control
            </router-link>
            <router-link to="/mis-planes" class="dropdown-item">🗺️ Mis Planes</router-link>
            <router-link to="/perfil" class="dropdown-item">👤 Mi Perfil</router-link>
            <div class="dropdown-divider"></div>
            <button @click="cerrarSesion" class="dropdown-item logout-item">🚪 Cerrar Sesión</button>
          </div>
        </transition>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const menuAbierto = ref(false)

const toggleMenu = () => menuAbierto.value = !menuAbierto.value

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Pegamos aquí solo los estilos del Navbar que teníamos en el Home */
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 5%; background-color: #ffffff; box-shadow: 0 2px 15px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 50; }
.logo { font-size: 1.5rem; font-weight: 900; color: #1e293b; letter-spacing: -0.5px; }
.nav-center { display: flex; gap: 30px; }
.nav-item { text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; position: relative; }
.nav-item:hover, .router-link-exact-active { color: #3b82f6; }
.nav-buttons { display: flex; gap: 15px; align-items: center; }
.btn-link { text-decoration: none; color: #475569; font-weight: 600; }
.btn-link:hover { color: #3b82f6; }
.btn-primary { background-color: #3b82f6; color: white; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: all 0.3s; }
.btn-primary:hover { background-color: #2563eb; }
.user-menu-container { position: relative; }
.user-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: background 0.2s; user-select: none; border: 1px solid transparent; }
.user-trigger:hover { background: #f1f5f9; border-color: #e2e8f0; }
.user-greeting { color: #334155; font-size: 0.95rem; }
.chevron { font-size: 0.7rem; color: #94a3b8; transition: transform 0.3s ease; }
.chevron.rotate { transform: rotate(180deg); }
.dropdown-menu { position: absolute; top: 110%; right: 0; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; min-width: 220px; display: flex; flex-direction: column; padding: 8px 0; z-index: 100; overflow: hidden; }
.dropdown-item { padding: 12px 20px; text-decoration: none; color: #475569; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; display: flex; align-items: center; gap: 10px; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown-item:hover { background: #f8fafc; color: #3b82f6; padding-left: 25px; }
.admin-link { color: #8b5cf6; }
.admin-link:hover { color: #7c3aed; background: #f5f3ff; }
.dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }
.logout-item { color: #ef4444; }
.logout-item:hover { background: #fef2f2; color: #dc2626; padding-left: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>