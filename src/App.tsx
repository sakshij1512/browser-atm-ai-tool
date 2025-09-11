import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TestProvider } from './contexts/TestContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Configurations from './pages/Configurations';
import TestResults from './pages/TestResults/TestResults';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <TestProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/configurations" element={<Configurations />} />
            <Route path="/results" element={<TestResults />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </TestProvider>
  );
}

export default App;