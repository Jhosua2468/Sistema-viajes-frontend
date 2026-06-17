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

      <section class="atractivos-section">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px;">
          <h2 style="border: none; padding: 0; margin: 0;">✨ Atractivos Principales</h2>
          <button v-if="authStore.estaAutenticado" @click="modalSugerirAtractivo = true" class="btn-sugerir-atractivo">
            + Sugerir un lugar aquí
          </button>
        </div>

        <div v-if="destino.atractivos?.length > 0" class="atractivos-list">
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
        <div v-else style="padding: 20px; background: #f1f5f9; border-radius: 8px; text-align: center; color: #64748b;">
          Aún no hay atractivos registrados. ¡Sé el primero en sugerir uno!
        </div>
      </section>

      <section v-if="destino.experiencias?.length > 0" class="experiencias-section">
        <h2>🎒 Lo que dicen los viajeros</h2>
        <div class="experiencias-grid">
          <div v-for="exp in destino.experiencias" :key="exp.id_exp" class="experiencia-card">
            <div class="exp-header">
              <div class="exp-user-info">
                <span class="exp-avatar">👤</span>
                <div>
                  <strong>{{ exp.usuario?.nombre || 'Viajero de la comunidad' }}</strong>
                  <div class="exp-estrellas">
                    <span v-for="n in (exp.valoraciones?.[0]?.puntuacion || 5)" :key="n">⭐</span>
                  </div>
                </div>
              </div>
              <span class="exp-fecha">{{ exp.fecha_viaje }}</span>
            </div>
            <div class="exp-body">
              <p class="exp-texto">"{{ exp.resumen_experiencia }}"</p>
            </div>
            <div class="exp-footer">
              <div class="exp-gasto">
                <span>Gasto reportado ({{ exp.dias_estadia || 1 }} días):</span>
                <strong>Bs. {{ exp.costos?.reduce((sum, c) => sum + Number(c.monto), 0).toFixed(2) || '0.00' }}</strong>
              </div>
              <button class="btn-comentar" @click="abrirComentarios(exp)">
                💬 Comentarios ({{ exp.comentarios?.length || 0 }})
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="modalComentariosAbierto" class="modal-overlay" @click.self="cerrarComentarios">
      <div class="modal-content modal-comentarios">
        <header class="modal-header">
          <h3>💬 Conversación</h3>
          <button class="btn-close" @click="cerrarComentarios">✖</button>
        </header>

        <div class="comentarios-lista">
          <div v-if="experienciaActiva?.comentarios?.length === 0" class="empty-comentarios">
            No hay comentarios aún. ¡Sé el primero en aportar!
          </div>

          <div v-for="comentario in comentariosOrdenados" :key="comentario.id_c" 
               class="comentario-item" 
               :class="{ 'es-respuesta': comentario.comentarioPadre }">
            <div class="comentario-header">
              <strong>👤 {{ comentario.usuario?.nombre || 'Usuario Eliminado' }}</strong>
              <span class="comentario-fecha">{{ formatearFecha(comentario.fecha_comentario) }}</span>
            </div>
            <p class="comentario-texto">
              <span v-if="comentario.comentarioPadre" style="color: #3b82f6; font-size: 0.8rem; font-weight: bold; margin-right: 5px;">
                ↳ Respuesta:
              </span>
              {{ comentario.mensaje }}
            </p>

            <div class="comentario-acciones">
              <button @click="darLike(comentario.id_c)" class="btn-accion-mini">❤️ {{ comentario.likes || 0 }}</button>
              <button @click="prepararRespuesta(comentario)" class="btn-accion-mini">↩️ Responder</button>
              <button v-if="esMiComentarioOAdmin(comentario)" @click="borrarComentario(comentario.id_c)" class="btn-accion-mini texto-rojo">🗑️ Borrar</button>
            </div>
          </div>
        </div>

        <div class="comentarios-input-area" v-if="authStore.estaAutenticado">
          <div v-if="respondiendoA" class="respuesta-badge">
            Respondiendo a: <strong>{{ respondiendoA.usuario?.nombre }}</strong>
            <button @click="respondiendoA = null" class="btn-cancelar-resp">✖</button>
          </div>
          <form @submit.prevent="enviarComentario" style="display:flex; gap: 10px; margin-top: 10px;">
            <input type="text" v-model="nuevoComentarioTexto" placeholder="Escribe un comentario..." required class="input-comentario" />
            <button type="submit" class="btn-enviar-comentario">Enviar</button>
          </form>
        </div>
        <div v-else class="comentarios-input-area auth-aviso">
          <p>Para unirte a la conversación debes <router-link to="/login" style="color: #3b82f6;">iniciar sesión</router-link>.</p>
        </div>
      </div>
    </div>

    <div v-if="modalSugerirAtractivo" class="modal-overlay" @click.self="modalSugerirAtractivo = false">
      <div class="modal-content">
        <header class="modal-header">
          <h3>✨ Sugerir un Atractivo</h3>
          <button class="btn-close" @click="modalSugerirAtractivo = false">✖</button>
        </header>
        <div class="modal-body">
          <p style="color: #64748b; font-size: 0.9rem; margin-top: -10px; margin-bottom: 20px;">
            Añade un lugar turístico, parque, museo o actividad imperdible dentro de <strong>{{ destino.nombre }}</strong>.
          </p>
          <form @submit.prevent="enviarSugerenciaAtractivo" class="form-edicion">
            <div class="form-group">
              <label>Nombre del Atractivo:</label>
              <input type="text" v-model="formAtractivo.nombre" required placeholder="Ej: Mirador de la ciudad" />
            </div>
            <div class="form-group">
              <label>Descripción detallada:</label>
              <textarea v-model="formAtractivo.descripcion" rows="4" required placeholder="¿Por qué los viajeros deberían visitarlo?"></textarea>
            </div>
            <div class="form-group" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1;">
              <label>📸 Foto representativa (Opcional):</label>
              <input type="file" @change="capturarFotoAtractivo" accept="image/*" style="width: 100%; margin-top: 10px;" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="modalSugerirAtractivo = false">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="enviandoSugerencia">
                {{ enviandoSugerencia ? 'Enviando...' : 'Enviar Sugerencia' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="modalAgradecimiento" class="modal-overlay" @click.self="modalAgradecimiento = false">
      <div class="modal-content" style="max-width: 400px; text-align: center; padding: 40px 30px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🙌</div>
        <h2 style="margin-bottom: 15px; color: #1e293b;">¡Gracias por tu aporte!</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
          Tu sugerencia ha sido enviada con éxito. Nuestro equipo la revisará pronto para sumarla a los atractivos de <strong>{{ destino.nombre }}</strong>.
        </p>
        <button @click="modalAgradecimiento = false" class="btn-primary" style="width: 100%;">
          Entendido
        </button>
      </div>
    </div>

  </div>
  <div v-else class="loading">Cargando detalles increíbles...</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiViajes from '../api/axios'
import NavbarGlobal from '../components/NavbarGlobal.vue'
import { useAuthStore } from '../store/auth' 

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() 
const destino = ref(null)

// Variables Modales Comentarios
const modalComentariosAbierto = ref(false)
const experienciaActiva = ref(null)
const nuevoComentarioTexto = ref('')
const respondiendoA = ref(null)

// 💡 VARIABLES PARA SUGERIR ATRACTIVO
const modalSugerirAtractivo = ref(false);
const modalAgradecimiento = ref(false);
const enviandoSugerencia = ref(false);
const archivoAtractivo = ref(null);
const formAtractivo = ref({ nombre: '', descripcion: '' });

const procesarUrlImagen = (url) => {
  if (!url) return 'https://via.placeholder.com/1200x500?text=Sin+Imagen'
  if (url.startsWith('http')) return url
  //return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;

  // === MODO NUBE (Cloud de AWS) ===
  //return `http://52.54.242.122${url.startsWith('/') ? '' : '/'}${url}`;
  // === MODO NUBE (Application Load Balancer de AWS) ===
  return `https://alb-viajes-backend-1486483178.us-east-1.elb.amazonaws.com${url.startsWith('/') ? '' : '/'}${url}`;
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
    console.error("Error al cargar detalle", error)
  }
}

// 💡 FUNCIÓN: SUGERIR ATRACTIVO
const capturarFotoAtractivo = (e) => { archivoAtractivo.value = e.target.files[0] }

const enviarSugerenciaAtractivo = async () => {
  enviandoSugerencia.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', formAtractivo.value.nombre);
    formData.append('descripcion', formAtractivo.value.descripcion);
    formData.append('id_destino', destino.value.id_d); // Se vincula solo al destino actual
    if (archivoAtractivo.value) formData.append('file', archivoAtractivo.value);

    const token = localStorage.getItem('token_acceso') || sessionStorage.getItem('token_acceso');
    await apiViajes.post('/destinos/atractivos/sugerir-completo', formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
    });

    modalSugerirAtractivo.value = false;
    modalAgradecimiento.value = true;
    formAtractivo.value = { nombre: '', descripcion: '' };
    archivoAtractivo.value = null;
  } catch (error) {
    alert("Hubo un error al enviar tu aporte.");
  } finally {
    enviandoSugerencia.value = false;
  }
}

