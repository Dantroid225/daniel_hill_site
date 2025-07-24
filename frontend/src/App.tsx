import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import HomePage from './pages/home/HomePage';
import ExperiencePage from './pages/experience/ExperiencePage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ArtShowPage from './pages/artshow/ArtShowPage';
import ContactPage from './pages/contact/ContactPage';
import BlogPage from './pages/blog/BlogPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path='/'
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path='/experience'
              element={
                <Layout>
                  <ExperiencePage />
                </Layout>
              }
            />
            <Route
              path='/projects'
              element={
                <Layout>
                  <ProjectsPage />
                </Layout>
              }
            />
            <Route
              path='/artshow'
              element={
                <Layout>
                  <ArtShowPage />
                </Layout>
              }
            />
            <Route
              path='/contact'
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />
            <Route
              path='/blog'
              element={
                <Layout>
                  <BlogPage />
                </Layout>
              }
            />

            {/* Admin routes */}
            <Route path='/admin/login' element={<AdminLoginPage />} />
            <Route
              path='/admin/*'
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </AdminAuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
