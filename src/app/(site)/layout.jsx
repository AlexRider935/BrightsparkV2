import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// This layout is ONLY for the main marketing site
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