// LÓGICA DE COMENTARIOS
const abrirComentarios = (exp) => { experienciaActiva.value = exp; modalComentariosAbierto.value = true; }
const cerrarComentarios = () => { modalComentariosAbierto.value = false; experienciaActiva.value = null; nuevoComentarioTexto.value = ''; respondiendoA.value = null; }

const comentariosOrdenados = computed(() => {
  if (!experienciaActiva.value?.comentarios) return [];
  return [...experienciaActiva.value.comentarios].sort((a, b) => new Date(a.fecha_comentario) - new Date(b.fecha_comentario));
});

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const date = new Date(fechaStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

const esMiComentarioOAdmin = (comentario) => {
  if (!authStore.estaAutenticado) return false;
  return comentario.usuario?.id_u === authStore.usuario?.id_u || authStore.usuario?.rol === 'admin';
}

const prepararRespuesta = (comentario) => { respondiendoA.value = comentario; }

const enviarComentario = async () => {
  try {
    const payload = {
      id_usuario: authStore.usuario.id_u,
      mensaje: nuevoComentarioTexto.value,
      id_respuesta_a: respondiendoA.value ? respondiendoA.value.id_c : null
    };
    await apiViajes.post(`/experiencias/${experienciaActiva.value.id_exp}/comentarios`, payload);
    await cargarDetalle(); 
    const expActualizada = destino.value.experiencias.find(e => e.id_exp === experienciaActiva.value.id_exp);
    if(expActualizada) experienciaActiva.value = expActualizada;
    nuevoComentarioTexto.value = ''; respondiendoA.value = null;
  } catch (error) { alert("Error al enviar el comentario."); }
}

const darLike = async (idC) => {
  try {
    await apiViajes.patch(`/experiencias/comentarios/${idC}/like`);
    await cargarDetalle();
    const expActualizada = destino.value.experiencias.find(e => e.id_exp === experienciaActiva.value.id_exp);
    if(expActualizada) experienciaActiva.value = expActualizada;
  } catch (error) { console.error("Error al dar like"); }
}

const borrarComentario = async (idC) => {
  if (confirm("¿Estás seguro de eliminar este comentario?")) {
    try {
      await apiViajes.delete(`/experiencias/comentarios/${idC}`);
      await cargarDetalle();
      const expActualizada = destino.value.experiencias.find(e => e.id_exp === experienciaActiva.value.id_exp);
      if(expActualizada) experienciaActiva.value = expActualizada;
    } catch (error) { alert("Error al borrar el comentario."); }
  }
}

onMounted(() => {
  cargarDetalle()
})
</script>

<style scoped>
/* 💡 FONDOS Y LAYOUT PRINCIPAL */
.detalle-container { font-family: 'Segoe UI', sans-serif; background: var(--bg-layout); min-height: 100vh; padding-bottom: 50px; }

/* 💡 HERO SECTION (La portada se mantiene igual para que resalte la foto) */
.hero-section { height: 450px; background-size: cover; background-position: center; position: relative; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); display: flex; flex-direction: column; justify-content: flex-end; padding: 40px 10%; color: white; }
.hero-overlay h1 { font-size: 3.5rem; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); color: #ffffff; }
.badges-hero { display: flex; gap: 10px; margin-top: 15px; }
.badge-dep { background: var(--color-primary); padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 1.1rem; color: #ffffff; }

/* 💡 CONTENEDOR CENTRAL */
.content-wrapper { max-width: 1100px; margin: -40px auto 0; background: var(--bg-card); padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); position: relative; z-index: 10; border: 1px solid var(--color-border); }

