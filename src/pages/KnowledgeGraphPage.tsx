import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ForceGraph2D from 'react-force-graph-2d'
import {
  MagnifyingGlassIcon,
  ShareIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { knowledgeGraphApi } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'

const ENTITY_TYPES = [
  { value: 'regulation', label: 'Regulations' },
  { value: 'entity', label: 'Entities' },
  { value: 'concept', label: 'Concepts' },
  { value: 'amount', label: 'Amounts' },
  { value: 'date', label: 'Dates' },
  { value: 'requirement', label: 'Requirements' },
]

const NODE_COLORS = {
  regulation: '#3b82f6',
  entity: '#10b981',
  concept: '#8b5cf6',
  amount: '#f59e0b',
  date: '#ef4444',
  requirement: '#6366f1',
}

function KnowledgeGraphPage() {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [showNeighbors, setShowNeighbors] = useState(false)
  const [neighborsData, setNeighborsData] = useState<any>(null)
  const graphRef = useRef<any>()

  const { data: graphData, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-graph', selectedEntityTypes],
    queryFn: () => knowledgeGraphApi.getGraphData({
      entity_types: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
    }).then(res => res.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['graph-stats'],
    queryFn: () => knowledgeGraphApi.getGraphStats().then(res => res.data),
  })

  const { data: searchResultsData } = useQuery({
    queryKey: ['search-entities', searchQuery],
    queryFn: () => knowledgeGraphApi.searchEntities({
      query: searchQuery,
      entity_types: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
    }).then(res => res.data),
    enabled: searchQuery.length > 2,
  })

  useEffect(() => {
    if (searchResultsData) {
      setSearchResults(searchResultsData)
    }
  }, [searchResultsData])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
    setShowNeighbors(true)
    loadNodeNeighbors(node.id)
  }

  const loadNodeNeighbors = async (nodeId: string) => {
    try {
      const data = await knowledgeGraphApi.getEntityNeighbors(nodeId)
      setNeighborsData(data.data)
    } catch (error) {
      toast.error('Failed to load node neighbors')
    }
  }

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleZoomToFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
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
        <h2 className="text-2xl font-bold text-gray-900">Knowledge Graph</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleZoomToFit}
            className="btn-action"
          >
            <ChartBarIcon className="mr-2 h-5 w-5" />
            Fit to Screen
          </button>
          <button
            onClick={() => refetch()}
            className="btn-action"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="card">
            <div className="flex items-center">
              <ShareIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.total_entities}</p>
                <p className="text-sm text-gray-600">Total Entities</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.total_relations}</p>
                <p className="text-sm text-gray-600">Total Relations</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.entity_counts?.regulation || 0}</p>
                <p className="text-sm text-gray-600">Regulations</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <ShareIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.entity_counts?.concept || 0}</p>
                <p className="text-sm text-gray-600">Concepts</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Entity Type Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Entity Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {ENTITY_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                    selectedEntityTypes.includes(type.value)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEntityTypes.includes(type.value)}
                    onChange={() => toggleEntityType(type.value)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Entities</h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for entities..."
                className="input pr-10"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white">
                {searchResults.map((result: any) => (
                  <div
                    key={result.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleNodeClick(result)}
                  >
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-gray-500">{result.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Graph Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-0"
      >
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <div className="graph-container">
            <ForceGraph2D
              ref={graphRef}
              graphData={{
                nodes: graphData.nodes.map((node: any) => ({
                  ...node,
                  color: NODE_COLORS[node.type as keyof typeof NODE_COLORS] || '#6b7280',
                })),
                links: graphData.edges,
              }}
              nodeLabel="name"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name
                const fontSize = 12 / globalScale
                ctx.font = `${fontSize}px Sans-Serif`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = node.color
                ctx.beginPath()
                ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.fillStyle = '#333'
                ctx.fillText(label, node.x, node.y + 10)
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              onNodeClick={handleNodeClick}
              enableNodeDrag={true}
              enableZoomInteraction={true}
            />
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <ShareIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No graph data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload and process documents to generate the knowledge graph.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Node Details Modal */}
      {selectedNode && showNeighbors && neighborsData && (
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
              <h3 className="text-lg font-medium text-gray-900">
                Entity Details: {selectedNode.name}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <span className={`badge-${selectedNode.type === 'regulation' ? 'primary' : 'gray'}`}>
                  {selectedNode.type}
                </span>
                {selectedNode.value && (
                  <span className="ml-2 text-sm text-gray-600">Value: {selectedNode.value}</span>
                )}
              </div>

              <h4 className="font-medium text-gray-900 mb-3">Connected Entities</h4>
              <div className="grid grid-cols-1 gap-4">
                {neighborsData.nodes.map((node: any) => (
                  <div key={node.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{node.name}</div>
                        <div className="text-sm text-gray-500">{node.type}</div>
                      </div>
                      <span className="badge-gray">
                        {neighborsData.edges.find((edge: any) => 
                          edge.source === selectedNode.id && edge.target === node.id ||
                          edge.target === selectedNode.id && edge.source === node.id
                        )?.relation_type || 'connected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowNeighbors(false)
                  setSelectedNode(null)
                }}
                className="btn-primary"
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

export default KnowledgeGraphPage
