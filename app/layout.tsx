import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import './transformation.css';
import { PageMotion } from '@/components/site/PageMotion';

export const metadata: Metadata = {
  metadataBase: new URL('https://planeon.ai'),
  title: {
    default: 'Planeon — The Enterprise MAS Blueprint',
    template: '%s · Planeon',
  },
  description:
    'A vendor-neutral blueprint for making enterprise multi-agent systems operable, governable, and trustworthy.',
  openGraph: {
    type: 'website',
    url: 'https://planeon.ai',
    siteName: 'Planeon',
    title: 'The model was never the hard part.',
    description: 'The enterprise MAS blueprint · 16 harnesses · 43 exchanges',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Planeon enterprise MAS blueprint',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The model was never the hard part.',
    description: 'The enterprise MAS blueprint · 16 harnesses · 43 exchanges',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageMotion />
        <a className="skip-link" href="#page-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