/* 💡 BOTONES Y TÍTULOS */
.btn-volver { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; margin-bottom: 20px; font-weight: bold; transition: color 0.2s; }
.btn-volver:hover { color: var(--color-primary); text-decoration: underline; }

.info-section h2, .gallery-section h2, .experiencias-section h2, .atractivos-section h2 { color: var(--text-main); border-bottom: 2px solid var(--color-border); padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
.descripcion { font-size: 1.15rem; line-height: 1.7; color: var(--text-muted); }

/* 💡 SECCIÓN DE MESES */
.meses-section { background: var(--bg-header); padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 5px solid var(--color-success); }
.meses-section h3 { margin: 0 0 15px 0; color: var(--text-main); font-size: 1.1rem; }
.tags-container { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-mes { background: var(--color-success); color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

/* 💡 CARRUSEL DE IMÁGENES */
.carousel-container { display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px; scroll-snap-type: x mandatory; }
.carousel-container::-webkit-scrollbar { height: 8px; }
.carousel-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
.carousel-img { flex: 0 0 300px; height: 200px; object-fit: cover; border-radius: 10px; scroll-snap-align: start; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

/* 💡 BOTÓN SUGERIR ATRACTIVO */
.btn-sugerir-atractivo { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); border: 1px dashed var(--color-primary); padding: 8px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.btn-sugerir-atractivo:hover { background: rgba(59, 130, 246, 0.2); }

/* 💡 LISTA DE ATRACTIVOS */
.atractivos-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 15px; }
.atractivo-card { background: var(--bg-layout); border: 1px solid var(--color-border); border-radius: 10px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.atractivo-content h3 { margin: 0 0 10px 0; color: var(--color-primary); }
.atractivo-content p { margin: 0 0 15px 0; color: var(--text-muted); line-height: 1.5; }
.atractivo-carousel { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 10px; }
.atractivo-carousel::-webkit-scrollbar { height: 6px; }
.atractivo-carousel::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
.atractivo-carousel img { width: 180px; height: 120px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }

/* 💡 EXPERIENCIAS DE VIAJEROS */
.experiencias-section { margin-top: 40px; }
.experiencias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

.experiencia-card { background: var(--bg-card); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; overflow: hidden; transition: transform 0.2s; }
.experiencia-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.05); border-color: var(--color-primary); }

.exp-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px; border-bottom: 1px solid var(--color-border); background: var(--bg-header); }
.exp-user-info { display: flex; align-items: center; gap: 10px; }
.exp-avatar { font-size: 1.5rem; background: var(--color-border); color: var(--text-main); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.exp-user-info strong { color: var(--text-main); font-size: 0.95rem; display: block; }
.exp-estrellas { font-size: 0.8rem; margin-top: 2px; }
.exp-fecha { font-size: 0.8rem; color: var(--text-muted); font-weight: bold; }

.exp-body { padding: 15px; flex-grow: 1; }
.exp-texto { font-style: italic; color: var(--text-muted); line-height: 1.6; margin: 0; font-size: 0.95rem; }

.exp-footer { padding: 12px 15px; background: var(--bg-header); border-top: 1px dashed var(--color-border); display: flex; flex-direction: column; gap: 10px; }
.exp-gasto { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); }
.exp-gasto strong { color: var(--color-primary); font-family: monospace; font-size: 1rem; }
.btn-comentar { width: 100%; background: var(--bg-card); border: 1px solid var(--color-border); padding: 6px; border-radius: 6px; color: var(--text-muted); font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-comentar:hover { background: var(--bg-layout); color: var(--text-main); border-color: var(--text-main); }

/* 💡 MODALES GLOBALES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; box-sizing: border-box; backdrop-filter: blur(3px); }
.modal-content { background: var(--bg-card); padding: 30px; border-radius: 15px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); border: 1px solid var(--color-border); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--color-border); padding-bottom: 10px; }
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.2rem; }
.btn-close { background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
.btn-close:hover { color: var(--color-danger); }

/* 💡 FORMULARIO DENTRO DE MODALES */
.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; font-size: 0.9rem; font-weight: bold; color: var(--text-main); margin-bottom: 5px; }
.form-group input[type="text"], .form-group textarea { width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 1rem; box-sizing: border-box; background: var(--bg-layout); color: var(--text-main); }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--color-primary); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-secondary { background: var(--bg-header); color: var(--text-muted); border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;}
.btn-secondary:hover { opacity: 0.8; }
.btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* 💡 MODAL DE COMENTARIOS ESPECÍFICO */
.modal-comentarios { max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; padding: 0; }
.modal-comentarios .modal-header { padding: 15px 20px; margin: 0; border-radius: 15px 15px 0 0; background: var(--bg-header); border-bottom: 1px solid var(--color-border); }
.comentarios-lista { padding: 20px; overflow-y: auto; flex-grow: 1; background: var(--bg-layout); display: flex; flex-direction: column; gap: 15px; }
.empty-comentarios { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 20px; }

