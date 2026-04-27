import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Smart Q&A',
    description: 'Ask questions about regulatory compliance and get accurate, citation-backed answers from uploaded documents.',
    icon: ChatBubbleLeftRightIcon,
    href: '/query',
    color: 'bg-blue-500',
  },
  {
    name: 'Document Management',
    description: 'Upload and manage RBI, CICRA, and other regulatory documents with intelligent parsing and chunking.',
    icon: DocumentTextIcon,
    href: '/documents',
    color: 'bg-green-500',
  },
  {
    name: 'Knowledge Graph',
    description: 'Explore relationships between regulations, entities, and concepts through interactive visualizations.',
    icon: ChartBarIcon,
    href: '/knowledge-graph',
    color: 'bg-purple-500',
  },
  {
    name: 'Audit Trail',
    description: 'Review complete audit logs, confidence scores, and track all query interactions for compliance.',
    icon: ClipboardDocumentListIcon,
    href: '/audit',
    color: 'bg-orange-500',
  },
]

const stats = [
  { name: 'Documents Processed', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Queries Answered', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Average Confidence', value: '0%', change: '+0%', changeType: 'positive' },
  { name: 'Citations Generated', value: '0', change: '+0%', changeType: 'positive' },
]

function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          RegIntel-RAG
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          AI-powered regulatory compliance platform for RBI/CICRA/CIBIL regulations. 
          Get accurate, citation-backed answers from your regulatory documents.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/query"
            className="btn-primary px-6 py-3"
          >
            Get Started
          </Link>
          <Link
            to="/documents"
            className="btn-outline px-6 py-3"
          >
            Upload Documents
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, statIdx) => (
          <div
            key={stat.name}
            className={`card ${statIdx === 0 ? 'lg:col-span-2' : ''}`}
          >
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-600">{stat.name}</p>
          </div>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
      >
        {features.map((feature, featureIdx) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: featureIdx * 0.1 }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={feature.href} className="block h-full">
              <div className="card h-full hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Learn more <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Capabilities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Capabilities</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Processing</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                PDF parsing with header/footer cleanup
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Clause-aware chunking
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Metadata extraction (chapters, sections, clauses)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Automatic embedding generation
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Intelligent Retrieval</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Hybrid BM25 + semantic search
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Reciprocal Rank Fusion
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Optional Cohere reranking
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Source type filtering
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer Generation</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Strict grounded prompting
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Citation validation
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Confidence scoring
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Hallucination detection
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance & Audit</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Complete audit trails
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Human review workflow
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Knowledge graph visualization
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Entity relationship mapping
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
