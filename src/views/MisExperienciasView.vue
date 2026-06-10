<template>
  <div class="layout">
    <NavbarGlobal />
    
    <div class="contenedor-principal">
      <div class="header-pagina">
        <div>
          <h1>📖 Mi Bitácora de Viajes</h1>
          <p class="subtitulo">Gestiona las experiencias y gastos que has compartido con la comunidad.</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          <button class="btn-primario" @click="router.push('/mis-planes')" style="background: #f8fafc; color: #3b82f6; border: 1px solid #3b82f6;">
            🗺️ Planear Viaje Futuro
          </button>
          <button class="btn-primario" @click="abrirCreacion">
            ➕ Registrar Viaje Pasado
          </button>
        </div>
      </div>

      <div v-if="cargando" class="estado-mensaje">Cargando tu bitácora...</div>
      
      <div v-else-if="misExperiencias.length === 0" class="estado-mensaje vacio">
        <h3>Aún no has registrado ninguna experiencia.</h3>
        <p>Cuando marques un plan como "Realizado", podrás compartir tu viaje aquí.</p>
      </div>

      <div v-else class="grid-experiencias">
        <div v-for="exp in misExperiencias" :key="exp.id_exp" class="tarjeta-exp">
          <div class="tarjeta-header">
            <h3>📍 {{ exp.destino?.nombre }}</h3>
            <span class="fecha">{{ exp.fecha_viaje }}</span>
          </div>
          
          <div class="tarjeta-body">
            <div class="estrellas">
              <span v-for="n in (exp.valoraciones?.[0]?.puntuacion || 0)" :key="n">⭐</span>
            </div>
            <p class="resumen">"{{ exp.resumen_experiencia }}"</p>
            <div class="gasto-total">
              <span>Gasto reportado:</span>
              <strong class="font-mono text-blue">Bs. {{ calcularTotal(exp.costos) }}</strong>
            </div>
          </div>
          
          <div class="tarjeta-footer">
            <button @click="abrirEdicion(exp)" class="btn-editar">✏️ Editar</button>
            <button @click="eliminarMiExperiencia(exp.id_exp)" class="btn-eliminar">🗑️ Borrar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modalCrearAbierto" class="modal-overlay" @click.self="modalCrearAbierto = false">
      <div class="modal-content modal-largo">
        <h2>✈️ Registrar Viaje Pasado</h2>
        <p style="color: #64748b; margin-top: -10px;">Aporta a la comunidad con viajes que hiciste antes de usar la app.</p>
        
        <form @submit.prevent="guardarNuevaExperiencia" class="form-plan">
          <div class="input-row">
            <div class="input-group">
              <label>📍 ¿A qué destino fuiste?</label>
              <select v-model="nuevaExp.id_destino" required>
                <option value="" disabled>Selecciona un destino...</option>
                <option v-for="dest in listaDestinos" :key="dest.id_d" :value="dest.id_d">
                  {{ dest.nombre }}
                </option>
              </select>
            </div>
            <div class="input-group">
              <label>📅 Fecha aproximada del viaje</label>
              <input type="date" v-model="nuevaExp.fecha_viaje" required />
            </div>
          </div>

          <div class="input-row">
            <div class="input-group" style="flex: 2;">
              <label>📝 Resumen del viaje</label>
              <textarea v-model="nuevaExp.resumen" rows="3" required></textarea>
            </div>
            <div class="input-group" style="flex: 1;">
              <label>⭐ Calificación</label>
              <select v-model="nuevaExp.estrellas">
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>
            </div>
          </div>

          <h3 class="titulo-separador">💸 Desglose de Gastos</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin-top: -10px;">Llena solo lo que recuerdes haber gastado.</p>
          
          <div class="input-row">
            <div class="input-group">
              <label>🚌 Pasajes (Ida y vuelta)</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="nuevaExp.costos.Transporte" />
              </div>
            </div>
            <div class="input-group">
              <label>🏨 Hospedaje (Total)</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="nuevaExp.costos.Hospedaje" />
              </div>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>🍽️ Alimentación (Total)</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="nuevaExp.costos.Alimentacion" />
              </div>
            </div>
            <div class="input-group">
              <label>🎟️ Actividades / Entradas</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="nuevaExp.costos.Actividades" />
              </div>
            </div>
          </div>

          <div class="input-group">
            <label>🎈 Otros gastos</label>
            <div class="input-prefix">
              <span>Bs.</span>
              <input type="number" step="0.5" v-model="nuevaExp.costos.Otros" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="modalCrearAbierto = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-guardar">Guardar Viaje Pasado</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="modalEdicionAbierto" class="modal-overlay" @click.self="modalEdicionAbierto = false">
      <div class="modal-content modal-largo">
        <h2>✏️ Editar Experiencia en {{ edicionExp.nombreDestino }}</h2>
        
        <form @submit.prevent="guardarEdicion" class="form-plan">
          <div class="input-row">
            <div class="input-group" style="flex: 2;">
              <label>📝 Resumen del viaje</label>
              <textarea v-model="edicionExp.resumen" rows="3" required></textarea>
            </div>
            <div class="input-group" style="flex: 1;">
              <label>⭐ Calificación</label>
              <select v-model="edicionExp.estrellas">
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>
            </div>
          </div>

          <h3 class="titulo-separador">💸 Desglose de Gastos</h3>
          <button type="button" @click="mostrarDescripciones = !mostrarDescripciones" class="btn-toggle-desc">
            {{ mostrarDescripciones ? '🔼 Ocultar detalles' : '📝 Editar detalles de los gastos' }}
          </button>

          <div class="input-row">
            <div class="input-group">
              <label>🚌 Pasajes</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="edicionExp.costos.Transporte" />
              </div>
              <input v-if="mostrarDescripciones" type="text" v-model="edicionExp.descripciones.Transporte" class="input-desc-opcional" />
            </div>
            <div class="input-group">
              <label>🏨 Hospedaje</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="edicionExp.costos.Hospedaje" />
              </div>
              <input v-if="mostrarDescripciones" type="text" v-model="edicionExp.descripciones.Hospedaje" class="input-desc-opcional" />
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>🍽️ Alimentación</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="edicionExp.costos.Alimentacion" />
              </div>
              <input v-if="mostrarDescripciones" type="text" v-model="edicionExp.descripciones.Alimentacion" class="input-desc-opcional" />
            </div>
            <div class="input-group">
              <label>🎟️ Actividades</label>
              <div class="input-prefix">
                <span>Bs.</span>
                <input type="number" step="0.5" v-model="edicionExp.costos.Actividades" />
              </div>
              <input v-if="mostrarDescripciones" type="text" v-model="edicionExp.descripciones.Actividades" class="input-desc-opcional" />
            </div>
          </div>

          <div class="input-group">
            <label>🎈 Otros</label>
            <div class="input-prefix">
              <span>Bs.</span>
              <input type="number" step="0.5" v-model="edicionExp.costos.Otros" />
            </div>
            <input v-if="mostrarDescripciones" type="text" v-model="edicionExp.descripciones.Otros" class="input-desc-opcional" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="modalEdicionAbierto = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-guardar">💾 Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarGlobal from '../components/NavbarGlobal.vue';
