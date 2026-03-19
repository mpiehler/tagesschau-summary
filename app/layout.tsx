import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tagesschau Summary',
  description: 'Zusammenfassungen der Tagesschau um 20 Uhr powered by Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
