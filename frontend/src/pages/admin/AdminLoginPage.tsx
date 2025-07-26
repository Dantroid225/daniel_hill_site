import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);

    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }

    setIsLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card>
          <div className='p-8'>
            <h1 className='text-2xl font-bold text-foreground mb-6 text-center'>
              Admin Login
            </h1>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-foreground mb-2'
                >
                  Email
                </label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder='admin@danielhill.dev'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-foreground mb-2'
                >
                  Password
                </label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder='Enter your password'
                />
              </div>

              {error && (
                <div className='text-red-500 text-sm text-center'>{error}</div>
              )}

              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
