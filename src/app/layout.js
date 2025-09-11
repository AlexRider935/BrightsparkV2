import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

export const metadata = {
  metadataBase: new URL('https://www.brightspark.space'),

  title: {
    template: '%s | Brightspark Institute',
    default: 'Brightspark Institute',
  },
  description: "The premier coaching institute for students aiming for the pinnacle of academic success.",

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // --- THIS LINE IS REMOVED ---
  // manifest: '/manifest.json', 

  themeColor: '#111827',
};

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