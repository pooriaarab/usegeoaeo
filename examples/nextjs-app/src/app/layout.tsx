import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | GeoWeather', default: 'GeoWeather' },
  description: 'Weather forecasts and climate data for every location on Earth.',
  openGraph: {
    title: 'GeoWeather',
    description: 'Weather forecasts and climate data for every location on Earth.',
    siteName: 'GeoWeather',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}