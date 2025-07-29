import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { validateEmail, validateRequired } from '@/utils/validation';
import api from '@/services/api';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Name is required';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!validateRequired(formData.message)) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/contact/submit', formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        console.error('Form submission failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='text-center p-8'
      >
        <h3 className='text-2xl font-bold text-primary mb-4'>Message Sent!</h3>
        <p className='text-muted-foreground mb-4'>
          Thank you for your message. I'll get back to you soon!
        </p>
        <Button onClick={() => setSuccess(false)}>Send Another Message</Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className='space-y-6'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Input
          label='Name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label='Email'
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>

      <Input
        label='Subject'
        name='subject'
        value={formData.subject}
        onChange={handleChange}
        error={errors.subject}
        required
      />

      <TextArea
        label='Message'
        name='message'
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        rows={5}
        required
      />

      <Button type='submit' loading={loading} className='w-full'>
        Send Message
      </Button>
    </motion.form>
  );
};

export default ContactForm;
