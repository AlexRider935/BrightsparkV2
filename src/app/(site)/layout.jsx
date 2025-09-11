import Navbar from "@/app/(site)/components/Navbar";
import Footer from "@/app/(site)/components/Footer";

// --- SEO: Metadata for the entire site ---
export const metadata = {
  // Define a template for page titles. Sub-pages will prepend their title.
  title: {
    template: "%s | Brightspark Institute",
    default: "Brightspark Institute | Top Science & Maths Coaching in Bhiwadi",
  },
  description:
    "Brightspark Institute offers expert coaching for students in Bhiwadi. Personalized attention and concept-driven learning for guaranteed results.",
  // Add your Google Search Console verification code here once you have it
  other: {
    "google-site-verification": "8uh7MX5auJY7-XOFjrSvVpwO9kcu7r4r5Ey6qbSbgj0",
  },
};

// --- SEO: Structured Data (Schema) for Google ---
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Brightspark Institute",
  url: "https://www.brightspark.space",
  logo: "https://www.brightspark.space/logo1.svg", // Main logo URL
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-637-527-2508",
    contactType: "Customer Service",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "4th Floor, THD Garden Club House, Thada",
    addressLocality: "Bhiwadi",
    addressRegion: "Rajasthan",
    postalCode: "301707",
    addressCountry: "IN",
  },
  sameAs: [
    // Add your social media links here
    "https://www.instagram.com/brightspark_institute23",
  ],
};

// This layout is ONLY for the main marketing site
export default function SiteLayout({ children }) {
  return (
    // The <html> and <body> tags are handled by Next.js's root layout.
    // We only need the fragment here for the components.
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
