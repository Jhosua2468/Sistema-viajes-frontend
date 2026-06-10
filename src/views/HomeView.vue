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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiViajes from '../api/axios'
// 💡 IMPORTAMOS EL NUEVO NAVBAR GLOBAL
import NavbarGlobal from '../components/NavbarGlobal.vue' 

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
  // return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  
  // === MODO NUBE (Cloud de AWS) ===
  return `http://52.54.242.122${url.startsWith('/') ? '' : '/'}${url}`;
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

onMounted(() => obtenerDestinos())
</script>

<style scoped>
/* Como pasamos el Navbar al componente, este archivo queda mucho más limpio de CSS */
.layout { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; min-height: 100vh; }
.hero-search { background: white; padding: 40px 20px 0; text-align: center; border-bottom: 1px solid #e2e8f0; }
.title { color: #0f172a; margin-top: 0; margin-bottom: 30px; font-size: 2.5rem; letter-spacing: -1px; }
.search-bar-container { display: flex; justify-content: center; gap: 10px; max-width: 900px; margin: 0 auto 30px; flex-wrap: wrap; }
.search-input { flex: 2; min-width: 300px; padding: 15px 20px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1.1rem; outline: none; transition: all 0.3s; color: #334155; }
.search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
.filter-select { flex: 1; min-width: 150px; padding: 15px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; color: #475569; font-weight: 600; cursor: pointer; background-color: white; outline: none; }
.filter-select:focus { border-color: #3b82f6; }
.orden-select { background-color: #f8fafc; } /* Para que resalte un poco */

.tabs-container { display: flex; justify-content: center; gap: 30px; }
.tab-btn { background: none; border: none; padding: 15px 20px; font-size: 1.1rem; font-weight: bold; color: #94a3b8; cursor: pointer; position: relative; }
.tab-btn:hover { color: #475569; }
.tab-btn.active { color: #0f172a; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #3b82f6; border-radius: 3px 3px 0 0; }
.tab-count { background: #e2e8f0; color: #475569; font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; margin-left: 5px; }

.container { max-width: 1200px; margin: 0 auto; padding: 3rem 1rem; }
.grid-destinos { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 35px; }
.grid-atractivos { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }

.card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s ease; border: 1px solid #f1f5f9; display: block; text-decoration: none; }
.card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: #e2e8f0; }
.card-image img { width: 100%; height: 220px; object-fit: cover; border-bottom: 1px solid #f1f5f9; }
.card-content { padding: 1.5rem; }
.card-content h2 { margin: 0 0 12px 0; font-size: 1.3rem; color: #1e293b; font-weight: 800; letter-spacing: -0.5px; }
.badge { background-color: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.description { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-top: 15px; }

.card-atractivo { padding: 5px; border-left: 5px solid #3b82f6; }
.card-atractivo h3 { margin: 0 0 8px 0; color: #0f172a; font-size: 1.2rem; }
.ubicacion { font-size: 0.85rem; color: #64748b; margin: 0 0 10px 0; background: #f8fafc; padding: 6px; border-radius: 4px; }

.loading, .empty-state { text-align: center; padding: 60px 20px; font-size: 1.2rem; color: #64748b; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
</style>