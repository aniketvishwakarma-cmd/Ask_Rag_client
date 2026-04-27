import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  ServerIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { systemApi } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'

function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => systemApi.getHealth().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => systemApi.getStats().then(res => res.data),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] })
    queryClient.invalidateQueries({ queryKey: ['system-stats'] })
    toast.success('System data refreshed!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'initialized':
        return 'text-green-600 bg-green-100'
      case 'unhealthy':
      case 'disconnected':
      case 'not_initialized':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'initialized':
        return CheckCircleIcon
      case 'unhealthy':
      case 'disconnected':
      case 'not_initialized':
        return ExclamationTriangleIcon
      default:
        return ExclamationTriangleIcon
    }
  }

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: ServerIcon },
    { id: 'services', name: 'Services Status', icon: Cog6ToothIcon },
    { id: 'statistics', name: 'Statistics', icon: ChatBubbleLeftRightIcon },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={handleRefresh}
          className="btn-action"
        >
          <ArrowPathIcon className="mr-2 h-5 w-5" />
          Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Health Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              {healthLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : health ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Overall Status</p>
                      <p className="text-sm text-gray-500">System health</p>
                    </div>
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.status)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Database</p>
                      <p className="text-sm text-gray-500">PostgreSQL</p>
                    </div>
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.database)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.database)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.database}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cache</p>
                      <p className="text-sm text-gray-500">Redis</p>
                    </div>
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.redis)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.redis)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.redis}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Retrieval</p>
                      <p className="text-sm text-gray-500">Search index</p>
                    </div>
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.retrieval_service)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.retrieval_service)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.retrieval_service}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-2 text-sm text-red-600">Failed to load health status</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mb-2" />
                  <h4 className="font-medium text-gray-900">View Documents</h4>
                  <p className="text-sm text-gray-500">Manage uploaded documents</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Query History</h4>
                  <p className="text-sm text-gray-500">Review past queries</p>
                </button>
                
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Cog6ToothIcon className="h-8 w-8 text-purple-500 mb-2" />
                  <h4 className="font-medium text-gray-900">System Settings</h4>
                  <p className="text-sm text-gray-500">Configure system</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Services Status Tab */}
        {activeTab === 'services' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            {healthLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">API Server</h4>
                      <p className="text-sm text-gray-500">FastAPI application server</p>
                    </div>
                    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.status)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.status}
                    </span>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">PostgreSQL Database</h4>
                      <p className="text-sm text-gray-500">Primary data storage with pgvector</p>
                    </div>
                    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.database)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.database)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.database}
                    </span>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Redis Cache</h4>
                      <p className="text-sm text-gray-500">Session and query caching</p>
                    </div>
                    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.redis)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.redis)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.redis}
                    </span>
                  </div>
                </div>
                
                <div className="border-l-4 border-l-4 pl-4" style={{ borderColor: health.retrieval_service === 'initialized' ? '#10b981' : '#ef4444' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Retrieval Service</h4>
                      <p className="text-sm text-gray-500">BM25 and vector search index</p>
                    </div>
                    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health.retrieval_service)}`}>
                      {(() => {
                        const Icon = getStatusIcon(health.retrieval_service)
                        return <Icon className="h-3 w-3 mr-1" />
                      })()}
                      {health.retrieval_service}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <p className="mt-2 text-sm text-red-600">Failed to load service status</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="card">
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Main Statistics */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="card">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">{stats.documents}</p>
                        <p className="text-sm text-gray-600">Documents</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center">
                      <ServerIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">{stats.chunks}</p>
                        <p className="text-sm text-gray-600">Chunks</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">{stats.queries}</p>
                        <p className="text-sm text-gray-600">Queries</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-semibold text-gray-900">{stats.audit_logs}</p>
                        <p className="text-sm text-gray-600">Audit Logs</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retrieval Index Status */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Retrieval Index</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Index Status</p>
                        <p className="text-sm text-gray-500">BM25 + Vector</p>
                      </div>
                      <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stats.retrieval_index.initialized ? 'initialized' : 'not_initialized')}`}>
                        {(() => {
                          const Icon = getStatusIcon(stats.retrieval_index.initialized ? 'initialized' : 'not_initialized')
                          return <Icon className="h-3 w-3 mr-1" />
                        })()}
                        {stats.retrieval_index.initialized ? 'Ready' : 'Not Ready'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Indexed Chunks</p>
                        <p className="text-sm text-gray-500">Total chunks in index</p>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {stats.retrieval_index.chunks_indexed}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card">
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-2 text-sm text-red-600">Failed to load statistics</p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AdminPage
