import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '@/components/forms/ContactForm';
import Avatar from '@/components/ui/Avatar';

const ContactPage: React.FC = () => {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto'
        >
          <div className='text-center mb-12'>
            <div className='flex justify-center mb-6'>
              <Avatar size='small' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold mb-8'>
              Let's <span className='gradient-text'>Connect</span>
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            I'm always interested in new opportunities, collaborations, and interesting projects. 
            Whether you need technical expertise, creative solutions, or just want to discuss potential work, I'd love to hear from you.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            <div>
            <h2 className='text-2xl font-bold mb-6 text-center'>
                  Contact Information
                </h2>
                <div className='space-y-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243 0 .49-.122.928-.49 1.243-.369.315-.807.49-1.297.49z' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm'>Instagram</p>
                      <a
                        href='https://instagram.com/oodlefrandoodle'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary-400 hover:text-primary-300 font-medium'
                      >
                        @oodlefrandoodle
                      </a>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm'>Email</p>
                      <p className='text-white font-medium'>
                        danhill225@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm'>LinkedIn</p>
                      <a
                        href='https://linkedin.com/in/daniel-hill-software-engineer'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary-400 hover:text-primary-300 font-medium'
                      >
                        Daniel Hill - Software Engineer
                      </a>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm'>GitHub</p>
                      <a
                        href='https://github.com/danhill225'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary-400 hover:text-primary-300 font-medium'
                      >
                        danhill225
                      </a>
                    </div>
                  </div>
                  <hr className='my-8 border-border' />
                  
                  <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    What I'm Looking For
                  </h3>
                  <ul className='space-y-2 text-gray-300'>
                    <li className='flex items-start'>
                      <span className='text-primary-400 mr-2 mt-1'>▹</span>
                      Technical leadership and engineering roles
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary-400 mr-2 mt-1'>▹</span>
                      Creative and innovative project opportunities
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary-400 mr-2 mt-1'>▹</span>
                      Collaboration on interesting technical challenges
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary-400 mr-2 mt-1'>▹</span>
                      Mentoring and knowledge sharing opportunities
                    </li>
                  </ul>
                </div>
              
              </div>
            </div>

            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Send a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
