import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { portfolioApi } from '@/services/api';
import type { Project } from '@/types';
import Loading from '@/components/ui/Loading';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await portfolioApi.getAllProjects();
        setProjects(allProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen pt-20'>
        <div className='container mx-auto px-4 py-12'>
          <div className='text-center'>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen pt-20'>
        <div className='container mx-auto px-4 py-12'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold mb-8 text-center'>
              My <span className='gradient-text'>Projects</span>
            </h1>
            <p className='text-muted-foreground'>
              Unable to load projects at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl md:text-5xl font-bold mb-8 text-center'>
            My <span className='gradient-text'>Projects</span>
          </h1>
          <p className='text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto'>
            Here are some of the projects I've worked on. Each one represents a
            unique challenge and learning experience.
          </p>

          {projects.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className='h-full'>
                    <div className='p-6'>
                      <div className='mb-4'>
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className='w-full h-48 object-cover rounded-lg'
                            onError={e => {
                              console.error(
                                'Image failed to load:',
                                project.imageUrl
                              );
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              // Show placeholder
                              const placeholder = img.parentNode?.querySelector(
                                '.image-placeholder'
                              ) as HTMLElement;
                              if (placeholder)
                                placeholder.style.display = 'flex';
                            }}
                            onLoad={() => {
                              console.log(
                                'Image loaded successfully:',
                                project.imageUrl
                              );
                            }}
                          />
                        ) : null}
                        {/* Placeholder for failed images */}
                        <div
                          className={`image-placeholder w-full h-48 bg-muted rounded-lg flex items-center justify-center ${project.imageUrl ? 'hidden' : 'flex'}`}
                        >
                          <span className='text-muted-foreground text-sm'>
                            No image available
                          </span>
                        </div>
                      </div>
                      <h3 className='text-xl font-semibold text-foreground mb-2'>
                        {project.title}
                      </h3>
                      <p className='text-muted-foreground mb-4'>
                        {project.description}
                      </p>
                      <div className='flex flex-wrap gap-2 mb-4'>
                        {project.technologies.map(tech => (
                          <span
                            key={tech}
                            className='px-2 py-1 bg-primary/10 text-primary text-xs rounded'
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:text-primary/80 transition-colors text-sm font-medium'
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center'>
              <p className='text-muted-foreground'>
                No projects available at the moment.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
