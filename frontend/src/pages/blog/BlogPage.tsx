import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Building Modern Web Applications',
      excerpt: 'Learn about the latest trends and best practices in modern web development.',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Development',
    },
    {
      id: 2,
      title: 'The Future of React',
      excerpt: 'Exploring upcoming features and improvements in the React ecosystem.',
      date: '2024-01-10',
      readTime: '8 min read',
      category: 'React',
    },
    {
      id: 3,
      title: 'TypeScript Best Practices',
      excerpt: 'Essential TypeScript patterns and practices for better code quality.',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'TypeScript',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about web development, design, and technology.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {post.category}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <a
                        href={`/blog/${post.id}`}
                        className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                      >
                        Read More →
                      </a>
                    </div>
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

export default BlogPage; 