import api from './api'

export const authService = {
  login(credentials: { username: string; password: string }) {
    return api.post('/api/auth/login', credentials)
  },

  verifyToken() {
    return api.get('/api/auth/verify')
  },

  logout() {
    return api.post('/api/auth/logout')
  }
}