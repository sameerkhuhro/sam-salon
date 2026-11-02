// SalonHub Service Catalog for Men and Women
export const categories = ['Hair', 'Grooming', 'Skin', 'Colour', 'Nails', 'Relax']

export const services = [
  // Hair & Styling
  {
    id: 's1',
    category: 'Hair',
    name: 'Signature Cut & Style',
    description: 'Detailed consultation, hair wash, precision bespoke haircut and editorial blow-dry finish.',
    price: 2500,
    durationMin: 60,
    gender: 'Unisex',
  },
  {
    id: 's2',
    category: 'Hair',
    name: 'Blow-dry & Glamour Finish',
    description: 'Smooth, voluminous or textured curling styled for everyday luxury or special events.',
    price: 1500,
    durationMin: 45,
    gender: 'Women',
  },
  {
    id: 's3',
    category: 'Hair',
    name: 'Keratin Protein Smoothing',
    description: 'Intense anti-frizz formula with long-lasting silkiness, mirror shine and humidity defense.',
    price: 12000,
    durationMin: 150,
    gender: 'Women',
  },

  // Men's Grooming
  {
    id: 's10',
    category: 'Grooming',
    name: "Men's Precision Fade & Beard Trim",
    description: 'Tailored skin/taper fade haircut paired with hot-towel beard shaping and razor lining.',
    price: 1800,
    durationMin: 45,
    gender: 'Men',
  },
  {
    id: 's11',
    category: 'Grooming',
    name: 'Executive Hot Towel Shave',
    description: 'Pre-shave essential oils, dual hot towels, traditional straight-razor shave and soothing balm.',
    price: 1200,
    durationMin: 30,
    gender: 'Men',
  },
  {
    id: 's12',
    category: 'Grooming',
    name: "Gentleman's Charcoal Facial",
    description: 'Deep pore purification, beard conditioning steam treatment, and revitalizing face massage.',
    price: 3200,
    durationMin: 45,
    gender: 'Men',
  },

  // Skincare & Aesthetics
  {
    id: 's6',
    category: 'Skin',
    name: 'Signature Glow Facial',
    description: 'Deep botanical cleanse, ultrasound peeling, firming facial massage and 24k gold radiance mask.',
    price: 4500,
    durationMin: 60,
    gender: 'Unisex',
  },
  {
    id: 's7',
    category: 'Skin',
    name: 'Bridal & Occasion Makeup',
    description: 'Long-wear luxury bridal makeup, contouring, premium lash application and setting veil.',
    price: 25000,
    durationMin: 120,
    gender: 'Women',
  },
  {
    id: 's13',
    category: 'Skin',
    name: 'Hydra-Infusion Facial',
    description: 'Intensive hydration infusion using hyaluronic acid serum and cooling cryo-globe therapy.',
    price: 6000,
    durationMin: 60,
    gender: 'Unisex',
  },

  // Colour & Highlights
  {
    id: 's4',
    category: 'Colour',
    name: 'Full Color & Gloss',
    description: 'All-over single process tone, roots-to-ends coverage, bonded gloss treatment.',
    price: 7000,
    durationMin: 120,
    gender: 'Unisex',
  },
  {
    id: 's5',
    category: 'Colour',
    name: 'Signature Balayage & Toning',
    description: 'Custom hand-painted multidimensional blonde or caramel highlights with glazed finish.',
    price: 15000,
    durationMin: 180,
    gender: 'Women',
  },

  // Nails
  {
    id: 's8',
    category: 'Nails',
    name: 'Classic Luxury Manicure',
    description: 'Nail shaping, gentle cuticle care, exfoliating scrub, hand massage and gel polish.',
    price: 1800,
    durationMin: 45,
    gender: 'Unisex',
  },
  {
    id: 's9',
    category: 'Nails',
    name: 'Deluxe Spa Pedicure',
    description: 'Aromatherapy foot soak, callus refining, sea-salt scrub, restorative massage and polish.',
    price: 2500,
    durationMin: 60,
    gender: 'Unisex',
  },

  // Relaxation & Spa
  {
    id: 's14',
    category: 'Relax',
    name: 'Stress Relief Neck & Shoulder Massage',
    description: 'Therapeutic pressure-point massage using organic herbal oils to dissolve tension.',
    price: 3500,
    durationMin: 40,
    gender: 'Unisex',
  },
  {
    id: 's15',
    category: 'Relax',
    name: 'Full Body Aroma Revitalizer',
    description: 'Holistic deep-tissue wellness massage that balances body and mind in private luxury suite.',
    price: 6500,
    durationMin: 60,
    gender: 'Unisex',
  },
]

export const getService = (id) => services.find((s) => s.id === id)
