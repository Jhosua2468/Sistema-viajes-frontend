<template>
  <div class="layout">
    <NavbarGlobal />

    <header class="hero-search">
      <h1 class="title">Descubre tu próximo destino 🌍</h1>
      
      <div class="search-bar-container">
        <input type="text" v-model="busqueda" placeholder="🔍 Buscar lugares..." class="search-input" />
        
        <select v-model="filtroDepartamento" class="filter-select">
          <option value="">📍 Cualquier lugar</option>
          <option value="Beni">Beni</option>
          <option value="Chuquisaca">Chuquisaca</option>
          <option value="Cochabamba">Cochabamba</option>
          <option value="La Paz">La Paz</option>
          <option value="Oruro">Oruro</option>
          <option value="Pando">Pando</option>
          <option value="Potosí">Potosí</option>
          <option value="Santa Cruz">Santa Cruz</option>
          <option value="Tarija">Tarija</option>
        </select>

        <select v-model="filtroMes" class="filter-select">
          <option value="">📅 Cualquier mes</option>
          <option value="Enero">Enero</option>
          <option value="Febrero">Febrero</option>
          <option value="Marzo">Marzo</option>
          <option value="Abril">Abril</option>
          <option value="Mayo">Mayo</option>
          <option value="Junio">Junio</option>
          <option value="Julio">Julio</option>
          <option value="Agosto">Agosto</option>
          <option value="Septiembre">Septiembre</option>
          <option value="Octubre">Octubre</option>
          <option value="Noviembre">Noviembre</option>
          <option value="Diciembre">Diciembre</option>
        </select>

        <select v-model="ordenamiento" class="filter-select orden-select">
          <option value="">⇅ Ordenar por</option>
          <option value="az">Letra (A-Z)</option>
          <option value="za">Letra (Z-A)</option>
        </select>
      </div>

      <div class="tabs-container">
        <button :class="['tab-btn', { active: tabActiva === 'destinos' }]" @click="tabActiva = 'destinos'">
          ⛰️ Destinos 
          <span v-if="filtrosActivos" class="tab-count">({{ destinosFiltrados.length }})</span>
        </button>
        <button :class="['tab-btn', { active: tabActiva === 'atractivos' }]" @click="tabActiva = 'atractivos'">
          📸 Atractivos Principales
          <span v-if="filtrosActivos" class="tab-count">({{ atractivosFiltrados.length }})</span>
        </button>
      </div>
    </header>

    <main class="container">
      <div v-if="cargando" class="loading">Cargando la magia... ✨</div>

      <div v-else-if="tabActiva === 'destinos'">
        <div v-if="destinosFiltrados.length === 0" class="empty-state">No hay destinos con estos filtros.</div>
        <div v-else class="grid-destinos">
          <router-link v-for="destino in destinosFiltrados" :key="destino.id_d" :to="`/destino/${destino.id_d}`" class="card">
            <div class="card-image"><img :src="obtenerPortada(destino)" alt="Destino" /></div>
            <div class="card-content">
              <h2>{{ destino.nombre }}</h2>
              <span class="badge">{{ destino.departamento?.nombre || 'Bolivia' }}</span>
              <p class="description">{{ destino.descripcion_general?.substring(0, 80) }}...</p>
            </div>
          </router-link> 
        </div>
      </div>

      <div v-else-if="tabActiva === 'atractivos'">
        <div v-if="atractivosFiltrados.length === 0" class="empty-state">No hay atractivos con estos filtros.</div>
        <div v-else class="grid-atractivos">
          <router-link v-for="atractivo in atractivosFiltrados" :key="atractivo.id_at" :to="`/destino/${atractivo.id_destino_padre}`" class="card card-atractivo">
            <div class="card-content">
              <h3>✨ {{ atractivo.nombre }}</h3>
              <p class="ubicacion">📍 Pertenece a: <strong>{{ atractivo.nombre_destino_padre }}</strong></p>
              <p class="description">{{ atractivo.descripcion }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </main>
    <button v-if="authStore.estaAutenticado" @click="modalAporteAbierto = true" class="btn-flotante-aporte">
      💡 Contribuir a la comunidad
    </button>

    <div v-if="modalAporteAbierto" class="modal-overlay" @click.self="modalAporteAbierto = false">
      <div class="modal-content">
        <header class="modal-header">
          <h3>🌍 Sugerir un Nuevo Destino</h3>
          <button class="btn-close" @click="modalAporteAbierto = false">✖</button>
        </header>
        <div class="modal-body">
          <p style="color: #64748b; font-size: 0.9rem; margin-top: -10px; margin-bottom: 20px;">
            ¿Conoces un lugar increíble que no está en nuestro catálogo? Ayúdanos a documentarlo.
          </p>
          <form @submit.prevent="enviarAporteCompleto" class="form-edicion">
            <div class="form-group">
              <label>Nombre del Lugar:</label>
              <input type="text" v-model="formularioAporte.nombre" required placeholder="Ej: Espejillos" />
            </div>
            <div class="form-group">
              <label>Departamento:</label>
              <select v-model="formularioAporte.id_dep" required>
                <option value="1">Chuquisaca</option><option value="2">La Paz</option>
                <option value="3">Cochabamba</option><option value="4">Oruro</option>
                <option value="5">Potosí</option><option value="6">Tarija</option>
                <option value="7">Santa Cruz</option><option value="8">Beni</option>
                <option value="9">Pando</option>
              </select>
            </div>
            <div class="form-group">
              <label>Descripción y atractivos principales:</label>
              <textarea v-model="formularioAporte.descripcion" rows="4" required placeholder="Describe qué hace especial a este lugar..."></textarea>
            </div>
            <div class="form-group" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1;">
              <label>📸 Foto representativa (Opcional pero recomendada):</label>
              <input type="file" @change="capturarFotoAporte" accept="image/*" style="width: 100%; margin-top: 10px;" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="modalAporteAbierto = false">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="enviandoAporte">
                {{ enviandoAporte ? 'Enviando...' : 'Enviar Sugerencia' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="modalAgradecimientoAbierto" class="modal-overlay" @click.self="modalAgradecimientoAbierto = false">
      <div class="modal-content" style="max-width: 400px; text-align: center; padding: 40px 30px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🙌</div>
        <h2 style="margin-bottom: 15px; color: #1e293b;">¡Gracias por tu aporte!</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
          Tu sugerencia de <strong>{{ ultimoDestinoSugerido }}</strong> ha sido enviada con éxito. Nuestro equipo de administración la revisará pronto para publicarla en el catálogo oficial de la comunidad.
        </p>
        <button @click="modalAgradecimientoAbierto = false" class="btn-primary" style="width: 100%;">
          Entendido, volver al catálogo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiViajes from '../api/axios'
// 💡 IMPORTAMOS EL NUEVO NAVBAR GLOBAL
import NavbarGlobal from '../components/NavbarGlobal.vue' 
import { useAuthStore } from '../store/auth'
const authStore = useAuthStore()

const destinos = ref([])
const cargando = ref(true)

const busqueda = ref('')
const filtroDepartamento = ref('')
const filtroMes = ref('')
const ordenamiento = ref('')
const tabActiva = ref('destinos')

// 💡 Si hay algo escrito/seleccionado, mostramos los números en los Tabs
const filtrosActivos = computed(() => busqueda.value !== '' || filtroDepartamento.value !== '' || filtroMes.value !== '')

const procesarUrlImagen = (url) => {
  if (!url) return 'https://via.placeholder.com/400x250?text=Sin+Imagen'
  if (url.startsWith('http')) return url
  // === MODO LOCAL (Taller de Especialidad) ===
  //return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  
  // === MODO NUBE (Cloud de AWS) ===
  //return `http://52.54.242.122${url.startsWith('/') ? '' : '/'}${url}`;
  // === MODO NUBE (Application Load Balancer de AWS) ===
  return `https://alb-viajes-backend-1486483178.us-east-1.elb.amazonaws.com${url.startsWith('/') ? '' : '/'}${url}`;
}

const obtenerPortada = (destino) => {
  if (destino.imagenes && destino.imagenes.length > 0) return procesarUrlImagen(destino.imagenes[0].url)
  return 'https://via.placeholder.com/400x250?text=Sin+Imagen'
}

// LÓGICA DE DESTINOS
const destinosFiltrados = computed(() => {
  let resultado = destinos.value.filter(destino => {
    const txt = busqueda.value.toLowerCase()
    const matchBusqueda = destino.nombre.toLowerCase().includes(txt) || (destino.descripcion_general && destino.descripcion_general.toLowerCase().includes(txt))
    const matchDep = filtroDepartamento.value === '' || destino.departamento?.nombre === filtroDepartamento.value
    const matchMes = filtroMes.value === '' || (destino.mesesIdeales && destino.mesesIdeales.some(m => m.nombre === filtroMes.value))
    return matchBusqueda && matchDep && matchMes
  })

  // 💡 Lógica de Ordenamiento
  if (ordenamiento.value === 'az') resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
  if (ordenamiento.value === 'za') resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))

  return resultado
})

// LÓGICA DE ATRACTIVOS (Bug del mes solucionado)
const atractivosFiltrados = computed(() => {
  let lista = []
  destinos.value.forEach(d => {
    if (d.atractivos) {
      d.atractivos.forEach(a => {
        lista.push({ ...a, id_destino_padre: d.id_d, nombre_destino_padre: d.nombre, departamento_padre: d.departamento?.nombre, meses_padre: d.mesesIdeales || [] })
      })
    }
  })

  let resultado = lista.filter(a => {
    const txt = busqueda.value.toLowerCase()
    const matchBusqueda = a.nombre.toLowerCase().includes(txt) || (a.descripcion && a.descripcion.toLowerCase().includes(txt))
    const matchDep = filtroDepartamento.value === '' || a.departamento_padre === filtroDepartamento.value
    
    // 💡 Aquí arreglamos el Bug del mes para atractivos
    const matchMes = filtroMes.value === '' || a.meses_padre.some(m => m.nombre === filtroMes.value)
    
    return matchBusqueda && matchDep && matchMes
  })

  if (ordenamiento.value === 'az') resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
  if (ordenamiento.value === 'za') resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))

  return resultado
})