import apiViajes from '../api/axios';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const misExperiencias = ref([]);
const cargando = ref(true);

const modalEdicionAbierto = ref(false);
const mostrarDescripciones = ref(false);

// Objeto para manejar la edición
const edicionExp = ref({
  id_exp: null,
  nombreDestino: '',
  resumen: '',
  estrellas: 5,
  costos: { Transporte: 0, Hospedaje: 0, Alimentacion: 0, Actividades: 0, Otros: 0 },
  descripciones: { Transporte: '', Hospedaje: '', Alimentacion: '', Actividades: '', Otros: '' }
});

const cargarMisExperiencias = async () => {
  try {
    const idUsuario = authStore.usuario.id_u;
    const res = await apiViajes.get(`/experiencias/usuario/${idUsuario}`);
    misExperiencias.value = res.data;
  } catch (error) {
    console.error("Error al cargar experiencias", error);
  } finally {
    cargando.value = false;
  }
};

const calcularTotal = (costos) => {
  if (!costos || costos.length === 0) return 0;
  return costos.reduce((acc, c) => acc + Number(c.monto), 0).toFixed(2);
};

const eliminarMiExperiencia = async (idExp) => {
  if (confirm("¿Estás seguro de eliminar esta experiencia? Tus recomendaciones se borrarán de la comunidad.")) {
    try {
      await apiViajes.delete(`/experiencias/${idExp}`);
      await cargarMisExperiencias();
    } catch (error) {
      alert("Error al eliminar la experiencia.");
    }
  }
};

