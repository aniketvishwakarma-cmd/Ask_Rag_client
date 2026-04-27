import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { queryApi } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfidenceBadge from '@/components/ConfidenceBadge'

const SOURCE_TYPES = [
  { value: 'RBI_MASTER', label: 'RBI Master Direction' },
  { value: 'CICRA', label: 'CICRA' },
  { value: 'RBI_CIRCULAR', label: 'RBI Circular' },
  { value: 'SOP', label: 'Standard Operating Procedure' },
]

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude Haiku 3.5' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
]

function normalizeQueryResult(payload: any) {
  const answer = typeof payload?.answer === 'string' && payload.answer.trim()
    ? payload.answer
    : 'No answer text was returned by the backend.'
  const simpleExplanation = typeof payload?.simple_explanation === 'string' && payload.simple_explanation.trim()
    ? payload.simple_explanation
    : 'The backend response did not include a simple explanation. Check the backend logs if this happens again.'

  return {
    answer,
    simple_explanation: simpleExplanation,
    key_facts: Array.isArray(payload?.key_facts) ? payload.key_facts : [],
    citations: Array.isArray(payload?.citations) ? payload.citations : [],
    confidence: typeof payload?.confidence === 'number' ? payload.confidence : 0,
    retrieved_chunks: Array.isArray(payload?.retrieved_chunks) ? payload.retrieved_chunks : [],
    verification: {
      valid_citations: Array.isArray(payload?.verification?.valid_citations) ? payload.verification.valid_citations : [],
      invalid_citations: Array.isArray(payload?.verification?.invalid_citations) ? payload.verification.invalid_citations : [],
      hallucination_flags: Array.isArray(payload?.verification?.hallucination_flags) ? payload.verification.hallucination_flags : [],
    },
  }
}

function QueryPage() {
  const [query, setQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514')
  const [result, setResult] = useState<any>(null)

  const queryMutation = useMutation({
    mutationFn: (data: any) => queryApi.submitQuery(data),
    onSuccess: (response) => {
      setResult(normalizeQueryResult(response.data))
      toast.success('Query processed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to process query')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error('Please enter a query')
      return
    }

    queryMutation.mutate({
      query,
      source_filters: selectedSources.length > 0 ? selectedSources : undefined,
      model: selectedModel,
    })
  }

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const hallucinationFlags = result?.verification?.hallucination_flags ?? []
  const validCitations = result?.verification?.valid_citations ?? []
  const keyFacts = result?.key_facts ?? []
  const citations = result?.citations ?? []
  const retrievedChunks = result?.retrieved_chunks ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ask Regulatory Questions</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the capital adequacy requirements for scheduled commercial banks?"
              className="input min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="label mb-3 block">Filter by Source Type (Optional)</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SOURCE_TYPES.map((source) => (
                <label
                  key={source.value}
                  className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                    selectedSources.includes(source.value)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.value)}
                    onChange={() => toggleSource(source.value)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-3 block">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input"
            >
              {MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={queryMutation.isLoading || !query.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {queryMutation.isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
                  Submit Query
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Answer</h3>
              <div className="flex items-center space-x-2">
                <ConfidenceBadge confidence={result.confidence} />
                {hallucinationFlags.length > 0 && (
                  <span className="badge-error">
                    <ExclamationTriangleIcon className="mr-1 h-3 w-3" />
                    {hallucinationFlags.length} warnings
                  </span>
                )}
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Detailed Answer</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Simple Explanation</h4>
                <p className="text-gray-700">{result.simple_explanation}</p>
              </div>

              {keyFacts.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Facts</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {keyFacts.map((fact: string, index: number) => (
                      <li key={index} className="text-gray-700">{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {citations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Citations</h4>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((citation: string, index: number) => (
                      <span key={index} className="citation-highlight">
                        {citation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {retrievedChunks.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Source Documents ({retrievedChunks.length})
              </h3>
              <div className="space-y-4">
                {retrievedChunks.map((chunk: any) => (
                  <div key={chunk.chunk_id} className="border-l-4 border-primary-500 pl-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Rank {chunk.rank} | Score: {typeof chunk.score === 'number' ? chunk.score.toFixed(3) : '0.000'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {chunk.metadata?.page_number && `Page ${chunk.metadata.page_number}`}
                        {chunk.metadata?.chapter && ` | ${chunk.metadata.chapter}`}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification Details</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Citations</h4>
                <div className="space-y-1">
                  {validCitations.length > 0 ? (
                    validCitations.map((citation: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-green-700">
                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                        {citation}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No valid citations found</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Warnings</h4>
                <div className="space-y-1">
                  {hallucinationFlags.length > 0 ? (
                    hallucinationFlags.map((warning: string, index: number) => (
                      <div key={index} className="flex items-start text-sm text-red-700">
                        <ExclamationTriangleIcon className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center text-sm text-green-700">
                      <CheckCircleIcon className="mr-1 h-3 w-3" />
                      No issues detected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default QueryPage
