import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import QueryPage from '@/pages/QueryPage'
import DocumentsPage from '@/pages/DocumentsPage'
import KnowledgeGraphPage from '@/pages/KnowledgeGraphPage'
import AuditPage from '@/pages/AuditPage'
import AdminPage from '@/pages/AdminPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/query" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="query" element={<QueryPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/query" replace />} />
          </Route>
        </Routes>
      </motion.div>
    </div>
  )
}

export default App
