import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Daniel Hill - Full Stack Developer & AI Specialist',
  description = 'Portfolio of Daniel Hill, a full-stack developer specializing in React, TypeScript, Node.js, and AI development.',
  keywords = 'Daniel Hill, Full Stack Developer, React, TypeScript, Node.js, AI Development, Portfolio',
  canonical,
  ogImage = '/og-image.jpg',
  structuredData,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://daniel-hill.com';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel='canonical' href={fullCanonical} />

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={`${baseUrl}${ogImage}`} />
      <meta property='og:url' content={fullCanonical} />
      <meta property='og:type' content='website' />

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${baseUrl}${ogImage}`} />

      {/* Structured Data */}
      {structuredData && (
        <script type='application/ld+json'>
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
