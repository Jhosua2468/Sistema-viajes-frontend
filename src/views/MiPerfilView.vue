<template>
  <div class="layout">
    <NavbarGlobal />
    
    <div class="perfil-container" v-if="perfil">
      <div class="perfil-card">
        <div class="perfil-header">
          <div class="avatar-lg">
            {{ perfil.nombre?.charAt(0).toUpperCase() }}
          </div>
          <div class="perfil-info-basica">
            <h1>{{ perfil.nombre }}</h1>
            <span :class="perfil.rol === 'admin' ? 'badge-admin' : 'badge-user'">
              {{ perfil.rol === 'admin' ? 'Administrador' : 'Viajero' }}
            </span>
          </div>
        </div>

        <div class="perfil-body">
          <div class="info-grupo">
            <label>Correo Electrónico:</label>
            <p>📧 {{ perfil.email }}</p>
          </div>
          <div class="info-grupo">
            <label>Miembro desde:</label>
            <p>📅 {{ perfil.fecha_creacion ? new Date(perfil.fecha_creacion).toLocaleDateString() : 'Recientemente' }}</p>
          </div>
        </div>
        
        <div class="estadisticas-grid">
          <div class="stat-card">
            <h3>🗺️ Planes Creados</h3>
            <span>{{ perfil.planes?.length || 0 }}</span>
          </div>
          <div class="stat-card">
            <h3>🎒 Experiencias Compartidas</h3>
            <span>{{ perfil.experiencias?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading">Cargando tu perfil...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavbarGlobal from '../components/NavbarGlobal.vue';
import apiViajes from '../api/axios';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const perfil = ref(null);

const cargarPerfil = async () => {
  try {
    const idUsuario = authStore.usuario.id_u;
    const res = await apiViajes.get(`/usuarios/${idUsuario}`);
    perfil.value = res.data;
  } catch (error) {
    console.error("Error al cargar el perfil", error);
  }
};

onMounted(() => {
  cargarPerfil();
});
</script>

<style scoped>
.layout { background-color: var(--bg-layout); min-height: 100vh; }
.perfil-container { max-width: 600px; margin: 50px auto; padding: 0 20px; font-family: 'Segoe UI', sans-serif; }

.perfil-card { background: var(--bg-card); border-radius: 15px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid var(--color-border); }

.perfil-header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 30px; margin-bottom: 30px; }
.avatar-lg { width: 80px; height: 80px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; font-weight: bold; }
.perfil-info-basica h1 { margin: 0 0 10px 0; color: var(--text-main); font-size: 1.8rem; }

/* El amarillito y verde los dejamos duros porque son para los "Badges" de rol */
.badge-admin { background-color: #fef08a; color: #854d0e; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
.badge-user { background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }

.perfil-body { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }
.info-grupo label { font-size: 0.85rem; color: var(--text-muted); font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 5px; }
.info-grupo p { margin: 0; font-size: 1.1rem; color: var(--text-main); }

.estadisticas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.stat-card { background: var(--bg-header); border: 1px solid var(--color-border); padding: 20px; border-radius: 10px; text-align: center; }
.stat-card h3 { margin: 0 0 10px 0; font-size: 0.95rem; color: var(--text-muted); }
.stat-card span { font-size: 2rem; font-weight: bold; color: var(--color-primary); }

.loading { text-align: center; padding: 50px; font-size: 1.2rem; color: var(--text-muted); }
</style>