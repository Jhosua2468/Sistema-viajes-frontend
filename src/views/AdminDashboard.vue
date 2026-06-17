<template>
  <div class="dashboard-layout">
    
    <aside class="sidebar">
      <div class="brand">✈️ AdminPanel</div>
      <nav class="menu">
        <button @click="vistaActiva = 'destinos'" :class="{ active: vistaActiva === 'destinos' }">🗺️ Destinos Visual</button>
        <button @click="vistaActiva = 'atractivos'" :class="{ active: vistaActiva === 'atractivos' }">✨ Atractivos</button>
        <button @click="vistaActiva = 'usuarios'" :class="{ active: vistaActiva === 'usuarios' }">👥 Usuarios</button>
        <button @click="vistaActiva = 'experiencias'" :class="{ active: vistaActiva === 'experiencias' }">🛡️ Gestión Experiencias</button>
        <button @click="vistaActiva = 'perfil'" :class="{ active: vistaActiva === 'perfil' }">👤 Mi Perfil</button>  
        <hr style="border-color: #334155; margin: 10px 0;">
        
      </nav>
      <button class="btn-logout" @click="cerrarSesion">🚪 Cerrar Sesión</button>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div>
          <h2 style="margin: 0; color: var(--text-main);">Hola, {{ authStore.usuario?.nombre }}</h2>
          <span class="badge-admin" style="margin-top: 5px; display: inline-block;">Modo Administrador</span>
        </div>
        
        <div style="display: flex; gap: 15px; align-items: center;">
          <button @click="router.push('/')" class="btn-catalogo">
            🌍 Ver Catálogo Público
          </button>
          
          <button @click="toggleTema" class="btn-tema" :title="modoOscuro ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'">
            {{ modoOscuro ? '☀️' : '🌙' }}
          </button>

          <button @click="sincronizarTodo" class="btn-refresh" :class="{'girando': actualizando}">
            🔄 {{ actualizando ? 'Actualizando...' : 'Sincronizar Datos' }}
          </button>
        </div>
      </header>

      <section v-if="vistaActiva === 'destinos'" class="content-section">
        <div class="section-header">
          <h3>Gestión Visual de Destinos</h3>
          <button class="btn-primary" @click="mostrarModalCrearDestino = true">➕ Crear Nuevo Destino</button>
        </div>

        <div class="grid-admin">
          <div v-for="destino in destinos" :key="destino.id_d" class="admin-card">
            <div class="card-image-wrapper">
              <img :src="obtenerPortada(destino)" alt="foto" />
              <div class="admin-controls-overlay">
                <button title="Gestionar Fotos" @click="abrirModalFotos(destino, 'destino')">🖼️ Fotos</button>
                <button title="Editar" @click="editarDestino(destino)">✏️ Editar</button>
                <button title="Eliminar" class="btn-danger-icon" @click="eliminarDestino(destino.id_d)">🗑️</button>
              </div>
            </div>
            <div class="card-info">
              <div>
                <h4>{{ destino.nombre }}</h4>
                <p class="desc-text">{{ destino.descripcion_general?.substring(0, 50) }}...</p>
              </div>
              <span :class="['badge-estado', destino.estado]">{{ destino.estado }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="vistaActiva === 'atractivos'" class="content-section">
        <div class="section-header">
          <h3>Gestión de Atractivos</h3>
          <button class="btn-primary" @click="mostrarModalCrearAtractivo = true">➕ Crear Nuevo Atractivo</button>
        </div>

        <div class="grid-admin">
          <div v-for="atractivo in atractivos" :key="atractivo.id_at" class="admin-card">
            <div class="card-image-wrapper">
              <img :src="obtenerPortada(atractivo)" alt="foto" />
              <div class="admin-controls-overlay">
                <button title="Gestionar Fotos" @click="abrirModalFotos(atractivo, 'atractivo')">🖼️ Fotos</button>
                <button title="Editar" @click="editarAtractivo(atractivo)">✏️ Editar</button>
                <button title="Eliminar" class="btn-danger-icon" @click="eliminarAtractivo(atractivo.id_at)">🗑️</button>
              </div>
            </div>
            <div class="card-info">
              <div>
                <h4>{{ atractivo.nombre }}</h4>
                <p class="desc-text">{{ atractivo.descripcion?.substring(0, 50) }}...</p>
                <p class="loc-text">📍 {{ atractivo.destino?.nombre }}</p>
              </div>
              <span :class="['badge-estado', atractivo.estado]">{{ atractivo.estado }}</span>
            </div>
          </div>
        </div>
      </section>
      
      <section v-if="vistaActiva === 'usuarios'" class="content-section">
        <div class="section-header">
          <div>
            <h2>👥 Gestión de Usuarios</h2>
            <p>Administra las cuentas registradas en la plataforma y verifica sus roles.</p>
          </div>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="text-center">ID</th>
                <th>Nombre de Usuario</th>
                <th>Correo Electrónico</th>
                <th class="text-center">Rol del Sistema</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in listaUsuarios" :key="user.id_u">
                <td class="text-center font-mono">{{ user.id_u }}</td>
                <td><strong>{{ user.nombre }}</strong></td>
                <td>{{ user.email }}</td>
                <td class="text-center">
                  <span :class="user.rol === 'admin' ? 'badge-admin' : 'badge-user'">
                    {{ user.rol === 'admin' ? 'Administrador' : 'Viajero' }}
                  </span>
                </td>
                <td style="display: flex; gap: 8px; justify-content: center;">
                  <button v-if="user.rol === 'usuario'" @click="cambiarRolUsuario(user.id_u, 'admin')" class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" title="Hacer Administrador">👑 Promover</button>
                  <button v-else-if="user.rol === 'admin' && user.id_u !== authStore.usuario.id_u" @click="cambiarRolUsuario(user.id_u, 'usuario')" class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" title="Quitar permisos de Admin">👤 Degradar</button>
                  <button v-if="user.id_u !== authStore.usuario.id_u" @click="eliminarUsuario(user.id_u)" class="btn-quitar" style="padding: 6px 10px; font-size: 0.8rem;" title="Eliminar cuenta">🗑️</button>
                </td>
              </tr>
              <tr v-if="listaUsuarios.length === 0">
                <td colspan="5" class="text-center" style="padding: 30px; color: #64748b;">No hay usuarios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="vistaActiva === 'experiencias'" class="content-section">
        <div class="section-header">
          <div>
            <h2>🛡️ Gestión de Experiencias</h2>
            <p>Supervisa las publicaciones de los viajeros y elimina datos anómalos.</p>
          </div>
          <div style="background: white; padding: 10px 15px; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 10px;">
            <label style="font-weight: bold; color: #475569;">Filtro:</label>
            <select v-model="filtroDestinoAdmin" style="padding: 5px; border-radius: 4px; border: 1px solid #cbd5e1;">
              <option value="">🌍 Todos los destinos</option>
              <option v-for="dest in destinos" :key="dest.id_d" :value="dest.nombre">{{ dest.nombre }}</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Viajero</th>
                <th>Destino</th>
                <th>Calificación</th>
                <th>Resumen (Extracto)</th>
                <th class="text-center">Gasto Reportado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="exp in experienciasFiltradas" :key="exp.id_exp">
                <td style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                  <button @click="verDesglose(exp)" class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;">🔍 Detalle</button>
                  
                  <button @click="abrirComentariosAdmin(exp)" class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem; background: #e0e7ff; color: #1d4ed8; border-color: #bfdbfe;">
                    💬 ({{ exp.comentarios?.length || 0 }})
                  </button>

                  <button @click="eliminarExperiencia(exp.id_exp)" class="btn-quitar" style="padding: 6px 10px; font-size: 0.8rem;" title="Eliminar">🗑️</button>
                </td>
                <td><span class="badge-blue">{{ exp.destino?.nombre }}</span></td>
                <td><span style="color: #f59e0b; font-weight: bold;">⭐ {{ exp.valoraciones?.[0]?.puntuacion || 0 }}</span></td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ exp.resumen_experiencia }}</td>
                <td class="text-center font-mono" :class="{'alerta-gasto': calcularTotalGasto(exp.costos) > 5000}">Bs. {{ calcularTotalGasto(exp.costos) }}</td>
                <td style="display: flex; gap: 8px; justify-content: center;">
                  <button @click="verDesglose(exp)" class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;">🔍 Detalle</button>
                  <button @click="eliminarExperiencia(exp.id_exp)" class="btn-quitar" style="padding: 6px 10px; font-size: 0.8rem;" title="Eliminar">🗑️</button>
                </td>
              </tr>
              <tr v-if="experienciasFiltradas.length === 0">
                <td colspan="6" class="text-center" style="padding: 30px; color: #64748b;">No hay experiencias que coincidan con el filtro.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section v-if="vistaActiva === 'perfil'" class="content-section">
        <div class="section-header">
          <h2>👤 Mi Perfil de Administrador</h2>
        </div>
        
        <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px;">
            
            <img v-if="authStore.usuario?.url_foto" :src="procesarUrlImagen(authStore.usuario.url_foto)" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />
            <div v-else style="width: 80px; height: 80px; background: #3b82f6; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; font-weight: bold;">
              {{ authStore.usuario?.nombre?.charAt(0).toUpperCase() || 'A' }}
            </div>
            
            <div>
              <h1 style="margin: 0 0 10px 0; color: #1e293b; font-size: 1.8rem;">{{ authStore.usuario?.nombre }}</h1>
              <span class="badge-admin">Administrador del Sistema</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label style="font-size: 0.85rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Correo de Contacto:</label>
              <p style="margin: 5px 0 0 0; font-size: 1.1rem; color: #334155;">📧 {{ authStore.usuario?.email }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="mostrarModalCrearDestino" class="modal-overlay" @click.self="mostrarModalCrearDestino = false">
      <div class="modal-content">
        <header class="modal-header">
          <h3>➕ Crear Nuevo Destino</h3>
          <button class="btn-close" @click="mostrarModalCrearDestino = false">✖</button>
        </header>
        <div class="modal-body">
          <form @submit.prevent="guardarNuevoDestino" class="form-edicion">
            <div class="form-group">
              <label>Nombre de la Ciudad / Pueblo:</label>
              <input type="text" v-model="nuevoDestino.nombre" required />
            </div>
            <div class="form-group">
              <label>Descripción General:</label>
              <textarea v-model="nuevoDestino.descripcion_general" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Departamento:</label>
              <select v-model="nuevoDestino.id_dep" required>
                <option v-for="dep in listaDepartamentos" :key="dep.id_dep" :value="dep.id_dep">{{ dep.nombre }}</option>
              </select>
            </div>
            <div class="form-group" style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
              <label>📸 Imagen de Portada (Opcional):</label>
              <input type="file" @change="capturarFotoDestino" accept="image/*" class="file-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="mostrarModalCrearDestino = false">Cancelar</button>
              <button type="submit" class="btn-primary">Guardar Destino</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalCrearAtractivo" class="modal-overlay" @click.self="mostrarModalCrearAtractivo = false">
      <div class="modal-content">
        <header class="modal-header">
          <h3>➕ Crear Nuevo Atractivo</h3>
          <button class="btn-close" @click="mostrarModalCrearAtractivo = false">✖</button>
        </header>
        <div class="modal-body">
          <form @submit.prevent="guardarNuevoAtractivo" class="form-edicion">
            <div class="form-group">
              <label>Nombre del Atractivo:</label>
              <input type="text" v-model="nuevoAtractivo.nombre" required />
            </div>
            <div class="form-group">
              <label>Descripción:</label>
              <textarea v-model="nuevoAtractivo.descripcion" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Destino al que pertenece:</label>
              <select v-model="nuevoAtractivo.id_destino" required>
                <option v-for="dest in destinos" :key="dest.id_d" :value="dest.id_d">{{ dest.nombre }}</option>
              </select>
            </div>
            <div class="form-group" style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
              <label>📸 Foto del Atractivo:</label>
              <input type="file" @change="capturarFotoAtractivo" accept="image/*" class="file-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="mostrarModalCrearAtractivo = false">Cancelar</button>
              <button type="submit" class="btn-primary">Guardar Atractivo</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="modalEdicionAbierto" class="modal-overlay" @click.self="cerrarModalEdicion">
      <div class="modal-content">
        <header class="modal-header">
          <h3>✏️ Editar: {{ formularioEdicion.nombre }}</h3>
          <button class="btn-close" @click="cerrarModalEdicion">✖</button>
        </header>
        <div class="modal-body">
          <form @submit.prevent="guardarEdicionGeneral" class="form-edicion">
            <div class="form-group">
              <label>Nombre:</label>
              <input type="text" v-model="formularioEdicion.nombre" required />
            </div>
            <div class="form-group">
              <label>Descripción:</label>
              <textarea v-model="formularioEdicion.descripcion" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>Estado (Visibilidad):</label>
              <select v-model="formularioEdicion.estado">
                <option value="aprobado">Aprobado (Público)</option>
                <option value="pendiente">Pendiente (Oculto)</option>
              </select>
              <div v-if="tipoEdicionActual === 'destino'" class="form-group" style="margin-top: 15px;">
              <label>📅 Meses ideales para visitar:</label>
              <div class="meses-grid">
                <label v-for="mes in listaMeses" :key="mes.id" class="mes-checkbox">
                  <input type="checkbox" :value="mes.id" v-model="formularioEdicion.mesesIdeales" />
                  {{ mes.nombre }}
                </label>
              </div>
            </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="cerrarModalEdicion">Cancelar</button>
              <button type="submit" class="btn-primary">💾 Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <header class="modal-header">
          <h3>🖼️ Fotos de: {{ destinoActual?.nombre }}</h3>
          <button class="btn-close" @click="cerrarModal">✖</button>
        </header>
        <div class="modal-body">
          <div class="upload-box">
            <h4>Subir nueva imagen</h4>
            <input type="file" @change="seleccionarArchivo" accept="image/*" class="file-input" />
            <button class="btn-primary" @click="subirImagen" :disabled="!archivoSeleccionado">
              ⬆️ Subir y Guardar
            </button>
          </div>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;">
          <h4>Imágenes actuales ({{ destinoActual?.imagenes?.length || 0 }})</h4>
          <div v-if="destinoActual?.imagenes?.length > 0" class="image-gallery">
            <div v-for="img in destinoActual.imagenes" :key="img.id_img" class="gallery-item">
              <img :src="procesarUrlImagen(img.url)" alt="miniatura" />
              <button class="btn-delete-small" @click="eliminarImagen(img.id_img)">Borrar</button>
            </div>
          </div>
          <p v-else style="color: #64748b; font-size: 0.9rem;">No hay imágenes.</p>
        </div>
      </div>
    </div>

    <div v-if="modalDesgloseAbierto" class="modal-overlay" @click.self="modalDesgloseAbierto = false">
      <div class="modal-content">
        <header class="modal-header">
          <h3>💰 Desglose de: {{ experienciaEnFoco?.usuario?.nombre || 'Viajero' }}</h3>
          <button class="btn-close" @click="modalDesgloseAbierto = false">✖</button>
        </header>
        <div class="modal-body">
          <p style="margin-top: 0; color: #64748b;">
            <strong>Destino:</strong> {{ experienciaEnFoco?.destino?.nombre }} <br>
            <strong>Fecha:</strong> {{ experienciaEnFoco?.fecha_viaje }}
          </p>
          <table class="tabla-costos" style="margin-top: 15px;">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción / Nota</th>
                <th class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="costo in experienciaEnFoco?.costos" :key="costo.id_costo">
                <td style="font-weight: bold;">{{ costo.categoria }}</td>
                <td style="font-size: 0.85rem; color: #64748b;">{{ costo.descripcion_gasto }}</td>
                <td class="text-right font-mono text-blue-600">Bs. {{ costo.monto }}</td>
              </tr>
              <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="2" class="text-right">TOTAL REPORTADO:</td>
                <td class="text-right font-mono" style="color: #ef4444;">Bs. {{ calcularTotalGasto(experienciaEnFoco?.costos) }}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
            <strong style="color: #0f172a;">📝 Resumen del viaje:</strong>
            <p style="font-style: italic; color: #475569; margin-bottom: 0;">"{{ experienciaEnFoco?.resumen_experiencia }}"</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="modalComentariosAbierto" class="modal-overlay" @click.self="cerrarComentariosAdmin">
      <div class="modal-content">
        <header class="modal-header">
          <h3>💬 Moderar Comentarios</h3>
          <button class="btn-close" @click="cerrarComentariosAdmin">✖</button>
        </header>
        <div class="modal-body" style="background: #f1f5f9; padding: 15px;">
          
          <div v-if="experienciaParaComentarios?.comentarios?.length === 0" style="text-align: center; color: #64748b; padding: 20px;">
            No hay comentarios en esta experiencia.
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div v-for="comentario in experienciaParaComentarios?.comentarios" :key="comentario.id_c" 
                 style="background: white; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; position: relative;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong style="font-size: 0.9rem; color: #1e293b;">👤 {{ comentario.usuario?.nombre || 'Desconocido' }}</strong>
                <span style="font-size: 0.75rem; color: #94a3b8;">{{ new Date(comentario.fecha_comentario).toLocaleDateString() }}</span>
              </div>
              <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #475569;">{{ comentario.mensaje }}</p>
              
              <button @click="eliminarComentarioInapropiado(comentario.id_c)" 
                      style="background: #fee2e2; color: #ef4444; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">
                🗑️ Eliminar por norma
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import apiViajes from '../api/axios'

const router = useRouter()
const authStore = useAuthStore()
// 💡 Lógica del Modo Oscuro para el Admin
const modoOscuro = ref(document.body.classList.contains('dark-theme'))

const toggleTema = () => {
  modoOscuro.value = !modoOscuro.value
  if (modoOscuro.value) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

// --- 1. VARIABLES GLOBALES DE VISTA ---
const vistaActiva = ref('destinos')
const destinos = ref([])
const atractivos = ref([])
const listaExperiencias = ref([])
const listaUsuarios = ref([])
const actualizando = ref(false) // 💡 Controla la animación del botón de refresco

// 💡 NUEVA FUNCIÓN: Sincronizar Todo
const sincronizarTodo = async () => {
  actualizando.value = true;
  // Vaciamos los arreglos temporalmente para forzar a Vue a repintar
  destinos.value = []; atractivos.value = []; listaExperiencias.value = []; listaUsuarios.value = [];
  
  await Promise.all([
    cargarDestinos(),
    cargarAtractivos(),
    cargarExperienciasAdmin(),
    cargarUsuariosAdmin()
  ]);
  
  setTimeout(() => actualizando.value = false, 500); // Pequeño delay estético
}

// Cargas iniciales
const cargarDestinos = async () => {
  try {
    const respuesta = await apiViajes.get('/destinos/admin/todos')
    destinos.value = respuesta.data
  } catch (error) { console.error("Error al cargar destinos") }
}

const cargarAtractivos = async () => {
  try {
    const respuesta = await apiViajes.get('/destinos/atractivos') 
    atractivos.value = respuesta.data
  } catch (error) { console.error("Error al cargar atractivos") }
}

const cargarExperienciasAdmin = async () => {
  try {
    const respuesta = await apiViajes.get('/experiencias');
    listaExperiencias.value = respuesta.data;
  } catch (error) { console.error("Error al cargar experiencias"); }
}

const eliminarExperiencia = async (idExp) => {
  if (confirm('¿Estás seguro de eliminar esta experiencia? Se borrarán sus costos asociados y el cálculo volverá a la normalidad.')) {
    try {
      await apiViajes.delete(`/experiencias/${idExp}`);
      await sincronizarTodo(); // 💡 Usamos la sincronización completa
    } catch (error) { alert('Error al eliminar la experiencia'); }
  }
}

// Función auxiliar para sumar el dinero de una experiencia en el frontend
// su finalidad es dar una alerta visual al admin si el gasto reportado es excesivo (ej: > 5000 Bs) y así detectar posibles trolls o datos erróneos que puedan distorsionar las estadísticas de presupuesto.
const calcularTotalGasto = (costos) => {
  if (!costos || costos.length === 0) return 0;
  return costos.reduce((acumulador, costo) => acumulador + Number(costo.monto), 0).toFixed(2);
}

// --- 2. LÓGICA DE CREACIÓN ---
const listaDepartamentos = ref([
  { id_dep: 1, nombre: 'Chuquisaca' }, { id_dep: 2, nombre: 'La Paz' }, { id_dep: 3, nombre: 'Cochabamba' },
  { id_dep: 4, nombre: 'Oruro' }, { id_dep: 5, nombre: 'Potosí' }, { id_dep: 6, nombre: 'Tarija' },
  { id_dep: 7, nombre: 'Santa Cruz' }, { id_dep: 8, nombre: 'Beni' }, { id_dep: 9, nombre: 'Pando' }
]);

const mostrarModalCrearDestino = ref(false)
const mostrarModalCrearAtractivo = ref(false)
const nuevoDestino = ref({ nombre: '', descripcion_general: '', id_dep: 1, estado: 'aprobado' })
const nuevoAtractivo = ref({ nombre: '', descripcion: '', id_destino: null, estado: 'aprobado' })
const archivoNuevoDestino = ref(null)
const archivoNuevoAtractivo = ref(null)

const capturarFotoDestino = (e) => archivoNuevoDestino.value = e.target.files[0]
const capturarFotoAtractivo = (e) => archivoNuevoAtractivo.value = e.target.files[0]

const guardarNuevoDestino = async () => {
  try {
    const formData = new FormData();
    formData.append('nombre', nuevoDestino.value.nombre);
    formData.append('descripcion_general', nuevoDestino.value.descripcion_general);
    formData.append('id_dep', nuevoDestino.value.id_dep);
    formData.append('estado', nuevoDestino.value.estado);
    if (archivoNuevoDestino.value) formData.append('file', archivoNuevoDestino.value);

    await apiViajes.post('/destinos', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
    mostrarModalCrearDestino.value = false;
    nuevoDestino.value = { nombre: '', descripcion_general: '', id_dep: 1, estado: 'aprobado' };
    archivoNuevoDestino.value = null;
    await sincronizarTodo(); // 💡 Sincronizar
  } catch (error) { alert('Error al crear destino.'); }
}

const guardarNuevoAtractivo = async () => {
  try {
    if (!nuevoAtractivo.value.id_destino && destinos.value.length > 0) nuevoAtractivo.value.id_destino = destinos.value[0].id_d;
    const formData = new FormData();
    formData.append('nombre', nuevoAtractivo.value.nombre);
    formData.append('descripcion', nuevoAtractivo.value.descripcion);
    formData.append('id_destino', nuevoAtractivo.value.id_destino);
    formData.append('estado', nuevoAtractivo.value.estado);
    if (archivoNuevoAtractivo.value) formData.append('file', archivoNuevoAtractivo.value);

    await apiViajes.post('/destinos/atractivos', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
    mostrarModalCrearAtractivo.value = false;
    nuevoAtractivo.value = { nombre: '', descripcion: '', id_destino: null, estado: 'aprobado' };
    archivoNuevoAtractivo.value = null;
    await sincronizarTodo(); // 💡 Sincronizar
  } catch (error) { alert('Error al crear atractivo.'); }
}

// --- 3. LÓGICA DE EDICIÓN UNIFICADA ---
// 💡 Lista estática de meses para no hacer peticiones extra a la BD
const listaMeses = ref([
  { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
]);
const modalEdicionAbierto = ref(false)
const tipoEdicionActual = ref('destino') 
const formularioEdicion = ref({ id: null, nombre: '', descripcion: '', estado: '', mesesIdeales: [] })
const editarDestino = (destino) => {
  tipoEdicionActual.value = 'destino'
  formularioEdicion.value = { 
    id: destino.id_d, 
    nombre: destino.nombre, 
    descripcion: destino.descripcion_general, 
    estado: destino.estado,
    // 💡 Extraemos solo los IDs de los meses que ya tiene marcados
    mesesIdeales: destino.mesesIdeales?.map(m => m.id_mes) || []
  }
  modalEdicionAbierto.value = true
}

const editarAtractivo = (atractivo) => {
  tipoEdicionActual.value = 'atractivo'
  formularioEdicion.value = { id: atractivo.id_at, nombre: atractivo.nombre, descripcion: atractivo.descripcion, estado: atractivo.estado }
  modalEdicionAbierto.value = true
}

const cerrarModalEdicion = () => modalEdicionAbierto.value = false

const guardarEdicionGeneral = async () => {
  try {
    if (tipoEdicionActual.value === 'destino') {
      await apiViajes.patch(`/destinos/${formularioEdicion.value.id}`, {
        nombre: formularioEdicion.value.nombre, 
        descripcion_general: formularioEdicion.value.descripcion, 
        estado: formularioEdicion.value.estado,
        mesesIdeales: formularioEdicion.value.mesesIdeales // 💡 Enviamos los meses al backend
      });
    } else {
      await apiViajes.patch(`/destinos/atractivos/${formularioEdicion.value.id}`, {
        nombre: formularioEdicion.value.nombre, 
        descripcion: formularioEdicion.value.descripcion, 
        estado: formularioEdicion.value.estado
      });
    }
    cerrarModalEdicion();
    await sincronizarTodo();
  } catch(error) { alert('❌ Error al guardar los cambios.'); }
}

const eliminarDestino = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este destino?')) {
    try { await apiViajes.delete(`/destinos/${id}`); await sincronizarTodo(); } catch (e) { alert('Error') }
  }
}

const eliminarAtractivo = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este atractivo?')) {
    try { await apiViajes.delete(`/destinos/atractivos/${id}`); await sincronizarTodo(); } catch (e) { alert('Error') }
  }
}

// --- 4. LÓGICA DE FOTOS ---
const modalAbierto = ref(false)
const destinoActual = ref(null)
const tipoItemFoto = ref('destino')
const archivoSeleccionado = ref(null)

const procesarUrlImagen = (url) => {
  if (!url) return 'https://via.placeholder.com/400x200?text=Sin+Imagen';
  if (url.startsWith('http')) return url;
  //return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
   // === MODO NUBE (Cloud de AWS) ===
  //return `http://52.54.242.122${url.startsWith('/') ? '' : '/'}${url}`;
  // === MODO NUBE (Application Load Balancer de AWS) ===
  return `https://alb-viajes-backend-1486483178.us-east-1.elb.amazonaws.com${url.startsWith('/') ? '' : '/'}${url}`;
}

const obtenerPortada = (item) => {
  if (item.imagenes && item.imagenes.length > 0) return procesarUrlImagen(item.imagenes[0].url);
  return 'https://via.placeholder.com/400x200?text=Sin+Imagen';
}

const abrirModalFotos = (item, tipo) => { 
  destinoActual.value = item; tipoItemFoto.value = tipo; modalAbierto.value = true; 
}
const cerrarModal = () => { modalAbierto.value = false; destinoActual.value = null; archivoSeleccionado.value = null; }
const seleccionarArchivo = (e) => archivoSeleccionado.value = e.target.files[0]

const subirImagen = async () => {
  if (!archivoSeleccionado.value) return;
  const formData = new FormData(); formData.append('file', archivoSeleccionado.value);
  try {
    const urlEndpoint = tipoItemFoto.value === 'destino' ? `/destinos/${destinoActual.value.id_d}/imagenes` : `/destinos/atractivos/${destinoActual.value.id_at}/imagenes`;
    await apiViajes.post(urlEndpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    cerrarModal(); 
    await sincronizarTodo(); // 💡 Sincronizar
  } catch (error) { alert('Error al subir la imagen.'); }
}

const eliminarImagen = async (idImg) => {
  if(confirm('¿Borrar esta imagen permanentemente?')) {
    try {
      await apiViajes.delete(`/destinos/imagenes/${idImg}`);
      await sincronizarTodo(); // 💡 Sincronizar
    } catch (error) { alert('❌ Error al borrar.'); }
  }
}

// 💡 VARIABLES PARA FILTROS Y DESGLOSE
const filtroDestinoAdmin = ref('');
const modalDesgloseAbierto = ref(false);
const experienciaEnFoco = ref(null);

// 💡 VARIABLES Y FUNCIONES PARA MODERAR COMENTARIOS
const modalComentariosAbierto = ref(false);
const experienciaParaComentarios = ref(null);

const abrirComentariosAdmin = (exp) => {
  experienciaParaComentarios.value = exp;
  modalComentariosAbierto.value = true;
};

const cerrarComentariosAdmin = () => {
  modalComentariosAbierto.value = false;
  experienciaParaComentarios.value = null;
};

const eliminarComentarioInapropiado = async (idC) => {
  if (confirm("¿Estás seguro de eliminar este comentario por incumplir las normas?")) {
    try {
      await apiViajes.delete(`/experiencias/comentarios/${idC}`);
      
      // Eliminamos el comentario visualmente del arreglo actual para no tener que recargar todo de golpe
      if (experienciaParaComentarios.value) {
        experienciaParaComentarios.value.comentarios = experienciaParaComentarios.value.comentarios.filter(c => c.id_c !== idC);
      }
      
      // Llamamos a la sincronización en segundo plano para asegurar que la tabla principal se actualice
      sincronizarTodo(); 
    } catch (error) {
      alert("Error al intentar eliminar el comentario.");
    }
  }
};

const experienciasFiltradas = computed(() => {
  if (!filtroDestinoAdmin.value) return listaExperiencias.value;
  return listaExperiencias.value.filter(exp => exp.destino?.nombre === filtroDestinoAdmin.value);
});

const verDesglose = (exp) => { experienciaEnFoco.value = exp; modalDesgloseAbierto.value = true; };

const cerrarSesion = () => { authStore.logout(); router.push('/login'); }

const cargarUsuariosAdmin = async () => {
  try {
    const respuesta = await apiViajes.get('/usuarios');
    listaUsuarios.value = respuesta.data;
  } catch (error) { console.error("Error al cargar usuarios"); }
}

const cambiarRolUsuario = async (idUsuario, nuevoRol) => {
  if (confirm(`¿Estás seguro de cambiar el rol de este usuario a "${nuevoRol}"?`)) {
    try {
      await apiViajes.patch(`/usuarios/${idUsuario}/rol`, { rol: nuevoRol });
      await sincronizarTodo(); // 💡 Sincronizar
    } catch (error) { alert('Error al actualizar el rol del usuario.'); }
  }
}

const eliminarUsuario = async (idUsuario) => {
  if (confirm('¡PELIGRO! ¿Estás seguro de eliminar a este usuario?')) {
    try {
      await apiViajes.delete(`/usuarios/${idUsuario}`);
      await sincronizarTodo(); // 💡 Sincronizar
    } catch (error) { alert('Error al eliminar.'); }
  }
}

onMounted(() => {
  sincronizarTodo() // 💡 Usamos la función maestra al arrancar
}) 
</script>

<style scoped>
/* ESTILOS DEL DASHBOARD */
.dashboard-layout { display: flex; height: 100vh; font-family: 'Segoe UI', sans-serif; background-color: var(--bg-layout); overflow: hidden; }

/* 💡 El Sidebar ahora es dinámico */
.sidebar { width: 250px; background-color: var(--bg-card); border-right: 1px solid var(--color-border); color: var(--text-main); display: flex; flex-direction: column; padding: 1.5rem; height: 100vh; position: sticky; top: 0; box-sizing: border-box;}
.brand { font-size: 1.2rem; font-weight: bold; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; color: var(--text-main); }
.menu { display: flex; flex-direction: column; gap: 10px; flex-grow: 1; }
.menu button { background: none; border: none; color: var(--text-muted); text-align: left; padding: 12px; font-size: 1rem; cursor: pointer; border-radius: 6px; transition: 0.2s;}
.menu button:hover { background-color: var(--bg-layout); color: var(--text-main); }
.menu button.active { background-color: var(--color-primary); color: white; font-weight: bold; }
.btn-logout { background-color: rgba(239, 68, 68, 0.1); border: 1px solid var(--color-danger); color: var(--color-danger); padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: auto; transition: 0.2s;} 
.btn-logout:hover { background-color: var(--color-danger); color: white; }

.main-content { flex-grow: 1; padding: 2rem; overflow-y: auto; max-width: 100%; margin: 0 auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: var(--bg-card); padding: 1rem 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid var(--color-border); }
.topbar h2 { margin: 0; color: var(--text-main); }
/* 💡 ESTILOS PARA LA TOPBAR Y BOTONES NUEVOS */
.btn-catalogo {
  background: var(--bg-header);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-catalogo:hover {
  background: var(--bg-card);
  border-color: var(--color-primary);
}

.btn-tema {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-tema:hover {
  transform: scale(1.15);
}

/* 💡 NUEVOS ESTILOS DEL BOTÓN ACTUALIZAR */
.btn-refresh { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); border: 1px solid rgba(59, 130, 246, 0.3); padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 5px;}
.btn-refresh:hover { background: rgba(59, 130, 246, 0.2); }
.btn-refresh.girando { opacity: 0.7; pointer-events: none; }

.badge-admin { background-color: #fef08a; color: #854d0e; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; display: inline-block;}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h3, .section-header h2 { color: var(--text-main); margin: 0; }
.section-header p { color: var(--text-muted); margin: 5px 0 0 0; }
.btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-secondary { background: var(--bg-header); color: var(--text-main); border: 1px solid var(--color-border); padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }

.grid-admin { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.admin-card { background: var(--bg-card); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid var(--color-border); }
.card-image-wrapper { position: relative; height: 160px; }
.card-image-wrapper img { width: 100%; height: 100%; object-fit: cover; border-bottom: 1px solid var(--color-border); }

.admin-controls-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; gap: 10px; opacity: 0; transition: opacity 0.3s; }
.card-image-wrapper:hover .admin-controls-overlay { opacity: 1; }
.admin-controls-overlay button { background: var(--bg-card); color: var(--text-main); border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-size: 0.9rem; font-weight: bold; }
.btn-danger-icon { background: rgba(239, 68, 68, 0.1) !important; color: var(--color-danger) !important; border: 1px solid var(--color-danger) !important;}

.card-info { padding: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
.card-info h4 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
.desc-text { margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.3; }
.loc-text { margin: 5px 0 0 0; font-size: 0.8rem; color: var(--color-primary); font-weight: bold; }
.badge-estado { padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; white-space: nowrap; margin-left: 10px; }
.badge-estado.aprobado { background-color: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid var(--color-success);}
.badge-estado.pendiente { background-color: #fef08a; color: #854d0e; }

/* MODALES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-content { background: var(--bg-card); width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden; border: 1px solid var(--color-border); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--bg-header); border-bottom: 1px solid var(--color-border); }
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.2rem; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 20px; max-height: 70vh; overflow-y: auto; }

.upload-box { background: var(--bg-layout); padding: 15px; border-radius: 8px; border: 2px dashed var(--color-border); text-align: center; margin-bottom: 15px; color: var(--text-main); }
.file-input { margin-bottom: 15px; width: 100%; color: var(--text-main); }
.image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gallery-item { position: relative; border-radius: 6px; overflow: hidden; height: 100px; border: 1px solid var(--color-border); }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; }
.btn-delete-small { position: absolute; bottom: 5px; right: 5px; background: var(--color-danger); color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer; }

.form-edicion .form-group { margin-bottom: 15px; }
.form-edicion label { display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main); }
.form-edicion input, .form-edicion textarea, .form-edicion select { width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; box-sizing: border-box; background: var(--bg-layout); color: var(--text-main); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.alerta-gasto { color: var(--color-danger); font-weight: bold; } 
.badge-blue { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; border: 1px solid rgba(59, 130, 246, 0.3);}

/* TABLAS DE GESTIÓN */
.table-container { background: var(--bg-card); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid var(--color-border); overflow-x: auto; margin-top: 20px; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background-color: var(--bg-header); padding: 15px; font-weight: bold; color: var(--text-main); border-bottom: 2px solid var(--color-border); font-size: 0.9rem; text-transform: uppercase; }
.admin-table td { padding: 15px; border-bottom: 1px solid var(--color-border); color: var(--text-muted); font-size: 0.95rem; vertical-align: middle; }
.admin-table tbody tr:hover { background-color: var(--bg-layout); }

.text-right { text-align: right; }
.text-center { text-align: center; }
.font-mono { font-family: monospace; font-size: 1.1rem; }

.btn-quitar { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-quitar:hover { background: var(--color-danger); color: white; }

.badge-user { background-color: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid var(--color-success); padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }

/* 💡 ESTILOS PARA LA CUADRÍCULA DE MESES */
.meses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: var(--bg-layout); padding: 15px; border-radius: 8px; border: 1px dashed var(--color-border); }
.mes-checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-main); cursor: pointer; }
.mes-checkbox input { cursor: pointer; }
</style>