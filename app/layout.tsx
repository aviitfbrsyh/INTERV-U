import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', style: 'italic' });

export const metadata: Metadata = {
  title: 'Intervyou | AI Interview Simulator',
  description: 'Transformasi karir melalui simulasi wawancara profesional bertenaga AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    var originalFetch = window.fetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return originalFetch; },
                      set: function() { console.warn('Blocked attempt to overwrite window.fetch'); },
                      configurable: true
                    });
                  }
                  if (typeof Element !== 'undefined') {
                    var origSetAttr = Element.prototype.setAttribute;
                    Element.prototype.setAttribute = function(name, value) {
                      if (name === 'bis_skin_checked') return;
                      return origSetAttr.call(this, name, value);
                    };
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-black font-sans selection:bg-blue-500/30">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
