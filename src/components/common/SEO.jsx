import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Habalyze - Transforma tus hábitos en aventuras épicas',
  description = 'Gamifica tu vida con IA, estadísticas avanzadas y una comunidad increíble. Crea hábitos, sube de nivel, desbloquea logros y alcanza tus metas con Habalyze.',
  image = 'https://i.imgur.com/habalyze-preview.png', // Placeholder - reemplazar con imagen real
  url = 'https://habalyze.com',
  type = 'website',
  keywords = 'hábitos, productividad, gamificación, coach IA, estadísticas, seguimiento de hábitos, desarrollo personal, metas, objetivos, motivación',
  author = 'Habalyze',
  twitterHandle = '@habalyze'
}) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="theme-color" content="#8B5CF6" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Habalyze" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:site" content={twitterHandle} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="Spanish" />
      <link rel="canonical" href={url} />
      
      {/* PWA - Enhanced */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Habalyze" />
      <meta name="application-name" content="Habalyze" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#9333ea" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#7c3aed" media="(prefers-color-scheme: dark)" />
      <meta name="msapplication-TileColor" content="#9333ea" />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Habalyze",
          "description": description,
          "url": url,
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web, iOS, Android",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          }
        })}
      </script>
    </Helmet>
  );
}