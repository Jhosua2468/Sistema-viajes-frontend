<template>
  <div v-if="destino" class="detalle-container">
    <NavbarGlobal />
    <div class="hero-section" :style="{ backgroundImage: `url(${obtenerPortada(destino)})` }">
      <div class="hero-overlay">
        <h1>{{ destino.nombre }}</h1>
        <div class="badges-hero">
          <span class="badge-dep">📍 {{ destino.departamento?.nombre }}</span>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <button @click="router.back()" class="btn-volver">← Volver al catálogo</button>

      <div class="info-grid">
        <div class="main-info">
          <section class="info-section">
            <h2>Acerca del destino</h2>
            <p class="descripcion">{{ destino.descripcion_general }}</p>
          </section>

          <section v-if="destino.mesesIdeales?.length > 0" class="meses-section">
            <h3>📅 Mejor época para visitar:</h3>
            <div class="tags-container">
              <span v-for="mes in destino.mesesIdeales" :key="mes.id_mes" class="tag-mes">
                {{ mes.nombre }}
              </span>
            </div>
          </section>
        </div>
      </div>

      <section v-if="destino.imagenes?.length > 1" class="gallery-section">
        <h2>📸 Galería del Destino</h2>
        <div class="carousel-container">
          <img v-for="img in destino.imagenes" :key="img.id_img" :src="procesarUrlImagen(img.url)" class="carousel-img" />
        </div>
      </section>

      <section v-if="destino.atractivos?.length > 0" class="atractivos-section">
        <h2>✨ Atractivos Principales</h2>
        <div class="atractivos-list">
          <div v-for="atractivo in destino.atractivos" :key="atractivo.id_at" class="atractivo-card">
            <div class="atractivo-content">
              <h3>{{ atractivo.nombre }}</h3>
              <p>{{ atractivo.descripcion }}</p>
            </div>
            
            <div v-if="atractivo.imagenes?.length > 0" class="atractivo-carousel">
              <img v-for="imgA in atractivo.imagenes" :key="imgA.id_img" :src="procesarUrlImagen(imgA.url)" alt="foto atractivo" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="destino.experiencias?.length > 0" class="experiencias-section">
        <h2>🎒 Experiencias de Viajeros</h2>
        <div class="experiencias-grid">
          <div v-for="exp in destino.experiencias" :key="exp.id_exp" class="experiencia-card">
            <div class="exp-header">
              <span class="exp-autor">👤 {{ exp.usuario?.nombre || 'Viajero anónimo' }}</span>
              <span class="exp-fecha">📅 {{ exp.fecha_viaje }}</span>
            </div>
            <p class="exp-texto">"{{ exp.resumen_experiencia }}"</p>
            <img v-if="exp.url_foto" :src="procesarUrlImagen(exp.url_foto)" class="exp-foto" />
          </div>
        </div>
      </section>

    </div>
  </div>
  <div v-else class="loading">Cargando detalles increíbles...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiViajes from '../api/axios'
import NavbarGlobal from '../components/NavbarGlobal.vue'

const route = useRoute()
const router = useRouter()
const destino = ref(null)

const procesarUrlImagen = (url) => {
  if (!url) return 'https://via.placeholder.com/1200x500?text=Sin+Imagen'
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const obtenerPortada = (dest) => {
  if (dest.imagenes && dest.imagenes.length > 0) return procesarUrlImagen(dest.imagenes[0].url)
  return 'https://via.placeholder.com/1200x500?text=Sin+Imagen'
}

const cargarDetalle = async () => {
  try {
    const respuesta = await apiViajes.get(`/destinos/detalle/${route.params.id}`)
    destino.value = respuesta.data
  } catch (error) {
    console.error("Error completo:", error)
    const mensajeReal = error.response?.data?.message || error.message || "Error desconocido";
    alert(`🚨 ERROR DEL BACKEND:\n${mensajeReal}`);
  }
}

onMounted(() => {
  cargarDetalle()
})
</script>

<style scoped>
.detalle-container { font-family: 'Segoe UI', sans-serif; background: #f8fafc; min-height: 100vh; padding-bottom: 50px; }
.hero-section { height: 450px; background-size: cover; background-position: center; position: relative; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); display: flex; flex-direction: column; justify-content: flex-end; padding: 40px 10%; color: white; }
.hero-overlay h1 { font-size: 3.5rem; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.badges-hero { display: flex; gap: 10px; margin-top: 15px; }
.badge-dep { background: #3b82f6; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 1.1rem; }

.content-wrapper { max-width: 1100px; margin: -40px auto 0; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); position: relative; z-index: 10; }
.btn-volver { background: none; border: none; color: #64748b; cursor: pointer; font-size: 1rem; margin-bottom: 20px; font-weight: bold; }
.btn-volver:hover { color: #3b82f6; text-decoration: underline; }

.info-section h2, .gallery-section h2, .atractivos-section h2, .experiencias-section h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
.descripcion { font-size: 1.15rem; line-height: 1.7; color: #475569; }

.meses-section { background: #f1f5f9; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 5px solid #10b981; }
.meses-section h3 { margin: 0 0 15px 0; color: #0f172a; font-size: 1.1rem; }
.tags-container { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-mes { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

.carousel-container { display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px; scroll-snap-type: x mandatory; }
.carousel-container::-webkit-scrollbar { height: 8px; }
.carousel-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.carousel-img { flex: 0 0 300px; height: 200px; object-fit: cover; border-radius: 10px; scroll-snap-align: start; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

.atractivos-list { display: flex; flex-direction: column; gap: 20px; }
.atractivo-card { display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.atractivo-content h3 { margin: 0 0 10px 0; color: #3b82f6; }
.atractivo-content p { margin: 0 0 15px 0; color: #64748b; line-height: 1.5; }
.atractivo-carousel { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 10px; }
.atractivo-carousel::-webkit-scrollbar { height: 6px; }
.atractivo-carousel::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
.atractivo-carousel img { width: 180px; height: 120px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }

/* 🌟 ESTILOS DE LAS EXPERIENCIAS 🌟 */
.experiencias-section { margin-top: 40px; }
.experiencias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.experiencia-card { background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 12px; }
.exp-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; color: #b45309; font-weight: bold; }
.exp-autor { color: #d97706; }
.exp-texto { font-style: italic; color: #451a03; line-height: 1.5; margin-bottom: 15px; }
.exp-foto { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; }

.loading { text-align: center; padding: 100px; font-size: 1.5rem; color: #64748b; }
</style>