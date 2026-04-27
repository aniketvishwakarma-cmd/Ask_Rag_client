import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { queryApi } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfidenceBadge from '@/components/ConfidenceBadge'

const QUALITY_COLORS = {
  high: 'badge-success',
  medium: 'badge-warning',
  low: 'badge-error',
  insufficient_evidence: 'badge-gray',
}

function AuditPage() {
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [filters, setFilters] = useState({
    answer_quality: '',
    confidence_min: '',
    confidence_max: '',
  })
  const queryClient = useQueryClient()

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => queryApi.getAuditLogs(filters).then(res => res.data),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: any }) =>
      queryApi.reviewAnswer(auditId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      toast.success('Answer reviewed successfully!')
      setShowAuditModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to review answer')
    },
  })

  const handleViewAudit = (audit: any) => {
    setSelectedAudit(audit)
    setShowAuditModal(true)
  }

  const handleReview = (approved: boolean, notes?: string) => {
    if (!selectedAudit) return

    reviewMutation.mutate({
      auditId: selectedAudit.id,
      data: { approved, reviewer_notes: notes },
    })
  }

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      answer_quality: '',
      confidence_min: '',
      confidence_max: '',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <button
          onClick={() => refetch()}
          className="btn-action"
        >
          Refresh
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="btn-action text-sm"
          >
            Clear all
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Answer Quality</label>
            <select
              value={filters.answer_quality}
              onChange={(e) => updateFilter('answer_quality', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="insufficient_evidence">Insufficient Evidence</option>
            </select>
          </div>
          
          <div>
            <label className="label">Min Confidence</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidence_min}
              onChange={(e) => updateFilter('confidence_min', e.target.value)}
              placeholder="0.0"
              className="input"
            />
          </div>
          
          <div>
            <label className="label">Max Confidence</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidence_max}
              onChange={(e) => updateFilter('confidence_max', e.target.value)}
              placeholder="1.0"
              className="input"
            />
          </div>
          
          <div className="flex items-end">
            <button className="btn-action w-full">
              <FunnelIcon className="mr-2 h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Audit Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : auditLogs && auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((audit: any) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {audit.user_query}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ConfidenceBadge confidence={audit.confidence_score} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={QUALITY_COLORS[audit.answer_quality as keyof typeof QUALITY_COLORS]}>
                        {audit.answer_quality.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {audit.model_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {audit.hallucination_flags_count > 0 ? (
                        <span className="badge-error">
                          <ExclamationTriangleIcon className="mr-1 h-3 w-3 inline" />
                          {audit.hallucination_flags_count}
                        </span>
                      ) : (
                        <span className="badge-success">
                          <CheckCircleIcon className="mr-1 h-3 w-3 inline" />
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(audit.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewAudit(audit)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start querying documents to generate audit logs.
            </p>
          </div>
        )}
      </motion.div>

      {/* Audit Details Modal */}
      {showAuditModal && selectedAudit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Query Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Query</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedAudit.user_query}
                  </p>
                </div>

                {/* Response Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-gray-500">Model:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAudit.model_used}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Response Time:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAudit.response_time_ms}ms</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tokens Used:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedAudit.tokens_used || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {format(new Date(selectedAudit.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality Assessment */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quality Assessment</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-gray-500">Confidence Score:</span>
                      <div className="mt-1">
                        <ConfidenceBadge confidence={selectedAudit.confidence_score} />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Answer Quality:</span>
                      <div className="mt-1">
                        <span className={QUALITY_COLORS[selectedAudit.answer_quality as keyof typeof QUALITY_COLORS]}>
                          {selectedAudit.answer_quality.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Citations */}
                {selectedAudit.citations && selectedAudit.citations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Citations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAudit.citations.map((citation: string, index: number) => (
                        <span key={index} className="citation-highlight">
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hallucination Flags */}
                {selectedAudit.hallucination_flags && selectedAudit.hallucination_flags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Warnings</h4>
                    <div className="space-y-2">
                      {selectedAudit.hallucination_flags.map((flag: string, index: number) => (
                        <div key={index} className="flex items-start text-sm text-red-700 bg-red-50 p-3 rounded">
                          <ExclamationTriangleIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retrieved Chunks */}
                {selectedAudit.retrieved_chunks && selectedAudit.retrieved_chunks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Retrieved Chunks ({selectedAudit.retrieved_chunks.length})
                    </h4>
                    <div className="text-sm text-gray-600">
                      {selectedAudit.retrieved_chunks.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="space-x-3">
                  <button
                    onClick={() => handleReview(true)}
                    disabled={reviewMutation.isLoading}
                    className="btn-success disabled:opacity-50"
                  >
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(false)}
                    disabled={reviewMutation.isLoading}
                    className="btn-error disabled:opacity-50"
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Reject
                  </button>
                </div>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default AuditPage
