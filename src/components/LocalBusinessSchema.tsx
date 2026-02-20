import { Helmet } from 'react-helmet-async';

export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "CareConnect Malawi",
    "image": "https://res.cloudinary.com/dmpcgydyf/image/upload/v1771566755/landing-pages/careconnectlogo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Area 58",
      "addressLocality": "Lilongwe",
      "addressRegion": "Central Region",
      "addressCountry": "MW"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -13.9626,
      "longitude": 33.7741
    },
    "url": "https://careconnectmalawi.com",
    "telephone": "+265 986 227 240",
    "email": "support@careconnectmalawi.com",
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    "areaServed": [
      {"@type": "City", "name": "Lilongwe"},
      {"@type": "City", "name": "Blantyre"},
      {"@type": "City", "name": "Mzuzu"}
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
