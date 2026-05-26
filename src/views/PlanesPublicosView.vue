<template>
  <div class="layout">
    <NavbarGlobal />
    
    <div class="comunidad-container">
      <div class="header-section">
        <h1>🌍 Itinerarios de la Comunidad</h1>
        <p>Inspírate con los viajes que otros exploradores han planificado.</p>
      </div>

      <div v-if="cargando" class="loading">Cargando viajes increíbles... ✨</div>

      <div v-else-if="planes.length > 0" class="planes-grid">
        <div v-for="plan in planes" :key="plan.id_plan" class="plan-card">
          <div class="plan-header">
            <h3>{{ plan.nombre_viaje }}</h3>
            <span class="autor-badge">👤 Por: {{ plan.usuario?.nombre || 'Viajero anónimo' }}</span>
          </div>
          
          <div class="plan-body">
            <p><strong>📅 Fechas:</strong> {{ plan.fecha_inicio || 'Sin definir' }} al {{ plan.fecha_fin || 'Sin definir' }}</p>
            
            <p v-if="plan.estado === 'Realizado'">
              <strong>💰 Costo Final:</strong> Bs. {{ plan.presupuesto_total_estimado }}
            </p>
            <p v-else>
              <strong>💰 Presupuesto Estimado:</strong> Bs. {{ plan.presupuesto_total_estimado }}
            </p>
            
            <p><strong>📌 Estado:</strong> {{ plan.estado }}</p>
          </div>
          
          <div class="plan-footer">
            <button class="btn-ver" @click="verDetalle(plan.id_plan)">Ver Itinerario Completo</button>
            <button class="btn-clonar" @click="clonarPlan(plan)">📋 Clonar a Mis Planes</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <h2>Aún no hay planes públicos 🏕️</h2>
        <p>¡Sé el primero en compartir tu itinerario con la comunidad!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import apiViajes from '../api/axios'
import NavbarGlobal from '../components/NavbarGlobal.vue'


const router = useRouter()
const authStore = useAuthStore()
const planes = ref([])
const cargando = ref(true)

const verDetalle = (idPlan) => {
  router.push(`/plan/${idPlan}`);
}

const cargarPlanesPublicos = async () => {
  try {
    const respuesta = await apiViajes.get('/planes/publicos')
    planes.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar los planes públicos:", error)
  } finally {
    cargando.value = false
  }
}

const clonarPlan = async (plan) => {
  if (!authStore.estaAutenticado) {
    alert('⚠️ Debes iniciar sesión para guardar este plan en tu cuenta.')
    router.push('/login')
    return
  }

  // Desactivamos temporalmente la pantalla mientras clona
  cargando.value = true;
  
  try {
    // Le mandamos al backend el ID del plan original y NUESTRO ID de usuario
    const respuesta = await apiViajes.post(`/planes/${plan.id_plan}/clonar`, {
      id_usuario: authStore.usuario.id_u
    });
    
    alert('¡Itinerario clonado con éxito! Llevándote a tu nueva ruta...');
    // Viajamos automáticamente al tablero de nuestro nuevo plan
    router.push(`/plan/${respuesta.data.nuevoId}`);
    
  } catch (error) {
    console.error("Error al clonar:", error);
    alert("Hubo un error al clonar el itinerario.");
    cargando.value = false;
  }
}

onMounted(() => {
  cargarPlanesPublicos()
})
</script>

<style scoped>
.layout { background-color: #f8fafc; min-height: 100vh; }
.comunidad-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Segoe UI', sans-serif; }
.header-section { text-align: center; margin-bottom: 40px; }
.header-section h1 { color: #0f172a; margin-bottom: 10px; font-size: 2.5rem; }
.header-section p { color: #64748b; font-size: 1.1rem; }

.planes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
.plan-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;}
.plan-header { margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
.plan-header h3 { margin: 0 0 10px 0; color: #3b82f6; font-size: 1.3rem; }
.autor-badge { background: #fef08a; color: #a16207; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }

.plan-body p { margin: 8px 0; color: #475569; font-size: 0.95rem; }

.plan-footer { display: flex; gap: 10px; margin-top: 20px; }
.btn-ver { flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; color: #3b82f6; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-ver:hover { background: #eff6ff; border-color: #bfdbfe; }
.btn-clonar { flex: 1; background: #3b82f6; border: none; padding: 10px; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-clonar:hover { background: #2563eb; }

.loading, .empty-state { text-align: center; padding: 60px 20px; font-size: 1.2rem; color: #64748b; background: white; border-radius: 15px; border: 2px dashed #cbd5e1; }
</style>