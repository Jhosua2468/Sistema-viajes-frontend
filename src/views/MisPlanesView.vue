<template>
  <div class="layout">
    <NavbarGlobal />
    
    <div class="planes-container">
      <div class="header-section">
        <h1>🗺️ Mis Planes de Viaje</h1>
        <p>Organiza tus próximas aventuras y calcula tu presupuesto.</p>
        <button @click="abrirModal" class="btn-crear">+ Crear Nuevo Plan</button>
      </div>

      <div v-if="cargando" class="loading">Cargando tus itinerarios...</div>

      <div v-else-if="planes.length > 0" class="planes-grid">
        <div v-for="plan in planes" :key="plan.id_plan" class="plan-card">
          <div class="plan-header">
            <h3>{{ plan.nombre_viaje || 'Viaje sin título' }}</h3>
            <div class="badges-container">
              <span :class="['estado-badge', plan.estado.toLowerCase()]">{{ plan.estado }}</span>
              <span class="visibilidad-badge" :title="plan.visibilidad === 'Publico' ? 'Visible para la comunidad' : 'Solo tú puedes verlo'">
                {{ plan.visibilidad === 'Publico' ? '🌍 Público' : '🔒 Privado' }}
              </span>
            </div>
          </div>
          
          <div class="plan-body">
            <p><strong>📅 Fechas:</strong> {{ plan.fecha_inicio || 'Sin definir' }} al {{ plan.fecha_fin || 'Sin definir' }}</p>
            <p><strong>💰 Presupuesto Estimado:</strong> Bs. {{ plan.presupuesto_total_estimado || '0.00' }}</p>
          </div>
          
          <div class="plan-footer">
            <button @click="irADetalle(plan.id_plan)" class="btn-ver">Ver Detalles</button>
            <button @click="eliminarPlan(plan.id_plan)" class="btn-eliminar" title="Eliminar Plan">🗑️</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <h2>Aún no tienes planes de viaje 🏕️</h2>
        <p>Comienza creando un itinerario para empezar a calcular tu presupuesto.</p>
      </div>

      <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-content">
          <h2>Crear Nuevo Itinerario</h2>
          <form @submit.prevent="guardarNuevoPlan" class="form-plan">
            
            <div class="input-group">
              <label>Nombre del Viaje</label>
              <input type="text" v-model="nuevoPlan.nombre_viaje" required placeholder="Ej: Aventura en el Sur" />
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Fecha de Inicio</label>
                <input type="date" v-model="nuevoPlan.fecha_inicio" required />
              </div>
              <div class="input-group">
                <label>Fecha de Fin</label>
                <input type="date" v-model="nuevoPlan.fecha_fin" required />
              </div>
            </div>

            <div class="input-group">
              <label>Visibilidad del Plan</label>
              <select v-model="nuevoPlan.visibilidad" class="select-visibilidad" disabled>
                <option value="Privado">🔒 Privado (Los borradores son privados por defecto)</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" @click="cerrarModal" class="btn-cancelar">Cancelar</button>
              <button type="submit" class="btn-guardar">Guardar Plan</button>
            </div>
          </form>
        </div>
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
const mostrarModal = ref(false)

const nuevoPlan = ref({
  nombre_viaje: '',
  fecha_inicio: '',
  fecha_fin: '',
  visibilidad: 'Privado' // 💡 Por defecto nace Privado
})

const cargarMisPlanes = async () => {
  try {
    const idUsuario = authStore.usuario.id_u
    const respuesta = await apiViajes.get(`/usuarios/${idUsuario}`)
    planes.value = respuesta.data.planes || []
  } catch (error) {
    console.error("Error al cargar los planes:", error)
  } finally {
    cargando.value = false
  }
}

const abrirModal = () => mostrarModal.value = true
const cerrarModal = () => {
  mostrarModal.value = false
  nuevoPlan.value = { nombre_viaje: '', fecha_inicio: '', fecha_fin: '', visibilidad: 'Privado' }
}