.comentario-item { background: var(--bg-card); border: 1px solid var(--color-border); border-radius: 10px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.comentario-item.es-respuesta { margin-left: 30px; border-left: 4px solid var(--color-primary); }
.comentario-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.comentario-header strong { font-size: 0.9rem; color: var(--text-main); }
.comentario-fecha { font-size: 0.75rem; color: var(--text-muted); }
.comentario-texto { margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; }
.comentario-acciones { display: flex; gap: 10px; border-top: 1px dashed var(--color-border); padding-top: 8px; }

.btn-accion-mini { background: none; border: none; color: var(--text-muted); font-size: 0.8rem; font-weight: bold; cursor: pointer; padding: 0; transition: color 0.2s; }
.btn-accion-mini:hover { color: var(--color-primary); }
.texto-rojo { color: var(--color-danger) !important; }
.texto-rojo:hover { opacity: 0.8; }

.comentarios-input-area { padding: 20px; background: var(--bg-card); border-top: 1px solid var(--color-border); }
.auth-aviso { text-align: center; font-size: 0.9rem; color: var(--text-muted); font-weight: bold; }
.respuesta-badge { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; display: inline-flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; border: 1px solid rgba(59, 130, 246, 0.2); }
.btn-cancelar-resp { background: none; border: none; color: var(--color-primary); cursor: pointer; font-weight: bold; }

.input-comentario { flex-grow: 1; padding: 10px; border: 1px solid var(--color-border); border-radius: 8px; outline: none; background: var(--bg-layout); color: var(--text-main); }
.input-comentario:focus { border-color: var(--color-primary); }
.btn-enviar-comentario { background: var(--color-primary); color: white; border: none; padding: 0 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
.btn-enviar-comentario:hover { opacity: 0.9; }

.loading { text-align: center; padding: 100px; font-size: 1.5rem; color: var(--text-muted); }
</style>