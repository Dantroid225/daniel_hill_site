import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const Projects: React.FC = () => {
  return (
    <section className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-8">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Here are some of my recent projects. Each one represents a unique challenge and learning experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Project cards will be added here */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Project details will be added here.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">React</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">TypeScript</span>
              </div>
            </motion.div>
          </div>

          <Link
            to={ROUTES.PROJECTS}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects; 