import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Query API
export const queryApi = {
  submitQuery: (data: any) => api.post('/api/query/', data),
  getQueryHistory: (params?: any) => api.get('/api/query/history', { params }),
  getQueryAudit: (queryId: string) => api.get(`/api/query/${queryId}/audit`),
  getAuditLogs: (params?: any) => api.get('/api/query/audit/logs', { params }),
  reviewAnswer: (auditId: string, data: any) => api.post(`/api/query/review/${auditId}`, data),
}

// Documents API
export const documentsApi = {
  uploadDocument: (formData: FormData, config?: any) => api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  }),
  getDocuments: (params?: any) => api.get('/api/documents/', { params }),
  getDocument: (id: string) => api.get(`/api/documents/${id}`),
  getDocumentProgress: (id: string) => api.get(`/api/documents/${id}/progress`),
  getDocumentChunks: (id: string, params?: any) => api.get(`/api/documents/${id}/chunks`, { params }),
  deleteDocument: (id: string) => api.delete(`/api/documents/${id}`),
  reprocessDocument: (id: string) => api.post(`/api/documents/${id}/reprocess`),
}

// Knowledge Graph API
export const knowledgeGraphApi = {
  getGraphData: (params?: any) => api.get('/api/knowledge-graph/graph', { params }),
  getEntityNeighbors: (entityId: string, params?: any) => api.get(`/api/knowledge-graph/entities/${entityId}/neighbors`, { params }),
  searchEntities: (params?: any) => api.get('/api/knowledge-graph/entities/search', { params }),
  getGraphStats: () => api.get('/api/knowledge-graph/stats'),
}

// System API
export const systemApi = {
  getHealth: () => api.get('/health'),
  getStats: () => api.get('/api/stats'),
}

export default api
