import React from 'react';
import ProjectManagement from '@/components/admin/ProjectManagement';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className='min-h-screen pt-20 bg-background'>
      <div className='flex'>
        <div className='w-64 bg-card border-r border-border'>
          <div className='p-4'>
            <h2 className='text-lg font-semibold text-foreground'>
              Admin Panel
            </h2>
            <nav className='mt-4 space-y-2'>
              <a
                href='/admin/projects'
                className='block p-2 text-sm text-muted-foreground hover:text-foreground'
              >
                Projects
              </a>
              <a
                href='/admin/contacts'
                className='block p-2 text-sm text-muted-foreground hover:text-foreground'
              >
                Contacts
              </a>
              <a
                href='/admin/settings'
                className='block p-2 text-sm text-muted-foreground hover:text-foreground'
              >
                Settings
              </a>
            </nav>
          </div>
        </div>
        <main className='flex-1 p-6'>
          <ProjectManagement />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
