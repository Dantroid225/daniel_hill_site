const { pool } = require('../config/database');

async function generateSitemap() {
  const baseUrl = process.env.BASE_URL || 'https://daniel-hill.com';

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/experience', priority: '0.8', changefreq: 'monthly' },
    { url: '/projects', priority: '0.8', changefreq: 'weekly' },
    { url: '/artshow', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'weekly' },
  ];

  // Dynamic portfolio items
  let portfolioItems = [];
  try {
    const [rows] = await pool.execute(
      'SELECT id, updated_at FROM portfolio_items WHERE status = "published"'
    );
    portfolioItems = rows;
  } catch (error) {
    console.error('Error fetching portfolio items for sitemap:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
  ${portfolioItems
    .map(
      item => `
  <url>
    <loc>${baseUrl}/projects/${item.id}</loc>
    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return sitemap;
}

module.exports = { generateSitemap };
