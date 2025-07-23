import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

interface Project {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  technologies: string[];
  category: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    technologies: [],
    category: '',
    display_order: 0,
    status: 'draft',
    featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [technologyInput, setTechnologyInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        technologies: Array.isArray(project.technologies)
          ? project.technologies
          : typeof project.technologies === 'string'
            ? JSON.parse(project.technologies)
            : [],
      });
      if (project.image_url) {
        setImagePreview(project.image_url);
      }
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.technologies.length === 0) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload
    const submitFormData = new FormData();

    // Add all form fields
    submitFormData.append('title', formData.title);
    submitFormData.append('description', formData.description);
    submitFormData.append('project_url', formData.project_url);
    submitFormData.append('category', formData.category);
    submitFormData.append('display_order', formData.display_order.toString());
    submitFormData.append('status', formData.status);
    submitFormData.append('featured', formData.featured.toString());
    submitFormData.append(
      'technologies',
      JSON.stringify(formData.technologies)
    );

    // Add image file if selected
    if (selectedFile) {
      submitFormData.append('image', selectedFile);
    }

    // Call onSave with FormData
    onSave(submitFormData);
  };

  const handleInputChange = (field: keyof Project, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTechnology = () => {
    if (
      technologyInput.trim() &&
      !formData.technologies.includes(technologyInput.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, technologyInput.trim()],
      }));
      setTechnologyInput('');
      if (errors.technologies) {
        setErrors(prev => ({ ...prev, technologies: '' }));
      }
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create a preview URL for display
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-foreground mb-6'>
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-foreground mb-2'
            >
              Project Title *
            </label>
            <Input
              id='title'
              type='text'
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder='Enter project title'
              error={errors.title}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-foreground mb-2'
            >
              Description *
            </label>
            <TextArea
              id='description'
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder='Enter project description'
              rows={4}
              error={errors.description}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor='category'
              className='block text-sm font-medium text-foreground mb-2'
            >
              Category *
            </label>
            <Input
              id='category'
              type='text'
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              placeholder='e.g., Web Development, Mobile App, etc.'
              error={errors.category}
            />
          </div>

          {/* Project URL */}
          <div>
            <label
              htmlFor='project_url'
              className='block text-sm font-medium text-foreground mb-2'
            >
              Project URL
            </label>
            <Input
              id='project_url'
              type='url'
              value={formData.project_url}
              onChange={e => handleInputChange('project_url', e.target.value)}
              placeholder='https://example.com'
            />
          </div>

          {/* Technologies */}
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              Technologies *
            </label>
            <div className='flex gap-2 mb-2'>
              <Input
                type='text'
                value={technologyInput}
                onChange={e => setTechnologyInput(e.target.value)}
                placeholder='Add technology'
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), addTechnology())
                }
              />
              <Button
                type='button'
                onClick={addTechnology}
                disabled={!technologyInput.trim()}
                size='sm'
              >
                Add
              </Button>
            </div>
            {errors.technologies && (
              <p className='text-red-500 text-sm mt-1'>{errors.technologies}</p>
            )}
            <div className='flex flex-wrap gap-2'>
              {formData.technologies.map((tech, index) => (
                <span
                  key={index}
                  className='px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2'
                >
                  {tech}
                  <button
                    type='button'
                    onClick={() => removeTechnology(tech)}
                    className='text-primary hover:text-primary/80'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor='image'
              className='block text-sm font-medium text-foreground mb-2'
            >
              Project Image
            </label>
            <input
              id='image'
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
            />
            {imagePreview && (
              <div className='mt-2'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='w-32 h-32 object-cover rounded border'
                />
              </div>
            )}
          </div>

          {/* Status and Featured */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='status'
                className='block text-sm font-medium text-foreground mb-2'
              >
                Status
              </label>
              <select
                id='status'
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className='w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value='draft'>Draft</option>
                <option value='published'>Published</option>
                <option value='archived'>Archived</option>
              </select>
            </div>
            <div>
              <label className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={formData.featured}
                  onChange={e =>
                    handleInputChange('featured', e.target.checked)
                  }
                  className='rounded border-border text-primary focus:ring-2 focus:ring-primary'
                />
                <span className='text-sm font-medium text-foreground'>
                  Featured Project
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex justify-end gap-4 pt-4 border-t border-border'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : project
                  ? 'Update Project'
                  : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ProjectForm;
