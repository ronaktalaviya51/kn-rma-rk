import api from './api'

export const rmaService = {
  createRequest(requestData: any) {
    return api.post('/api/rma/request', requestData)
  },

  getRequestStatus(rmaNumber: string) {
    return api.get(`/api/rma/status/${rmaNumber}`)
  },

  getRequests(params: any = {}) {
    return api.get('/api/rma/requests', { params })
  },

  getRequest(id: number) {
    return api.get(`/api/rma/requests/${id}`)
  },

  updateRequestStatus(id: number, data: { status: string; admin_notes?: string; priority?: string }) {
    return api.put(`/api/rma/requests/${id}/status`, data)
  },

  deleteRequest(id: number) {
    return api.delete(`/api/rma/requests/${id}`)
  },

  getStats() {
    return api.get('/api/rma/stats')
  }
}