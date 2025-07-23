import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { portfolioApi } from '@/services/api';
import type { Project } from '@/types';
import Loading from '@/components/ui/Loading';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);
        const featuredProjects = await portfolioApi.getFeaturedProjects();
        setProjects(featuredProjects);
      } catch (err) {
        console.error('Error fetching featured projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  if (loading) {
    return (
      <section className='py-20 bg-secondary/5'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <Loading />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='py-20 bg-secondary/5'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <p className='text-muted-foreground'>
              Unable to load projects at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-20 bg-secondary/5'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='text-center'
        >
          <h2 className='text-4xl font-bold text-foreground mb-8'>
            Featured Projects
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-12'>
            Here are some of my recent projects. Each one represents a unique
            challenge and learning experience.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className='bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6'
                >
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
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Show placeholder
                          const img = e.target as HTMLImageElement;
                          const placeholder = img.parentNode?.querySelector(
                            '.image-placeholder'
                          ) as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
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
                </motion.div>
              ))
            ) : (
              <motion.div
                whileHover={{ y: -5 }}
                className='bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6'
              >
                <h3 className='text-xl font-semibold text-foreground mb-2'>
                  Coming Soon
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Project details will be added here.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 bg-primary/10 text-primary text-xs rounded'>
                    React
                  </span>
                  <span className='px-2 py-1 bg-primary/10 text-primary text-xs rounded'>
                    TypeScript
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <Link
            to={ROUTES.PROJECTS}
            className='inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
