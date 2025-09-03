import Navbar from "@/app/(site)/components/Navbar";
import Footer from "@/app/(site)/components/Footer";

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
