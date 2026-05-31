<template>
  <div class="layout">
    <NavbarGlobal />
    
    <div class="detalle-container" v-if="plan">
      <div class="back-nav">
        <router-link v-if="esMiPlan" to="/mis-planes" class="btn-back">⬅ Volver a Mis Planes</router-link>
        <router-link v-else to="/comunidad" class="btn-back">⬅ Volver a la Comunidad</router-link>
      </div>

      <div class="plan-header-card">
        <div class="title-row">
          <div class="title-left">
            <h1>🗺️ {{ plan.nombre_viaje }}</h1>
            <span :class="['estado-badge', plan.estado?.toLowerCase() || 'borrador']">{{ plan.estado }}</span>
          </div>
          <button v-if="esMiPlan" @click="abrirModalEditar" class="btn-editar">✏️ Editar Info</button>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="icon">📅</span>
            <div>
              <p class="label">Fechas del Viaje</p>
              <p class="value">{{ plan.fecha_inicio || 'Sin definir' }} al {{ plan.fecha_fin || 'Sin definir' }} 
                <span style="color: #3b82f6; font-size: 0.9em; margin-left: 5px;">{{ duracionViaje }}</span>
              </p>
            </div>
          </div>
          
          <div class="info-item highlight click-presupuesto" @click="mostrarModalPresupuesto = true" title="Ver desglose detallado de costos">
            <span class="icon">💰</span>
            <div>
              <p class="label">Presupuesto Estimado ℹ️</p>
              <p class="value">Bs. {{ plan.presupuesto_total_estimado }}</p>
              <small class="click-aviso">Hacer clic para ver detalle</small>
            </div>
          </div>
          
          <div class="info-item">
            <span class="icon">🌍</span>
            <div>
              <p class="label">Visibilidad</p>
              <p class="value">{{ plan.visibilidad }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="destinos-section">
        <div class="section-header">
          <h2>📍 Itinerario (Destinos a visitar)</h2>
          <button v-if="esMiPlan" @click="abrirModalDestinos" class="btn-explorar">+ Añadir Destinos Rápidamente</button>
        </div>

        <div v-if="plan.detalles && plan.detalles.length > 0" class="destinos-list">
          <div v-for="(detalle, index) in plan.detalles" :key="detalle.id_dp" class="itinerario-card">
            <div class="orden-circulo">{{ index + 1 }}</div>
            
            <div class="destino-info">
              <h3>{{ detalle.destino?.nombre }}</h3>
              <p>{{ detalle.destino?.descripcion_general?.substring(0, 80) }}...</p>
            </div>
            
            <div class="control-dias" v-if="esMiPlan">
              <button @click="cambiarDias(detalle.id_dp, (detalle.dias_estadia || 1) - 1)" :disabled="(detalle.dias_estadia || 1) <= 1" class="btn-dia">-</button>
              <span class="dias-texto">{{ detalle.dias_estadia || 1 }} días</span>
              <button @click="cambiarDias(detalle.id_dp, (detalle.dias_estadia || 1) + 1)" :disabled="diasYaAsignados >= diasMaximosPermitidos" class="btn-dia"title="No puedes exceder la duración total del viaje">+</button>
            </div>
            <div class="control-dias" v-else>
              <span class="dias-texto-solo">Estadía: {{ detalle.dias_estadia || 1 }} días</span>
            </div>
            
            <button v-if="esMiPlan" class="btn-quitar" @click="quitarDestino(detalle.id_dp)" title="Quitar de mi ruta">❌</button>
          </div>
        </div>

        <div v-else class="empty-destinos">
          <h3>El itinerario está vacío</h3>
          <p>Aún no se han añadido destinos a esta ruta.</p>
        </div>
      </div>

      <div v-if="mostrarModalPresupuesto" class="modal-overlay" @click.self="mostrarModalPresupuesto = false">
        <div class="modal-content modal-largo">
          <h2>📊 Factura Estimada del Viaje</h2>
          <p class="modal-intro">Cálculo basado en las experiencias reales de la comunidad.</p>
          
          <div v-if="plan.factura && plan.factura.length > 0" class="factura-container">
            <div v-for="(item, i) in plan.factura" :key="i" class="factura-destino">
              <div class="factura-header">
                <h3>📍 {{ item.destino }} <span>({{ item.dias }} días)</span></h3>
                <span class="subtotal-badge">Subtotal: Bs. {{ item.subtotal.toFixed(2) }}</span>
              </div>
              
              <table class="tabla-costos">
                <tbody>
                  <tr v-if="item.desglose.Transporte > 0">
                    <td>🚌 Pasajes Interdepartamentales <small>(Ida y vuelta)</small></td>
                    <td class="text-right font-mono">Bs. {{ item.desglose.Transporte.toFixed(2) }}</td>
                  </tr>
                  <tr v-if="item.desglose.Hospedaje > 0">
                    <td>🏨 Hospedaje / Hoteles <small>(Bs. {{ item.costoBaseDia.h.toFixed(2) }}/día)</small></td>
                    <td class="text-right font-mono">Bs. {{ item.desglose.Hospedaje.toFixed(2) }}</td>
                  </tr>
                  <tr v-if="item.desglose.Alimentacion > 0">
                    <td>🍽️ Alimentación <small>(Bs. {{ item.costoBaseDia.a.toFixed(2) }}/día)</small></td>
                    <td class="text-right font-mono">Bs. {{ item.desglose.Alimentacion.toFixed(2) }}</td>
                  </tr>
                  <tr v-if="item.desglose.Actividades > 0">
                    <td>🎟️ Entradas y Tours</td>
                    <td class="text-right font-mono">Bs. {{ item.desglose.Actividades.toFixed(2) }}</td>
                  </tr>
                  <tr v-if="item.desglose.Otros > 0">
                    <td>🎈 Otros <small>(Taxis locales, snacks, etc: Bs. {{ item.costoBaseDia.o.toFixed(2) }}/día)</small></td>
                    <td class="text-right font-mono">Bs. {{ item.desglose.Otros.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="factura-gran-total">
              <span>TOTAL ACUMULADO</span>
              <span class="total-monto">Bs. {{ plan.presupuesto_total_estimado }}</span>
            </div>
          </div>

          <div v-else class="empty-mini">
            <p>Agrega destinos a tu itinerario para ver la factura.</p>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModalPresupuesto = false" class="btn-guardar">Entendido</button>
          </div>
        </div>
      </div>

      <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="cerrarModalEditar">
        <div class="modal-content">
          <h2>✏️ Editar Plan</h2>
          <form @submit.prevent="guardarEdicionPlan" class="form-plan">
            <div class="input-group">
              <label>Nombre del Viaje</label>
              <input type="text" v-model="editData.nombre_viaje" required />
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Fecha Inicio</label>
                <input type="date" v-model="editData.fecha_inicio" />
              </div>
              <div class="input-group">
                <label>Fecha Fin</label>
                <input type="date" v-model="editData.fecha_fin" />
              </div>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Estado del Viaje</label>
                <select v-model="editData.estado">
                  <option value="Borrador">Borrador (Aún planeando)</option>
                  <option value="Planificado">Planificado (Listo para ir)</option>
                  <option value="Realizado">Realizado (Viaje finalizado)</option>
                </select>
              </div>

              <div class="input-group">
                <label>Visibilidad</label>
                <select v-model="editData.visibilidad" :disabled="editData.estado === 'Borrador'">
                  <option value="Privado">🔒 Privado</option>
                  <option value="Publico" v-if="editData.estado !== 'Borrador'">🌍 Público</option>
                </select>
                <small v-if="editData.estado === 'Borrador'" style="color: #ef4444; font-size: 0.75rem;">Los borradores deben ser privados.</small>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="cerrarModalEditar" class="btn-cancelar">Cancelar</button>
              <button type="submit" class="btn-guardar">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="mostrarModalDestinos" class="modal-overlay" @click.self="cerrarModalDestinos">
        <div class="modal-content modal-largo">
          <h2>🗺️ Selecciona un Destino</h2>
          <input type="text" v-model="buscadorDestinos" placeholder="🔍 Buscar destino por nombre..." class="search-rapido" />
          
          <div class="lista-destinos-rapida">
            <div v-for="destino in destinosFiltrados" :key="destino.id_d" class="destino-item">
              <div>
                <strong>{{ destino.nombre }}</strong>
                <span class="badge-mini">{{ destino.departamento?.nombre || 'Bolivia' }}</span>
              </div>
              <button @click="agregarDestinoAlPlan(destino.id_d)" class="btn-add-mini">+ Añadir</button>
            </div>
            <div v-if="destinosFiltrados.length === 0" class="empty-mini">No se encontraron destinos.</div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="cerrarModalDestinos" class="btn-cancelar">Cerrar</button>
          </div>
        </div>
      </div>

    </div>
    
    <div v-else class="loading">Cargando detalles del viaje...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import apiViajes from '../api/axios'
import NavbarGlobal from '../components/NavbarGlobal.vue'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const authStore = useAuthStore()
const plan = ref(null)
// 💡 CÁLCULO DE DÍAS DE VIAJE
const duracionViaje = computed(() => {
  if (!plan.value?.fecha_inicio || !plan.value?.fecha_fin) return '';
  const inicio = new Date(plan.value.fecha_inicio);
  const fin = new Date(plan.value.fecha_fin);
  const diffTiempo = fin.getTime() - inicio.getTime();
  const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24)) + 1; // +1 para contar el día de inicio y fin
  return diffDias > 0 ? `(${diffDias} días)` : '';
})

const esMiPlan = computed(() => {
  if (!plan.value?.usuario?.id_u || !authStore.usuario?.id_u) return false;
  return plan.value.usuario.id_u === authStore.usuario.id_u;
})

// Variables de Control para Modales
const mostrarModalEditar = ref(false)
const mostrarModalDestinos = ref(false)
const mostrarModalPresupuesto = ref(false) // 💡 Nueva variable
const editData = ref({})

// Variables para el Catálogo Rápido
const todosLosDestinos = ref([])
const buscadorDestinos = ref('')

const cargarDetallePlan = async () => {
  try {
    const idPlan = route.params.id
    const respuesta = await apiViajes.get(`/planes/${idPlan}`)
    plan.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar el plan:", error)
  }
}

const abrirModalEditar = () => {
  editData.value = { ...plan.value }
  mostrarModalEditar.value = true
}
const cerrarModalEditar = () => mostrarModalEditar.value = false

const guardarEdicionPlan = async () => {
  try {
    const idPlan = plan.value.id_plan;
    
    // Validar estado
    if (editData.value.estado === 'Borrador') {
      editData.value.visibilidad = 'Privado';
    }

    const acabaDeFinalizar = editData.value.estado === 'Realizado' && plan.value.estado !== 'Realizado';

    // 💡 CORRECCIÓN AQUÍ: Habías puesto 'payloadLinter' que no existe
    const payloadLimpio = {
      nombre_viaje: editData.value.nombre_viaje,
      fecha_inicio: editData.value.fecha_inicio,
      fecha_fin: editData.value.fecha_fin,
      estado: editData.value.estado,
      visibilidad: editData.value.visibilidad
    };

    // Enviamos el payload correctamente
    await apiViajes.patch(`/planes/${idPlan}`, payloadLimpio);
    
    await cargarDetallePlan();
    cerrarModalEditar();

    if (acabaDeFinalizar) {
      if (confirm('¡Bienvenido de vuelta viajero! 🎉\n\n¿Te gustaría registrar tus gastos reales?')) {
        alert('Próximamente: Te llevaremos al formulario para registrar tu Experiencia oficial.');
      }
    }
  } catch (error) {
    console.error("Detalle del error:", error.response?.data || error); // 💡 Mira esto en F12
    alert('Error al actualizar la información del plan');
  }
}

const cargarDestinosParaModal = async () => {
  try {
    const res = await apiViajes.get('/destinos')
    todosLosDestinos.value = res.data
  } catch (error) {
    console.error("Error al cargar destinos")
  }
}

const abrirModalDestinos = () => {
  if (todosLosDestinos.value.length === 0) cargarDestinosParaModal()
  mostrarModalDestinos.value = true
}
const cerrarModalDestinos = () => {
  mostrarModalDestinos.value = false
  buscadorDestinos.value = ''
}

const destinosFiltrados = computed(() => {
  return todosLosDestinos.value.filter(d => 
    d.nombre.toLowerCase().includes(buscadorDestinos.value.toLowerCase())
  )
})

const agregarDestinoAlPlan = async (idDestino) => {
  try {
    const idPlan = plan.value.id_plan;
    await apiViajes.post(`/planes/${idPlan}/destinos`, { id_destino: idDestino });
    await cargarDetallePlan(); 
    alert('¡Destino añadido! El presupuesto se ha actualizado.');
  } catch (error) {
    console.error("Error al añadir destino:", error);
    alert('Hubo un error al añadir el destino a tu ruta.');
  }
}

// 💡 Función rápida para sumar o restar días
const cambiarDias = async (idDp, nuevosDias) => {
  if (nuevosDias < 1) return; // No se puede viajar 0 días
  try {
    const idPlan = plan.value.id_plan;
    // Llamamos al nuevo endpoint PATCH
    await apiViajes.patch(`/planes/${idPlan}/destinos/${idDp}`, { dias_estadia: nuevosDias });
    
    // Recargamos silenciosamente la pantalla. ¡El presupuesto se actualizará solo!
    await cargarDetallePlan(); 
  } catch (error) {
    console.error("Error al cambiar días:", error);
    alert('Hubo un error al actualizar los días de estadía.');
  }
}

// 💡 CÁLCULO DE DÍAS MÁXIMOS DEL PLAN
const diasMaximosPermitidos = computed(() => {
  if (!plan.value?.fecha_inicio || !plan.value?.fecha_fin) return 999; // Si no hay fechas, no hay límite
  const inicio = new Date(plan.value.fecha_inicio);
  const fin = new Date(plan.value.fecha_fin);
  return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
});

// 💡 CÁLCULO DE DÍAS YA ASIGNADOS A DESTINOS
const diasYaAsignados = computed(() => {
  if (!plan.value?.detalles) return 0;
  return plan.value.detalles.reduce((acc, detalle) => acc + (detalle.dias_estadia || 1), 0);
});

const quitarDestino = async (idDp) => {
  if (confirm('¿Seguro que deseas quitar este destino de tu itinerario?')) {
    try {
      const idPlan = plan.value.id_plan;
      await apiViajes.delete(`/planes/${idPlan}/destinos/${idDp}`);
      await cargarDetallePlan(); 
    } catch (error) {
      console.error("Error al quitar destino:", error);
      alert('Hubo un error al quitar el destino.');
    }
  }
}

onMounted(() => {
  cargarDetallePlan()
})
</script>

<style scoped>
/* NAVEGACIÓN Y CABECERA */
.layout { background-color: #f8fafc; min-height: 100vh; }
.detalle-container { max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Segoe UI', sans-serif; }
.back-nav { margin-bottom: 20px; }
.btn-back { display: inline-block; color: #64748b; text-decoration: none; font-weight: 600; font-size: 1rem; transition: all 0.2s; padding: 5px 10px; border-radius: 6px; margin-left: -10px; }
.btn-back:hover { background-color: #e2e8f0; color: #0f172a; }

.plan-header-card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px; border: 1px solid #e2e8f0; }
.title-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
.title-left { display: flex; align-items: center; gap: 15px; }
.title-left h1 { margin: 0; color: #1e293b; font-size: 2rem; }
.btn-editar { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-editar:hover { background: #f1f5f9; }

.estado-badge { padding: 6px 12px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-size: 0.85rem;}
.estado-badge.borrador { background: #fef3c7; color: #d97706; }
.estado-badge.planificado { background: #dbeafe; color: #1d4ed8; }
.estado-badge.realizado { background: #d1fae5; color: #059669; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.info-item { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #f1f5f9; }
.info-item.highlight { background: #eff6ff; border-color: #bfdbfe; }

/* 💡 EFECTO BOTÓN EN PRESUPUESTO */
.click-presupuesto { cursor: pointer; transition: all 0.2s; display: flex; flex-direction: row; }
.click-presupuesto:hover { background: #dbeafe; transform: scale(1.02); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
.click-aviso { color: #3b82f6; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-top: 4px; display: block; }

.icon { font-size: 1.8rem; }
.label { margin: 0; font-size: 0.85rem; color: #64748b; font-weight: bold; text-transform: uppercase; }
.value { margin: 5px 0 0 0; font-size: 1.1rem; color: #0f172a; font-weight: bold; }

/* SECCIÓN DESTINOS */
.destinos-section { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { margin: 0; color: #1e293b; }
.btn-explorar { background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: background 0.3s; }
.btn-explorar:hover { background: #059669; }
.empty-destinos { text-align: center; padding: 40px 20px; background: #f8fafc; border-radius: 10px; border: 2px dashed #cbd5e1; color: #64748b; }

.destinos-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
.itinerario-card { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; transition: transform 0.2s; }
.itinerario-card:hover { transform: translateX(5px); border-color: #cbd5e1; }
.orden-circulo { width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; font-weight: bold; flex-shrink: 0; margin-right: 15px; }
.destino-info { flex: 1; }
.destino-info h3 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.2rem; }
.destino-info p { margin: 0; color: #64748b; font-size: 0.9rem; }
.btn-quitar { background: #fee2e2; border: none; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s; margin-left: 15px; }
.btn-quitar:hover { background: #fca5a5; }

/* MODALES GENERALES 
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-content { background: white; padding: 30px; border-radius: 15px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;}
.modal-content.modal-largo { max-width: 600px; }
.modal-content h2 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
.modal-intro { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; line-height: 1.4; }*/

/* ======================================= */
/* MODALES GENERALES Y FACTURA             */
/* ======================================= */
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(15, 23, 42, 0.75); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000; 
  backdrop-filter: blur(3px); 
  padding: 20px; 
  box-sizing: border-box; 
}

.modal-content { 
  background: white; 
  padding: 30px; 
  border-radius: 15px; 
  width: 100%; 
  max-width: 500px; 
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
  max-height: 85vh; /* 💡 ALTURA MÁXIMA PARA FORZAR EL SCROLL */
  overflow-y: auto; /* 💡 EL SCROLL MAESTRO VIVE AQUÍ */
}

.modal-content.modal-largo { 
  max-width: 650px; 
}

.modal-content h2 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
.modal-intro { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; line-height: 1.4; }

/* 💡 ESTILOS DE LA FACTURA LIBERADOS */
.factura-container { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  max-height: none !important; 
  overflow-y: visible !important; 
}

.factura-destino { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.factura-header { background: #f8fafc; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.factura-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.factura-header h3 span { color: #64748b; font-size: 0.9rem; font-weight: normal; }
.subtotal-badge { background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; }

.tabla-costos { width: 100%; border-collapse: collapse; }
.tabla-costos td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; color: #334155; }
.text-right { text-align: right !important; }
.font-mono { font-family: monospace; font-size: 1.05rem; }

.factura-gran-total { display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: white; padding: 15px 20px; border-radius: 8px; margin-top: 10px; font-size: 1.2rem; font-weight: bold; }
.total-monto { color: #34d399; font-family: monospace; font-size: 1.4rem; }

/* 💡 ESTILOS TABLA DE COSTOS */
.tabla-costos { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.tabla-costos th, .tabla-costos td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 1rem; color: #334155;}
.tabla-costos th { background-color: #f8fafc; font-weight: bold; color: #1e293b; }
.text-right { text-align: right !important; }
.font-mono { font-family: monospace; font-size: 1.05rem; }
.row-total { background-color: #eff6ff; font-size: 1.1rem; }
.row-total td { border-top: 2px solid #3b82f6; border-bottom: 2px solid #3b82f6; }
.total-color { color: #2563eb; }

/* ESTILOS DE LA FACTURA-PRESUPUESTO*/
.factura-container { display: flex; flex-direction: column; gap: 20px; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
.factura-destino { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.factura-header { background: #f8fafc; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.factura-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.factura-header h3 span { color: #64748b; font-size: 0.9rem; font-weight: normal; }
.subtotal-badge { background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; }
.factura-gran-total { display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: white; padding: 15px 20px; border-radius: 8px; margin-top: 10px; font-size: 1.2rem; font-weight: bold; }
.total-monto { color: #34d399; font-family: monospace; font-size: 1.4rem; }

/* ESTILOS DEL CONTADOR DE DÍAS */
.control-dias { display: flex; align-items: center; background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin: 0 15px; }
.btn-dia { background: #f1f5f9; border: none; padding: 8px 12px; font-weight: bold; color: #475569; cursor: pointer; transition: background 0.2s; }
.btn-dia:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; }
.btn-dia:disabled { opacity: 0.5; cursor: not-allowed; }
.dias-texto { padding: 0 15px; font-size: 0.9rem; font-weight: 600; color: #1e293b; min-width: 50px; text-align: center; }
.dias-texto-solo { font-size: 0.9rem; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; }

/* BOTONES FORMULARIO */
.form-plan .input-group { margin-bottom: 15px; }
.form-plan .input-row { display: flex; gap: 15px; }
.form-plan .input-row .input-group { flex: 1; }
.form-plan label { display: block; margin-bottom: 5px; color: #475569; font-weight: 600; font-size: 0.9rem; }
.form-plan input, .form-plan select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; box-sizing: border-box; background: white;}
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-guardar { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-guardar:hover { background: #2563eb; }

/* CATÁLOGO RÁPIDO */
.search-rapido { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; margin-bottom: 15px; box-sizing: border-box; outline: none; }
.lista-destinos-rapida { display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; }
.destino-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
.badge-mini { background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
.btn-add-mini { background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.loading { text-align: center; padding: 50px; font-size: 1.2rem; color: #64748b; }
</style>