const guardarNuevoPlan = async () => {
  try {
    const payload = {
      nombre_viaje: nuevoPlan.value.nombre_viaje,
      fecha_inicio: nuevoPlan.value.fecha_inicio,
      fecha_fin: nuevoPlan.value.fecha_fin,
      visibilidad: nuevoPlan.value.visibilidad, // 💡 Mandamos la visibilidad al backend
      estado: 'Borrador', 
      presupuesto_total_estimado: 0, 
      usuario: { id_u: authStore.usuario.id_u } 
    }

    await apiViajes.post('/planes', payload)
    cerrarModal()
    await cargarMisPlanes()
  } catch (error) {
    console.error("Error al crear el plan:", error)
    alert('Hubo un error al guardar el plan.')
  }
}

const eliminarPlan = async (id_plan) => {
  if (confirm('¿Estás seguro de que deseas eliminar este itinerario completo?')) {
    try {
      await apiViajes.delete(`/planes/${id_plan}`)
      await cargarMisPlanes()
    } catch (error) {
      alert('Error al eliminar el plan')
    }
  }
}

const irADetalle = (id_plan) => {
  router.push(`/plan/${id_plan}`)
}

onMounted(() => {
  cargarMisPlanes()
})
</script>

<style scoped>
.layout { background-color: var(--bg-layout); min-height: 100vh; }
.planes-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Segoe UI', sans-serif; }
.header-section { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 40px; }
.header-section h1 { color: var(--text-main); margin-bottom: 10px; font-size: 2.5rem; }
.header-section p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 20px; }

.btn-crear { background-color: var(--color-success); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: opacity 0.3s; }
.btn-crear:hover { opacity: 0.9; }

.planes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }

/* 💡 TARJETAS DINÁMICAS */
.plan-card { 
  background: var(--bg-card); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;
}
.plan-header { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px; border-bottom: 1px solid var(--color-border); padding-bottom: 10px; gap: 8px;}
.plan-header h3 { margin: 0; color: var(--color-primary); font-size: 1.25rem; }

.badges-container { display: flex; gap: 8px; }
/* Los badges de estado se mantienen fijos para que el semáforo (amarillo, azul, verde) funcione igual de noche */
.estado-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;}
.estado-badge.borrador { background: #fef3c7; color: #d97706; }
.estado-badge.planificado { background: #dbeafe; color: #1d4ed8; }
.estado-badge.realizado { background: #d1fae5; color: #059669; }

.visibilidad-badge { background: var(--bg-header); color: var(--text-muted); padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; cursor: help; }

.plan-body p { margin: 8px 0; color: var(--text-muted); font-size: 0.95rem; }

.plan-footer { display: flex; gap: 10px; margin-top: 20px; }
.btn-ver { flex: 1; background: var(--bg-layout); border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; color: var(--text-main); font-weight: bold; cursor: pointer; transition: all 0.2s;}
.btn-ver:hover { background: var(--bg-header); }
.btn-eliminar { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 12px; border-radius: 6px; cursor: pointer; color: var(--color-danger); transition: all 0.2s;}
.btn-eliminar:hover { background: rgba(239, 68, 68, 0.2); }

.empty-state { text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 15px; border: 2px dashed var(--color-border); }
.empty-state h2 { color: var(--text-muted); margin-bottom: 10px; }

/* MODALES DINÁMICOS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-content { background: var(--bg-card); padding: 30px; border-radius: 15px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-content h2 { color: var(--text-main); margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid var(--color-border); padding-bottom: 10px; }

.form-plan .input-group { margin-bottom: 15px; }
.form-plan .input-row { display: flex; gap: 15px; }
.form-plan .input-row .input-group { flex: 1; }
.form-plan label { display: block; margin-bottom: 5px; color: var(--text-main); font-weight: 600; font-size: 0.9rem; }
.form-plan input, .select-visibilidad, .form-plan select { 
  width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 1rem; box-sizing: border-box; 
  background: var(--bg-layout); color: var(--text-main); 
}
.form-plan input:focus, .select-visibilidad:focus, .form-plan select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); background: var(--bg-card); }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-cancelar { background: var(--bg-header); color: var(--text-main); border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-cancelar:hover { opacity: 0.8; }
.btn-guardar { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-guardar:hover { opacity: 0.9; }
</style>