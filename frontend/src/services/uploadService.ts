import api from './api'

export const uploadService = {
  uploadFiles(rmaId: number, files: File[]) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    return api.post(`/api/upload/rma/${rmaId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getFile(fileId: number) {
    return api.get(`/api/upload/file/${fileId}`, {
      responseType: 'blob'
    })
  },

  deleteFile(fileId: number) {
    return api.delete(`/api/upload/file/${fileId}`)
  }
}