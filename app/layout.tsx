import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignSafari Driver Portal',
  description: 'Driver guide portal for Safari trip alerts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
