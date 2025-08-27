import { Module, ActionContext } from 'vuex'
import { RootState } from '../index'
import { authService } from '../../services/authService'

export interface AuthState {
  user: any
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const state: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
}

const mutations = {
  SET_LOADING(state: AuthState, loading: boolean) {
    state.loading = loading
  },
  SET_USER(state: AuthState, user: any) {
    state.user = user
    state.isAuthenticated = true
  },
  SET_TOKEN(state: AuthState, token: string) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_ERROR(state: AuthState, error: string | null) {
    state.error = error
  },
  LOGOUT(state: AuthState) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
  }
}

const actions = {
  async login({ commit }: ActionContext<AuthState, RootState>, credentials: { username: string; password: string }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const response = await authService.login(credentials)
      
      commit('SET_TOKEN', response.data.token)
      commit('SET_USER', response.data.user)
      
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Login failed')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async checkAuth({ commit, state }: ActionContext<AuthState, RootState>) {
    if (!state.token) {
      return false
    }

    try {
      const response = await authService.verifyToken()
      commit('SET_USER', response.data.user)
      return true
    } catch (error) {
      commit('LOGOUT')
      return false
    }
  },

  logout({ commit }: ActionContext<AuthState, RootState>) {
    commit('LOGOUT')
  }
}

const getters = {
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  user: (state: AuthState) => state.user,
  token: (state: AuthState) => state.token,
  loading: (state: AuthState) => state.loading,
  error: (state: AuthState) => state.error
}

const auth: Module<AuthState, RootState> = {
  state,
  mutations,
  actions,
  getters
}

export default auth