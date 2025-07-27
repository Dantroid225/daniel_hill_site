import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const AdminPage: React.FC = () => {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-8 text-center'>
            Admin Dashboard
          </h1>
          <p className='text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto'>
            Manage your portfolio content and projects.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-foreground mb-4'>
                  Projects
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Manage your portfolio projects and showcase your work.
                </p>
                <Button className='w-full'>Manage Projects</Button>
              </div>
            </Card>

            <Card>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-foreground mb-4'>
                  Messages
                </h3>
                <p className='text-muted-foreground mb-4'>
                  View and respond to contact form submissions.
                </p>
                <Button className='w-full'>View Messages</Button>
              </div>
            </Card>

            <Card>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-foreground mb-4'>
                  Settings
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Configure your portfolio settings and preferences.
                </p>
                <Button className='w-full'>Manage Settings</Button>
              </div>
            </Card>

            <Card>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-foreground mb-4'>
                  Analytics
                </h3>
                <p className='text-muted-foreground mb-4'>
                  View website analytics and visitor statistics.
                </p>
                <Button className='w-full'>View Analytics</Button>
              </div>
            </Card>

            <Card>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-foreground mb-4'>
                  Backup
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Backup and restore your portfolio data.
                </p>
                <Button className='w-full'>Manage Backup</Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
