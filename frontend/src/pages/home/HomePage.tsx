import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import SEOHead from '@/components/seo/SEOHead';

const HomePage: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Daniel Hill',
    jobTitle: 'Full Stack Developer',
    description:
      'Full-stack developer specializing in React, TypeScript, Node.js, and AI development',
    url: 'https://daniel-hill.com',
    sameAs: ['https://github.com/dantroid225'],
  };

  return (
    <>
      <SEOHead
        title='Daniel Hill - Full Stack Developer & AI Specialist'
        description='Portfolio of Daniel Hill, a full-stack developer specializing in React, TypeScript, Node.js, and AI development. View projects, experience, and contact information.'
        canonical='/'
        structuredData={structuredData}
      />
      <div className='min-h-screen'>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </div>
    </>
  );
};

export default HomePage;
