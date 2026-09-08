import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import './transformation.css';
import './home-film.css';
import './business-entry.css';
import { PageMotion } from '@/components/site/PageMotion';

export const metadata: Metadata = {
  metadataBase: new URL('https://planeon.ai'),
  title: {
    default: 'Planeon — Enterprise Agentic Transformation',
    template: '%s · Planeon',
  },
  description:
    'Turn AI pilots into reliable business workflows with Planeon: diagnose your starting point, implement in phases and keep improving with experts alongside your team.',
  openGraph: {
    type: 'website',
    url: 'https://planeon.ai',
    siteName: 'Planeon',
    title: 'Turn AI pilots into reliable business workflows.',
    description: 'Your enterprise transformation partner. Diagnose, implement and keep improving.',
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
    title: 'Turn AI pilots into reliable business workflows.',
    description: 'Your enterprise transformation partner. Diagnose, implement and keep improving.',
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