const abrirEdicion = (exp) => {
  // 1. Limpiamos los datos base
  edicionExp.value.costos = { Transporte: 0, Hospedaje: 0, Alimentacion: 0, Actividades: 0, Otros: 0 };
  edicionExp.value.descripciones = { Transporte: '', Hospedaje: '', Alimentacion: '', Actividades: '', Otros: '' };

  // 2. Cargamos los datos directos
  edicionExp.value.id_exp = exp.id_exp;
  edicionExp.value.nombreDestino = exp.destino?.nombre;
  edicionExp.value.resumen = exp.resumen_experiencia;
  edicionExp.value.estrellas = exp.valoraciones?.[0]?.puntuacion || 5;

  // 3. 💡 MAGIA: Desarmamos el Array del backend y lo volvemos un Objeto para el frontend
  if (exp.costos && exp.costos.length > 0) {
    exp.costos.forEach(c => {
      if (edicionExp.value.costos[c.categoria] !== undefined) {
        edicionExp.value.costos[c.categoria] = c.monto;
        edicionExp.value.descripciones[c.categoria] = c.descripcion_gasto.startsWith('Gasto en') ? '' : c.descripcion_gasto;
      }
    });
  }

  modalEdicionAbierto.value = true;
};

const guardarEdicion = async () => {
  try {
    // Transformamos el objeto de costos de vuelta a un Array para el backend
    const arregloCostos = Object.keys(edicionExp.value.costos).map(key => {
      const texto = edicionExp.value.descripciones[key].trim();
      return {
        categoria: key,
        descripcion_gasto: texto !== '' ? texto : `Gasto en ${key}`,
        monto: Number(edicionExp.value.costos[key] || 0)
      };
    });

    const payload = {
      resumen_experiencia: edicionExp.value.resumen,
      puntuacion: Number(edicionExp.value.estrellas),
      costos: arregloCostos
    };

    // 💡 IMPORTANTE: Tu backend debe tener un PATCH /experiencias/:id que actualice todo.
    // Si no lo tiene preparado para transacciones complejas, es mejor borrar y recrear los costos en el backend.
    await apiViajes.patch(`/experiencias/${edicionExp.value.id_exp}`, payload);
    
    alert("Experiencia actualizada con éxito.");
    modalEdicionAbierto.value = false;
    await cargarMisExperiencias();
  } catch (error) {
    console.error(error);
    alert("Hubo un error al actualizar.");
  }
};

// Añade esto debajo de tus variables
const modalCrearAbierto = ref(false);
const listaDestinos = ref([]); // Para que elija a dónde fue
const nuevaExp = ref({
  id_destino: '',
  resumen: '',
  fecha_viaje: '',
  estrellas: 5,
  costos: { Transporte: 0, Hospedaje: 0, Alimentacion: 0, Actividades: 0, Otros: 0 },
  descripciones: { Transporte: '', Hospedaje: '', Alimentacion: '', Actividades: '', Otros: '' }
});

// Función para traer los destinos disponibles
const cargarDestinos = async () => {
  try {
    const res = await apiViajes.get('/destinos');
    listaDestinos.value = res.data;
  } catch (error) {
    console.error("Error al cargar destinos", error);
  }
};

const abrirCreacion = () => {
  if (listaDestinos.value.length === 0) cargarDestinos();
  modalCrearAbierto.value = true;
};

