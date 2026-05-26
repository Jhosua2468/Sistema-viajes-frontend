import { defineStore } from 'pinia'
import apiViajes from '../api/axios'
//en aca la finalidad de este store es manejar el estado de autenticación del usuario, incluyendo el token de acceso y la información del usuario. Además, proporciona acciones para iniciar sesión y cerrar sesión, y getters para verificar si el usuario está autenticado y si es un administrador.

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Busca en localStorage PRIMERO, si no hay, busca en sessionStorage
    token: localStorage.getItem('token_acceso') || sessionStorage.getItem('token_acceso') || null,
    usuario: JSON.parse(localStorage.getItem('usuario')) || JSON.parse(sessionStorage.getItem('usuario')) || null,
  }),
  
  getters: {
    estaAutenticado: (state) => !!state.token,
    esAdmin: (state) => state.usuario?.rol === 'admin'
  },

  actions: {
    // Añadimos el parámetro "recuerdame"
    async login(email, password, recuerdame = false) {
      try {
        const respuesta = await apiViajes.post('/usuarios/login', { email, password })
        
        this.token = respuesta.data.token_acceso
        this.usuario = respuesta.data.usuario

        // LA MAGIA ESTÁ AQUÍ
        if (recuerdame) {
          // Guarda permanentemente
          localStorage.setItem('token_acceso', this.token)
          localStorage.setItem('usuario', JSON.stringify(this.usuario))
        } else {
          // Guarda temporalmente (se borra al cerrar la pestaña)
          sessionStorage.setItem('token_acceso', this.token)
          sessionStorage.setItem('usuario', JSON.stringify(this.usuario))
        }
      } catch (error) {
        throw new Error('Credenciales incorrectas')
      }
    },

    logout() {
      this.token = null
      this.usuario = null
      // Limpiamos AMBAS memorias por seguridad
      localStorage.removeItem('token_acceso')
      localStorage.removeItem('usuario')
      sessionStorage.removeItem('token_acceso')
      sessionStorage.removeItem('usuario')
    }
  }
})
