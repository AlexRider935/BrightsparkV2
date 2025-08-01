import { Poppins } from "next/font/google"; // Or your chosen font
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

export const metadata = {
  title: "Brightspark Institute | A New Standard of Excellence",
  description: "The premier institute for students aiming for the pinnacle of academic success.",
};

// This root layout is now clean and wraps ALL routes
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} website-bg font-sans text-light-slate antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}