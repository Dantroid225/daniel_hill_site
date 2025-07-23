import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto'
        >
          <h1 className='text-4xl md:text-5xl font-bold mb-8 text-center'>
            <span className='gradient-text'>About Me</span>
          </h1>

          <div className='prose prose-lg max-w-none'>
            <p className='text-lg text-muted-foreground mb-8 text-center'>
              I'm a passionate full-stack developer with a love for creating
              beautiful, functional, and user-friendly applications.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12 mt-16'>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-6'>
                  Experience
                </h2>
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-foreground'>
                      Full Stack Developer
                    </h3>
                    <p className='text-muted-foreground'>2020 - Present</p>
                    <p className='text-muted-foreground mt-2'>
                      Building modern web applications with React, Node.js, and
                      cloud technologies.
                    </p>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-foreground'>
                      Frontend Developer
                    </h3>
                    <p className='text-muted-foreground'>2018 - 2020</p>
                    <p className='text-muted-foreground mt-2'>
                      Creating responsive user interfaces and interactive
                      experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className='text-2xl font-bold text-foreground mb-6'>
                  Skills
                </h2>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-lg font-semibold text-foreground mb-2'>
                      Frontend
                    </h3>
                    <p className='text-muted-foreground'>
                      React, TypeScript, Tailwind CSS, Next.js
                    </p>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-foreground mb-2'>
                      Backend
                    </h3>
                    <p className='text-muted-foreground'>
                      Node.js, Express, MongoDB, PostgreSQL
                    </p>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-foreground mb-2'>
                      Tools
                    </h3>
                    <p className='text-muted-foreground'>
                      Git, Docker, AWS, Vercel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
