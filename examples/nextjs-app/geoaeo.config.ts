import { defineConfig } from 'geoaeo';

export const siteConfig = defineConfig({
  siteName: 'GeoWeather',
  siteUrl: 'https://geoweather.example.com',
  description: 'Weather forecasts and climate data for every location on Earth.',
  platforms: ['Web', 'iOS', 'Android'],
  tools: [
    {
      name: '7-day forecast',
      url: '/tools/7-day-forecast',
      description: 'Get a seven-day weather forecast for any city.',
    },
    {
      name: 'Radar map',
      url: '/tools/radar-map',
      description: 'Interactive precipitation radar for your region.',
    },
    {
      name: 'Climate comparison',
      url: '/tools/climate-comparison',
      description: 'Compare average temperatures and rainfall across cities.',
    },
  ],
  plans: [
    { name: 'Free', price: 0, description: 'Current conditions and 3-day forecast.' },
    { name: 'Pro', price: 6, description: '7-day forecast, radar, and alerts.' },
    { name: 'Enterprise', price: 49, description: 'API access and custom integrations.' },
  ],
  faq: [
    { question: 'Is the weather data real-time?', answer: 'Yes. Data refreshes every 15 minutes from national weather services.' },
    { question: 'Which locations are supported?', answer: 'Every populated place on Earth — over 3 million locations.' },
    { question: 'Do you offer an API?', answer: 'Yes, on the Enterprise plan. See the pricing page for details.' },
  ],
  pages: ['pricing', 'faq', 'about', 'privacy'],
});

export default siteConfig;