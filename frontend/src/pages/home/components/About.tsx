import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-8">About Me</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            I'm a passionate full-stack developer with expertise in modern web technologies. 
            I love creating intuitive user experiences and building scalable applications.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">Frontend</h3>
              <p className="text-muted-foreground">React, TypeScript, Tailwind CSS</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">Backend</h3>
              <p className="text-muted-foreground">Node.js, Express, MongoDB</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">Tools</h3>
              <p className="text-muted-foreground">Git, Docker, AWS</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About; 