const obtenerDestinos = async () => {
  try {
    const respuesta = await apiViajes.get('/destinos')
    destinos.value = respuesta.data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

// Variables de estado
const modalAporteAbierto = ref(false);
const modalAgradecimientoAbierto = ref(false);
const enviandoAporte = ref(false);
const archivoAporte = ref(null);
const ultimoDestinoSugerido = ref('');

const formularioAporte = ref({
  nombre: '',
  id_dep: 1,
  descripcion: ''
});

const capturarFotoAporte = (e) => {
  archivoAporte.value = e.target.files[0];
};

const enviarAporteCompleto = async () => {
  enviandoAporte.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', formularioAporte.value.nombre);
    formData.append('descripcion_general', formularioAporte.value.descripcion);
    formData.append('id_dep', formularioAporte.value.id_dep);
    
    if (archivoAporte.value) {
      formData.append('file', archivoAporte.value);
    }

    // Cabeceras con el Token JWT
    const token = localStorage.getItem('token_acceso') || sessionStorage.getItem('token_acceso');
    await apiViajes.post('/destinos/sugerir-completo', formData, { 
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    // Cierre y transición de modales secuenciales
    ultimoDestinoSugerido.value = formularioAporte.value.nombre;
    modalAporteAbierto.value = false;
    modalAgradecimientoAbierto.value = true;

    // Limpieza
    formularioAporte.value = { nombre: '', id_dep: 1, descripcion: '' };
    archivoAporte.value = null;

  } catch (error) {
    alert("Hubo un error al enviar tu aporte. Inténtalo de nuevo.");
  } finally {
    enviandoAporte.value = false;
  }
};

onMounted(() => obtenerDestinos())
</script>

<style scoped>
.layout { 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  /* 💡 Fondo dinámico de la página entera */
  background-color: var(--bg-layout); 
  min-height: 100vh; 
}

.hero-search { 
  /* 💡 Fondo dinámico de la cabecera */
  background-color: var(--bg-card); 
  padding: 40px 20px 0; text-align: center; 
  border-bottom: 1px solid var(--color-border); 
}

.title { color: var(--text-main); margin-top: 0; margin-bottom: 30px; font-size: 2.5rem; letter-spacing: -1px; }
.search-bar-container { display: flex; justify-content: center; gap: 10px; max-width: 900px; margin: 0 auto 30px; flex-wrap: wrap; }

.search-input { 
  flex: 2; min-width: 300px; padding: 15px 20px; 
  border: 2px solid var(--color-border); border-radius: 12px; font-size: 1.1rem; outline: none; transition: all 0.3s; 
  background-color: var(--bg-card); color: var(--text-main); 
}
.search-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.filter-select { 
  flex: 1; min-width: 150px; padding: 15px; border: 2px solid var(--color-border); border-radius: 12px; font-size: 1rem; 
  color: var(--text-main); font-weight: 600; cursor: pointer; 
  background-color: var(--bg-card); outline: none; 
}
.filter-select:focus { border-color: var(--color-primary); }
.orden-select { background-color: var(--bg-header); }

.tabs-container { display: flex; justify-content: center; gap: 30px; }
.tab-btn { background: none; border: none; padding: 15px 20px; font-size: 1.1rem; font-weight: bold; color: var(--text-muted); cursor: pointer; position: relative; }
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active { color: var(--text-main); }
.tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: var(--color-primary); border-radius: 3px 3px 0 0; }
.tab-count { background: var(--bg-header); color: var(--text-muted); font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; margin-left: 5px; }

.container { max-width: 1200px; margin: 0 auto; padding: 3rem 1rem; }
.grid-destinos { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 35px; }
.grid-atractivos { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }

.card { 
  background: var(--bg-card); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
  transition: all 0.3s ease; border: 1px solid var(--color-border); display: block; text-decoration: none; 
}
.card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: var(--color-primary); }
.card-image img { width: 100%; height: 220px; object-fit: cover; border-bottom: 1px solid var(--color-border); }
.card-content { padding: 1.5rem; }
.card-content h2 { margin: 0 0 12px 0; font-size: 1.3rem; color: var(--text-main); font-weight: 800; letter-spacing: -0.5px; }
.badge { background-color: var(--bg-header); color: var(--text-muted); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.description { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-top: 15px; }

.card-atractivo { padding: 5px; border-left: 5px solid var(--color-primary); }
.card-atractivo h3 { margin: 0 0 8px 0; color: var(--text-main); font-size: 1.2rem; }
.ubicacion { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 10px 0; background: var(--bg-header); padding: 6px; border-radius: 4px; }

.loading, .empty-state { text-align: center; padding: 60px 20px; font-size: 1.2rem; color: var(--text-muted); background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--color-border); }

.btn-flotante-aporte {
  position: fixed; bottom: 30px; right: 30px;
  background-color: var(--color-primary); color: white; border: none; padding: 15px 25px; border-radius: 50px; font-size: 1rem; font-weight: bold;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); cursor: pointer; z-index: 900; transition: transform 0.3s ease, background-color 0.3s;
}
.btn-flotante-aporte:hover { transform: translateY(-5px); opacity: 0.9; }

/* MODALES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; box-sizing: border-box; backdrop-filter: blur(3px); }
.modal-content { background: var(--bg-card); padding: 30px; border-radius: 15px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--color-border); padding-bottom: 10px; }
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.2rem; }
.btn-close { background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer; }
.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; font-size: 0.9rem; font-weight: bold; color: var(--text-main); margin-bottom: 5px; }
.form-group input[type="text"], .form-group select, .form-group textarea {
  width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 1rem; box-sizing: border-box;
  background-color: var(--bg-card); color: var(--text-main);
}
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-secondary { background: var(--bg-header); color: var(--text-muted); border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
</style>