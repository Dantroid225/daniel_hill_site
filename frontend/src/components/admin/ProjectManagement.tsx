import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProjectForm from '@/components/forms/ProjectForm';

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  technologies: string[];
  category: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/admin/portfolio');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      try {
        await api.delete(`/api/admin/portfolio/${projectId}`);
        setProjects(projects.filter(p => p.id !== projectId));
        // Show success message (you could add a success state if needed)
        console.log('Project deleted successfully');
      } catch (error) {
        console.error('Failed to delete project:', error);
        setError('Failed to delete project');
      }
    }
  };

  const handleToggleFeatured = async (projectId: number) => {
    try {
      await api.put(`/api/admin/portfolio/${projectId}/featured`);
      setProjects(
        projects.map(p =>
          p.id === projectId ? { ...p, featured: !p.featured } : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      setError('Failed to update featured status');
    }
  };

  const handleStatusChange = async (projectId: number, status: string) => {
    try {
      await api.put(`/api/admin/portfolio/${projectId}/status`, { status });
      setProjects(
        projects.map(p =>
          p.id === projectId
            ? { ...p, status: status as 'draft' | 'published' | 'archived' }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update status');
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSaveProject = async (projectData: FormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (editingProject) {
        // Update existing project
        await api.put(
          `/api/admin/portfolio/${editingProject.id}`,
          projectData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Refresh the projects list to get updated data
        await fetchProjects();
      } else {
        // Create new project
        await api.post('/api/admin/portfolio', projectData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Refresh the projects list to get the new project
        await fetchProjects();
      }

      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      setError('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setError('');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-foreground'>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {showForm ? (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold text-foreground'>
              Project Management
            </h1>
            <Button onClick={handleAddProject}>Add New Project</Button>
          </div>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div className='grid gap-6'>
            {projects.map(project => (
              <Card key={project.id}>
                <div className='p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='text-xl font-semibold text-foreground'>
                        {project.title}
                      </h3>
                      <p className='text-muted-foreground mt-1'>
                        {project.description}
                      </p>
                      <div className='flex items-center gap-2 mt-2'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {project.status}
                        </span>
                        {project.featured && (
                          <span className='px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800'>
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleToggleFeatured(project.id)}
                      >
                        {project.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <select
                        value={project.status}
                        onChange={e =>
                          handleStatusChange(project.id, e.target.value)
                        }
                        className='px-3 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                      >
                        <option value='draft'>Draft</option>
                        <option value='published'>Published</option>
                        <option value='archived'>Archived</option>
                      </select>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDelete(project.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <span>Category: {project.category}</span>
                    <span>Order: {project.display_order}</span>
                    {project.technologies && (
                      <span>
                        Tech:{' '}
                        {Array.isArray(project.technologies)
                          ? project.technologies.join(', ')
                          : project.technologies}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>No projects found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectManagement;
