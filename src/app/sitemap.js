/**
 * Generates the sitemap for the Brightspark Institute website.
 * This file tells search engines which pages are important and available for crawling.
 *
 * @returns {Array<Object>} An array of sitemap entry objects.
 */
export default function sitemap() {
  const baseUrl = 'https://www.brightspark.space'; // Replace with your final domain if different

  // These are the primary, public-facing pages of your website
  // identified from your src/app/(site) directory structure.
  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0 },
    { url: `${baseUrl}/about`, priority: 0.8 },
    { url: `${baseUrl}/courses`, priority: 0.8 },
    { url: `${baseUrl}/contact`, priority: 0.7 },
  ];

  // The login page is also an important entry point for users
  const portalPages = [
    { url: `${baseUrl}/portal/login`, priority: 0.5 },
  ];

  const allPages = [...staticPages, ...portalPages];

  return allPages.map((page) => ({
    url: page.url,
    lastModified: new Date().toISOString(), // Use current date for last modified
    changeFrequency: 'monthly', // How often the content is likely to change
    priority: page.priority,      // The importance of this page relative to others
  }));
}
