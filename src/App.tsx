import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Novedades from './components/Novedades';
import Incapacidades from './components/Incapacidades';
import Enfermeria from './components/Enfermeria';
import Usuarios from './components/Usuarios';
import Configuracion from './components/Configuracion';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/novedades" element={
              <ProtectedRoute module="novedades" action="read">
                <Layout>
                  <Novedades />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/incapacidades" element={
              <ProtectedRoute module="incapacidades" action="read">
                <Layout>
                  <Incapacidades />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/enfermeria" element={
              <ProtectedRoute module="enfermeria" action="read">
                <Layout>
                  <Enfermeria />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Layout>
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/configuracion" element={
              <ProtectedRoute>
                <Layout>
                  <Configuracion />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;