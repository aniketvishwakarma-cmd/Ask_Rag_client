import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { documentsApi } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'

const SOURCE_TYPES = [
  { value: 'RBI_MASTER', label: 'RBI Master Direction' },
  { value: 'CICRA', label: 'CICRA' },
  { value: 'RBI_CIRCULAR', label: 'RBI Circular' },
  { value: 'SOP', label: 'Standard Operating Procedure' },
]

const STATUS_COLORS = {
  uploaded: 'badge-gray',
  processing: 'badge-warning',
  completed: 'badge-success',
  failed: 'badge-error',
}

type UploadPhase = 'uploading' | 'processing' | 'completed' | 'failed'

type UploadSession = {
  fileName: string
  uploadProgress: number
  phase: UploadPhase
  documentId?: string
  processingProgress: number
  processingStage?: string | null
  status?: string
  chunkCount: number
  totalChunks: number
  embeddedChunks: number
  graphProcessedChunks: number
  error?: string | null
}

function isDocumentInProgress(document: any) {
  return document.status === 'uploaded' || document.status === 'processing'
}

function ProgressBar({
  progress,
  label,
  helperText,
}: {
  progress: number
  label: string
  helperText?: string | null
}) {
  const safeProgress = Math.max(0, Math.min(100, progress || 0))

  return (
    <div className="min-w-[220px]">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>{safeProgress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

function DocumentsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showChunksModal, setShowChunksModal] = useState(false)
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null)
  const queryClient = useQueryClient()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getDocuments().then(res => res.data),
    refetchInterval: (currentDocuments) => {
      const documentList = currentDocuments as any[] | undefined
      return documentList?.some(isDocumentInProgress) ? 2000 : false
    },
  })

  const { data: liveUploadProgress } = useQuery({
    queryKey: ['document-progress', uploadSession?.documentId],
    queryFn: () => documentsApi.getDocumentProgress(uploadSession!.documentId!).then((res) => res.data),
    enabled: !!uploadSession?.documentId && uploadSession.phase !== 'uploading',
    refetchInterval: (currentProgress) => {
      const progress = currentProgress as any
      if (!uploadSession?.documentId) {
        return false
      }
      return progress?.status === 'completed' || progress?.status === 'failed' ? false : 1500
    },
  })

  useEffect(() => {
    if (!liveUploadProgress) {
      return
    }

    setUploadSession((currentSession) => {
      if (!currentSession || currentSession.documentId !== liveUploadProgress.id) {
        return currentSession
      }

      const nextPhase: UploadPhase =
        liveUploadProgress.status === 'completed'
          ? 'completed'
          : liveUploadProgress.status === 'failed'
            ? 'failed'
            : 'processing'

      return {
        ...currentSession,
        phase: nextPhase,
        status: liveUploadProgress.status,
        uploadProgress: 100,
        processingProgress: liveUploadProgress.processing_progress ?? currentSession.processingProgress,
        processingStage: liveUploadProgress.processing_stage ?? currentSession.processingStage,
        chunkCount: liveUploadProgress.chunk_count ?? currentSession.chunkCount,
        totalChunks: liveUploadProgress.total_chunks ?? currentSession.totalChunks,
        embeddedChunks: liveUploadProgress.embedded_chunks ?? currentSession.embeddedChunks,
        graphProcessedChunks: liveUploadProgress.graph_processed_chunks ?? currentSession.graphProcessedChunks,
        error: liveUploadProgress.processing_error ?? null,
      }
    })

    if (liveUploadProgress.status === 'completed' || liveUploadProgress.status === 'failed') {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  }, [liveUploadProgress, queryClient])

  const uploadMutation = useMutation({
    mutationFn: ({ formData, fileName }: { formData: FormData; fileName: string }) =>
      documentsApi.uploadDocument(formData, {
        onUploadProgress: (event: ProgressEvent) => {
          if (!event.total) {
            return
          }

          const nextProgress = Math.min(100, Math.round((event.loaded * 100) / event.total))
          setUploadSession((currentSession) =>
            currentSession?.fileName === fileName
              ? {
                  ...currentSession,
                  uploadProgress: nextProgress,
                }
              : currentSession
          )
        },
      }).then((res) => res.data),
    onMutate: ({ fileName }) => {
      setUploadSession({
        fileName,
        uploadProgress: 0,
        phase: 'uploading',
        processingProgress: 0,
        processingStage: 'Uploading PDF to the server',
        status: 'uploading',
        chunkCount: 0,
        totalChunks: 0,
        embeddedChunks: 0,
        graphProcessedChunks: 0,
        error: null,
      })
      setShowUploadModal(true)
    },
    onSuccess: (document) => {
      setUploadSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              documentId: document.id,
              uploadProgress: 100,
              phase: document.status === 'failed' ? 'failed' : 'processing',
              status: document.status,
              processingProgress: document.processing_progress ?? 5,
              processingStage: document.processing_stage ?? 'Upload complete, waiting to start processing',
            }
          : currentSession
      )
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Upload complete. Backend processing started.')
    },
    onError: (error: any) => {
      setUploadSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              phase: 'failed',
              status: 'failed',
              error: error.response?.data?.detail || 'Failed to upload document',
            }
          : currentSession
      )
      toast.error(error.response?.data?.detail || 'Failed to upload document')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return documentsApi.deleteDocument(id).then(res => res.data)
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['documents'] })
      const previousDocuments = queryClient.getQueryData<any[]>(['documents'])

      queryClient.setQueryData<any[]>(['documents'], (currentDocuments = []) =>
        currentDocuments.filter((document) => document.id !== id)
      )

      return { previousDocuments }
    },
    onSuccess: () => {
      toast.success('Document deleted successfully!')
    },
    onError: (error: any, _id, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(['documents'], context.previousDocuments)
      }
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete document'
      toast.error(errorMessage)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const reprocessMutation = useMutation({
    mutationFn: (id: string) => documentsApi.reprocessDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document reprocessing started!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reprocess document')
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0])
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const handleUpload = (file: File, sourceType: string = 'RBI_MASTER', title?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('source_type', sourceType)
    if (title) {
      formData.append('title', title)
    }

    uploadMutation.mutate({ formData, fileName: file.name })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleReprocess = (id: string) => {
    reprocessMutation.mutate(id)
  }

  const handleViewChunks = (document: any) => {
    setSelectedDocument(document)
    setShowChunksModal(true)
  }

  const handleCloseUploadModal = () => {
    setShowUploadModal(false)
    if (uploadSession?.phase === 'completed' || uploadSession?.phase === 'failed') {
      setUploadSession(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-upload"
        >
          <CloudArrowUpIcon className="mr-2 h-5 w-5" />
          Upload Document
        </button>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chunks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.original_filename}
                          </div>
                          {doc.title && (
                            <div className="text-sm text-gray-500">{doc.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-primary">
                        {SOURCE_TYPES.find(s => s.value === doc.source_type)?.label || doc.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isDocumentInProgress(doc) ? (
                        <div className="space-y-2">
                          <span className={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS]}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                          <ProgressBar
                            progress={doc.processing_progress || (doc.status === 'uploaded' ? 5 : 10)}
                            label="Backend processing"
                            helperText={doc.processing_stage}
                          />
                        </div>
                      ) : (
                        <span className={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS]}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(doc.upload_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.chunk_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewChunks(doc)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View chunks"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {doc.status === 'completed' && (
                          <button
                            onClick={() => handleReprocess(doc.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Reprocess"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(doc.id)
                          }}
                          disabled={deleteMutation.isLoading && deleteMutation.variables === doc.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title={deleteMutation.isLoading && deleteMutation.variables === doc.id ? 'Deleting...' : 'Delete'}
                          type="button"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first regulatory document.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-upload"
              >
                <CloudArrowUpIcon className="mr-2 h-5 w-5" />
                Upload Document
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>

            {!uploadSession ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the PDF file here'
                    : 'Drag and drop a PDF file here, or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF files only</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{uploadSession.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {uploadSession.phase === 'uploading'
                      ? 'Sending the PDF to the backend'
                      : uploadSession.phase === 'processing'
                        ? 'The backend is extracting text, chunking, embedding, and indexing the document'
                        : uploadSession.phase === 'completed'
                          ? 'The document is fully processed and ready for queries'
                          : 'Processing stopped before completion'}
                  </p>
                </div>

                <ProgressBar
                  progress={uploadSession.uploadProgress}
                  label="Upload transfer"
                  helperText={
                    uploadSession.uploadProgress >= 100
                      ? 'PDF stored on the server'
                      : 'Uploading file bytes to the backend'
                  }
                />

                <ProgressBar
                  progress={uploadSession.processingProgress}
                  label="Backend processing"
                  helperText={uploadSession.processingStage || 'Waiting for backend processing to begin'}
                />

                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">{uploadSession.status || uploadSession.phase}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chunks</p>
                    <p className="font-medium text-gray-900">{uploadSession.chunkCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Embedded</p>
                    <p className="font-medium text-gray-900">
                      {uploadSession.embeddedChunks}
                      {uploadSession.totalChunks > 0 ? ` / ${uploadSession.totalChunks}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Graph</p>
                    <p className="font-medium text-gray-900">
                      {uploadSession.graphProcessedChunks}
                      {uploadSession.totalChunks > 0 ? ` / ${uploadSession.totalChunks}` : ''}
                    </p>
                  </div>
                </div>

                {uploadSession.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {uploadSession.error}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseUploadModal}
                className="btn-action"
              >
                {uploadSession?.phase === 'uploading' || uploadSession?.phase === 'processing'
                  ? 'Close and continue in background'
                  : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chunks Modal */}
      {showChunksModal && selectedDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setShowChunksModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Document Chunks - {selectedDocument.original_filename}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <ChunksList documentId={selectedDocument.id} />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  console.log('Close button clicked')
                  setShowChunksModal(false)
                }}
                className="btn-primary px-6 py-2"
                type="button"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

function ChunksList({ documentId }: { documentId: string }) {
  const { data: chunks, isLoading } = useQuery({
    queryKey: ['document-chunks', documentId],
    queryFn: () => documentsApi.getDocumentChunks(documentId).then(res => res.data),
    enabled: !!documentId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!chunks || chunks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No chunks found for this document.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chunks.map((chunk: any, index: number) => (
        <div key={chunk.id} className="border-l-4 border-primary-500 pl-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Chunk {index + 1}</span>
              {chunk.page_number && (
                <span className="text-xs text-gray-500">Page {chunk.page_number}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {chunk.token_count} tokens
            </div>
          </div>
          
          {(chunk.chapter || chunk.section || chunk.clause_ref) && (
            <div className="mb-2 text-xs text-gray-600 space-x-2">
              {chunk.chapter && <span>Chapter: {chunk.chapter}</span>}
              {chunk.section && <span>Section: {chunk.section}</span>}
              {chunk.clause_ref && <span>Clause: {chunk.clause_ref}</span>}
            </div>
          )}
          
          <p className="text-sm text-gray-700 leading-relaxed">
            {chunk.text}
          </p>
        </div>
      ))}
    </div>
  )
}

export default DocumentsPage
