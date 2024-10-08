import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <Layout>
          <Dashboard />
        </Layout>
      </DndProvider>
    </ErrorBoundary>
  )
}

export default App