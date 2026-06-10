import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/registro', name: 'Registro', component: () => import('../views/RegistroView.vue') },
  { path: '/admin', name: 'Admin', component: () => import('../views/AdminDashboard.vue') },
  { path: '/recuperar', name: 'Recuperar', component: () => import('../views/RecuperarPasswordView.vue') },
  { 
    path: '/destino/:id', 
    name: 'DestinoDetalle', 
    component: () => import('../views/DestinoDetalleView.vue') 
  },
  // 💡 NUEVO: Ruta pública para ver los planes de la comunidad
  {
    path: '/comunidad',
    name: 'PlanesPublicos',
    component: () => import('../views/PlanesPublicosView.vue')
  },
  {
    path: '/mis-planes',
    name: 'MisPlanes',
    component: () => import('../views/MisPlanesView.vue'),
    // 💡 Seguridad: Protegemos la ruta
    meta: { requiresAuth: true }
  },

  {
    path: '/plan/:id',
    name: 'PlanDetalle',
    component: () => import('../views/PlanDetalleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mis-experiencias',
    name: 'MisExperiencias',
    component: () => import('../views/MisExperienciasView.vue'),
    meta: { requiresAuth: true } 
  },
  
]

// 1. PRIMERO CREAMOS EL ROUTER
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 2. LUEGO LE PONEMOS EL GUARDIA DE SEGURIDAD
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token_acceso') || sessionStorage.getItem('token_acceso'); 
  const usuarioStr = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuario = JSON.parse(usuarioStr || '{}');

  // Si intentan entrar a cualquier ruta que empiece con /admin
  if (to.path.startsWith('/admin')) {
    if (!token || usuario.rol !== 'admin') {
      return '/login';
    }
  }
  
  // 💡 NUEVO: Si intentan entrar a una ruta protegida (como mis-planes)
  if (to.meta.requiresAuth) {
    if (!token) {
      return '/login'; // Los rebotamos al login
    }
  }

  // Si no retorna nada, Vue Router asume que puede pasar
});

// 3. FINALMENTE LO EXPORTAMOS
export default router