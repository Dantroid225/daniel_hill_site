import React from 'react';
import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import SEOHead from '@/components/seo/SEOHead';
import {
  experienceData,
  skillCategories,
  coreExpertise,
} from '@/data/experience';

const ExperiencePage: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Daniel Hill',
    jobTitle: 'Full Stack Developer',
    description:
      'Multitalented Application Engineer with 8 years of experience in application development and technical support',
    url: 'https://daniel-hill.com/experience',
    sameAs: ['https://github.com/dantroid225'],
    knowsAbout: coreExpertise,
  };

  return (
    <>
      <SEOHead
        title='Experience - Daniel Hill | Full Stack Developer'
        description='Multitalented Application Engineer with 8 years of experience in roles requiring creative problem-solving skills. View detailed work experience and technical expertise.'
        canonical='/experience'
        structuredData={structuredData}
      />
      <div className='min-h-screen pt-20'>
        <div className='container mx-auto px-4 py-12'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-4xl mx-auto'
          >
            <div className='text-center mb-8'>
              <Avatar size='large' className='mb-6' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold mb-8 text-center'>
              <span className='gradient-text'>Experience</span>
            </h1>

            <div className='prose prose-lg max-w-none'>
              <p className='text-lg text-muted-foreground mb-8 text-center'>
                Multitalented Application Engineer with in-depth technical
                expertise and 8 years of experience in roles requiring creative
                problem-solving skills. Proven at optimizing processes,
                application development approaches, and technical support
                capabilities to drive operational excellence.
              </p>

              {/* Core Expertise */}
              <div className='mb-12'>
                <h2 className='text-2xl font-bold text-foreground mb-6 text-center'>
                  Core Expertise
                </h2>
                <div className='flex flex-wrap justify-center gap-3'>
                  {coreExpertise.map((expertise, index) => (
                    <span
                      key={index}
                      className='px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium'
                    >
                      {expertise}
                    </span>
                  ))}
                </div>
              </div>

              {/* Professional Experience */}
              <div className='mb-12'>
                <h2 className='text-2xl font-bold text-foreground mb-6'>
                  Professional Experience
                </h2>
                <div className='space-y-8'>
                  {experienceData.map(experience => (
                    <motion.div
                      key={experience.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className='border border-border rounded-lg p-6 hover:shadow-lg transition-shadow'
                    >
                      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4'>
                        <div>
                          <h3 className='text-xl font-bold text-foreground'>
                            {experience.position}
                          </h3>
                          <p className='text-lg text-primary font-semibold'>
                            {experience.company}
                          </p>
                          <p className='text-muted-foreground'>
                            {experience.duration}
                            {experience.location && ` • ${experience.location}`}
                          </p>
                        </div>
                        <div className='mt-2 md:mt-0'>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              experience.category === 'work'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : experience.category === 'ai'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {experience.category.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className='text-muted-foreground mb-4'>
                        {experience.description}
                      </p>

                      <div className='mb-4'>
                        <h4 className='font-semibold text-foreground mb-2'>
                          Key Achievements:
                        </h4>
                        <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                          {experience.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className='font-semibold text-foreground mb-2'>
                          Technologies:
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                          {experience.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-secondary/20 text-secondary-foreground rounded text-xs'
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className='mb-12'>
                <h2 className='text-2xl font-bold text-foreground mb-6'>
                  Technical Skills
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {skillCategories.map(category => (
                    <div
                      key={category.name}
                      className='border border-border rounded-lg p-4'
                    >
                      <h3 className='text-lg font-semibold text-foreground mb-3'>
                        {category.name}
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {category.skills.map((skill, index) => (
                          <span
                            key={index}
                            className='px-2 py-1 bg-primary/10 text-primary rounded text-xs'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ExperiencePage;
