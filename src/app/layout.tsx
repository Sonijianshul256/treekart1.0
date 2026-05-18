import { Providers } from './providers';
import '../styles.css';
import { Layout } from '@/components/Layout';

export const metadata = {
  title: 'Treekart',
  description: 'Treekart application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
