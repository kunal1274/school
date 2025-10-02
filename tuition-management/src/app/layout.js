import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: "Tuition Management System",
  description: "A comprehensive tuition and insurance management system",
  icons: {
    icon: "/next.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

