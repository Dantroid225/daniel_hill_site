import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const ProjectsPage: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'Portfolio Website',
      description:
        'A modern portfolio website built with React, TypeScript, and Tailwind CSS.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      image: '/images/project-1.jpg',
      link: '#',
    },
    {
      id: 2,
      title: 'E-commerce Platform',
      description:
        'A full-stack e-commerce platform with payment integration and admin dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      image: '/images/project-2.jpg',
      link: '#',
    },
    {
      id: 3,
      title: 'Task Management App',
      description:
        'A collaborative task management application with real-time updates.',
      technologies: ['React', 'Socket.io', 'Express', 'PostgreSQL'],
      image: '/images/project-3.jpg',
      link: '#',
    },
  ];

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
                    <a
                      href={project.link}
                      className='text-primary hover:text-primary/80 transition-colors text-sm font-medium'
                    >
                      View Project →
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