const guardarNuevaExperiencia = async () => {
  try {
    const arregloCostos = Object.keys(nuevaExp.value.costos).map(key => {
      const texto = nuevaExp.value.descripciones[key].trim();
      return {
        categoria: key,
        descripcion_gasto: texto !== '' ? texto : `Gasto en ${key}`,
        monto: Number(nuevaExp.value.costos[key] || 0)
      };
    });

    const payload = {
      id_destino: nuevaExp.value.id_destino,
      resumen_experiencia: nuevaExp.value.resumen,
      puntuacion: Number(nuevaExp.value.estrellas),
      fecha_viaje: nuevaExp.value.fecha_viaje,
      id_usuario: authStore.usuario.id_u,
      costos: arregloCostos
    };

    await apiViajes.post('/experiencias', payload);
    alert("¡Viaje pasado registrado con éxito!");
    modalCrearAbierto.value = false;
    await cargarMisExperiencias(); // Recargamos la bitácora
    
    // Limpiar formulario
    nuevaExp.value.resumen = '';
    for (let key in nuevaExp.value.costos) nuevaExp.value.costos[key] = 0;
  } catch (error) {
    console.error(error);
    alert("Error al guardar la experiencia.");
  }
};

onMounted(() => {
  cargarMisExperiencias();
});
</script>

<style scoped>
/* ESTILOS ESPECÍFICOS DE LA VISTA */
.layout { background-color: #f8fafc; min-height: 100vh; }
.contenedor-principal { max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Segoe UI', sans-serif; }

.header-pagina { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-pagina h1 { margin: 0; color: #1e293b; font-size: 2.2rem; }
.subtitulo { color: #64748b; margin-top: 5px; }

.btn-primario { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-primario:hover { background: #2563eb; }

.estado-mensaje { text-align: center; padding: 50px; color: #64748b; font-size: 1.2rem; }
.estado-mensaje.vacio { background: white; border: 2px dashed #cbd5e1; border-radius: 12px; }

.grid-experiencias { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.tarjeta-exp { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
.tarjeta-header { background: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.tarjeta-header h3 { margin: 0; color: #0f172a; font-size: 1.1rem; }
.fecha { font-size: 0.8rem; color: #64748b; font-weight: bold; }

.tarjeta-body { padding: 15px; flex-grow: 1; }
.estrellas { margin-bottom: 10px; font-size: 1.1rem; }
.resumen { font-style: italic; color: #475569; font-size: 0.95rem; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.gasto-total { display: flex; justify-content: space-between; background: #eff6ff; padding: 10px; border-radius: 6px; font-size: 0.9rem; color: #1e293b; }
.text-blue { color: #2563eb; font-size: 1.1rem; }
.font-mono { font-family: monospace; }

.tarjeta-footer { padding: 10px 15px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; background: #fafafa; }
.btn-editar { flex: 1; background: white; border: 1px solid #cbd5e1; color: #334155; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-editar:hover { background: #f1f5f9; }
.btn-eliminar { flex: 1; background: #fee2e2; border: 1px solid #fca5a5; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-eliminar:hover { background: #fecaca; }

/* REUTILIZANDO ESTILOS DE TUS MODALES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; box-sizing: border-box; }
.modal-content { background: white; padding: 30px; border-radius: 15px; width: 100%; max-width: 650px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 85vh; overflow-y: auto; }
.modal-content h2 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }

.form-plan .input-group { margin-bottom: 15px; }
.form-plan .input-row { display: flex; gap: 15px; }
.form-plan label { display: block; margin-bottom: 5px; color: #475569; font-weight: 600; font-size: 0.9rem; }
.form-plan input, .form-plan select, .form-plan textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; box-sizing: border-box; background: white; }
.input-prefix { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: white; }
.input-prefix span { background: #f1f5f9; padding: 10px; color: #475569; font-weight: bold; border-right: 1px solid #cbd5e1; }
.input-prefix input { border: none !important; border-radius: 0 !important; width: 100%; outline: none; }

.titulo-separador { margin-top: 15px; margin-bottom: 10px; color: #1e293b; border-bottom: 2px dashed #e2e8f0; padding-bottom: 5px; font-size: 1.1rem; }
.btn-toggle-desc { background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; padding: 8px 15px; border-radius: 20px; margin-bottom: 15px; }
.input-desc-opcional { margin-top: -3px; width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid #cbd5e1; border-top: 1px dashed #94a3b8; border-radius: 0 0 6px 6px; background: #f1f5f9; box-sizing: border-box; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-guardar { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>