import { Module, ActionContext } from 'vuex'
import { RootState } from '../index'
import { rmaService } from '../../services/rmaService'

export interface RmaState {
  requests: any[]
  currentRequest: any | null
  stats: any | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const state: RmaState = {
  requests: [],
  currentRequest: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

const mutations = {
  SET_LOADING(state: RmaState, loading: boolean) {
    state.loading = loading
  },
  SET_ERROR(state: RmaState, error: string | null) {
    state.error = error
  },
  SET_REQUESTS(state: RmaState, { requests, pagination }: { requests: any[]; pagination: any }) {
    state.requests = requests
    state.pagination = pagination
  },
  SET_CURRENT_REQUEST(state: RmaState, request: any) {
    state.currentRequest = request
  },
  SET_STATS(state: RmaState, stats: any) {
    state.stats = stats
  },
  UPDATE_REQUEST_STATUS(state: RmaState, { id, status, admin_notes }: { id: number; status: string; admin_notes?: string }) {
    const request = state.requests.find(r => r.id === id)
    if (request) {
      request.status = status
      if (admin_notes) request.admin_notes = admin_notes
    }
    if (state.currentRequest && state.currentRequest.id === id) {
      state.currentRequest.status = status
      if (admin_notes) state.currentRequest.admin_notes = admin_notes
    }
  }
}

const actions = {
  async createRequest({ commit }: ActionContext<RmaState, RootState>, requestData: any) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const response = await rmaService.createRequest(requestData)
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to create request')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchRequests({ commit }: ActionContext<RmaState, RootState>, params: any = {}) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const response = await rmaService.getRequests(params)

      commit('SET_REQUESTS', {
        requests: (response as any).data.data,
        pagination: (response as any).data.pagination
      })
      
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to fetch requests')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchRequest({ commit }: ActionContext<RmaState, RootState>, id: number) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const response = await rmaService.getRequest(id)
      commit('SET_CURRENT_REQUEST', response.data.data)
      
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to fetch request')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateRequestStatus({ commit }: ActionContext<RmaState, RootState>, { id, status, admin_notes }: { id: number; status: string; admin_notes?: string }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      await rmaService.updateRequestStatus(id, { status, admin_notes })
      commit('UPDATE_REQUEST_STATUS', { id, status, admin_notes })
      
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to update request status')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async getRequestStatus({ commit }: ActionContext<RmaState, RootState>, rmaNumber: string) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const response = await rmaService.getRequestStatus(rmaNumber)
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to get request status')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchStats({ commit }: ActionContext<RmaState, RootState>) {
    try {
      const response = await rmaService.getStats()
      commit('SET_STATS', response.data)
      return response
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Failed to fetch stats')
      throw error
    }
  }
}

const getters = {
  requests: (state: RmaState) => state.requests,
  currentRequest: (state: RmaState) => state.currentRequest,
  stats: (state: RmaState) => state.stats,
  loading: (state: RmaState) => state.loading,
  error: (state: RmaState) => state.error,
  pagination: (state: RmaState) => state.pagination
}

const rma: Module<RmaState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default rma