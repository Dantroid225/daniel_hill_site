import axios from 'axios';
import type { Project } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    // Use admin token for admin routes, regular token for other routes
    if (adminToken && config.url?.includes('/api/admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Check if it's an admin route
      if (error.config.url?.includes('/api/admin')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Portfolio API functions
export const portfolioApi = {
  // Get all published portfolio items
  getAllProjects: async (): Promise<Project[]> => {
    try {
      console.log(
        'Fetching all projects from:',
        `${API_BASE_URL}/api/portfolio`
      );
      const response = await api.get('/api/portfolio');
      console.log('API Response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch projects');
      }

      return response.data.data.map(
        (item: {
          id: number;
          title: string;
          description: string;
          image_url?: string;
          technologies: string | string[];
          project_url?: string;
          featured: number | boolean;
          created_at: string;
          updated_at: string;
        }) => {
          const imageUrl = item.image_url
            ? `${API_BASE_URL}${item.image_url}`
            : '';
          console.log('Generated image URL (all projects):', imageUrl);
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: imageUrl,
            technologies: Array.isArray(item.technologies)
              ? item.technologies
              : JSON.parse(item.technologies || '[]'),
            githubUrl: item.project_url || '',
            liveUrl: item.project_url || '',
            featured: item.featured === 1 || item.featured === true,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
        }
      );
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      throw error;
    }
  },

  // Get featured projects only
  getFeaturedProjects: async (): Promise<Project[]> => {
    try {
      console.log(
        'Fetching featured projects from:',
        `${API_BASE_URL}/api/portfolio`
      );
      const response = await api.get('/api/portfolio');
      console.log('API Response for featured projects:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch projects');
      }

      const allProjects = response.data.data;
      const featuredProjects = allProjects.filter(
        (item: { featured: number | boolean }) =>
          item.featured === 1 || item.featured === true
      );

      return featuredProjects.map(
        (item: {
          id: number;
          title: string;
          description: string;
          image_url?: string;
          technologies: string | string[];
          project_url?: string;
          featured: number | boolean;
          created_at: string;
          updated_at: string;
        }) => {
          const imageUrl = item.image_url
            ? `${API_BASE_URL}${item.image_url}`
            : '';
          console.log('Generated image URL (featured projects):', imageUrl);
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: imageUrl,
            technologies: Array.isArray(item.technologies)
              ? item.technologies
              : JSON.parse(item.technologies || '[]'),
            githubUrl: item.project_url || '',
            liveUrl: item.project_url || '',
            featured: item.featured === 1 || item.featured === true,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
        }
      );
    } catch (error) {
      console.error('Error in getFeaturedProjects:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id: number): Promise<Project> => {
    try {
      console.log('Fetching project by ID:', id);
      const response = await api.get(`/api/portfolio/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch project');
      }

      const item = response.data.data;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url ? `${API_BASE_URL}${item.image_url}` : '',
        technologies: Array.isArray(item.technologies)
          ? item.technologies
          : JSON.parse(item.technologies || '[]'),
        githubUrl: item.project_url || '',
        liveUrl: item.project_url || '',
        featured: item.featured === 1 || item.featured === true,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  },
};

export default api;
