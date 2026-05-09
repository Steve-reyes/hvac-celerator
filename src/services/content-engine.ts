const CTA_TEMPLATES: Record<string, string[]> = {
  "AC Repair": [
    "Schedule your AC repair today!",
    "Beat the heat — call now for fast AC repair.",
    "Don't sweat it — expert AC repair is just a call away.",
  ],
  "HVAC Installation": [
    "Upgrade your system — get a free installation quote.",
    "Ready for year-round comfort? Book your HVAC install today.",
    "New system, lower bills. Schedule your consultation now.",
  ],
  "Emergency Service": [
    "24/7 emergency service available — call us now!",
    "HVAC emergency? We're on it. Call our hotline.",
    "Don't wait — emergency HVAC service available 24/7.",
  ],
  Maintenance: [
    "Protect your investment — book a maintenance plan today.",
    "Stay comfortable all year — sign up for preventative maintenance.",
    "Avoid breakdowns — schedule your HVAC tune-up now.",
  ],
  "Indoor Air Quality": [
    "Breathe cleaner air — book your IAQ assessment today.",
    "Improve your indoor air quality — call for a free test.",
    "Dust, pollen, pollutants — get pure air with our solutions.",
  ],
}

const FALLBACK_CTAS = [
  "Call us today for a free estimate!",
  "Book your service appointment online now.",
  "Contact our team for expert HVAC solutions.",
]

export function generateCTAService(service: string): string {
  const normalized = Object.keys(CTA_TEMPLATES).find(
    (k) => service.toLowerCase().includes(k.toLowerCase())
  )
  const options = normalized ? CTA_TEMPLATES[normalized] : FALLBACK_CTAS
  return options[Math.floor(Math.random() * options.length)]
}

export function generateGBPPost(service: string, city: string): { headline: string; body: string; cta: string } {
  const cta = generateCTAService(service)
  const headline = `Professional ${service} Services in ${city}`
  const body = `Looking for reliable ${service.toLowerCase()} in ${city}? Our team of certified HVAC professionals delivers top-quality service with fast response times and competitive pricing. Serving ${city} and the surrounding areas with excellence you can trust.`

  return { headline, body, cta }
}
