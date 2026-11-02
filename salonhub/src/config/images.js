// Single source of truth for all imagery with curated high-definition photography and local asset fallbacks.
import localHero from '@/assets/images/hero.jpg'
import localTextureDark from '@/assets/images/texture-dark.jpg'
import localAbout from '@/assets/images/about.jpg'
import localCta from '@/assets/images/cta.jpg'
import localHair from '@/assets/images/cat-hair.jpg'
import localColour from '@/assets/images/cat-colour.jpg'
import localSkin from '@/assets/images/cat-skin.jpg'
import localNails from '@/assets/images/cat-nails.jpg'
import localGrooming from '@/assets/images/cat-grooming.jpg'
import localAmara from '@/assets/images/staff-amara.jpg'
import localZain from '@/assets/images/staff-zain.jpg'
import localHira from '@/assets/images/staff-hira.jpg'
import localBilal from '@/assets/images/staff-bilal.jpg'

export const images = {
  // Hero composition imagery (matching reference image)
  heroFemale: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
  heroFemaleFallback: localHero,
  heroMale: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=85',
  heroMaleFallback: localGrooming,
  salonArchInterior: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85',
  salonInteriorMain: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=85',
  salonInteriorMainFallback: localAbout,

  // Trust indicator avatars
  avatars: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  ],

  // Service horizontal strip & category images
  serviceStrip: [
    {
      id: 'women-hair',
      category: 'Hair',
      title: "Women's Hair Care",
      subtitle: 'Style, colour & treatment',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      fallback: localHair,
    },
    {
      id: 'men-grooming',
      category: 'Grooming',
      title: "Men's Grooming",
      subtitle: 'Haircuts, beard care & more',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      fallback: localGrooming,
    },
    {
      id: 'skin-care',
      category: 'Skin',
      title: 'Skin Care',
      subtitle: 'Radiant, healthy skin',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      fallback: localSkin,
    },
    {
      id: 'nail-care',
      category: 'Nails',
      title: 'Nail Care',
      subtitle: 'Clean, stylish & elegant',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
      fallback: localNails,
    },
    {
      id: 'hair-colour',
      category: 'Colour',
      title: 'Colour & Balayage',
      subtitle: 'Tones, gloss & highlights',
      image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80',
      fallback: localColour,
    },
    {
      id: 'relax-refresh',
      category: 'Relax',
      title: 'Relax & Refresh',
      subtitle: 'Massage & spa rituals',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
      fallback: localColour,
    },
  ],

  categories: {
    Hair: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    Colour: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
    Skin: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    Nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    Grooming: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    Relax: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  },

  categoryFallbacks: {
    Hair: localHair,
    Colour: localColour,
    Skin: localSkin,
    Nails: localNails,
    Grooming: localGrooming,
    Relax: localCta,
  },

  staff: {
    amara: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    zain: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    hira: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    bilal: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },

  staffFallbacks: {
    amara: localAmara,
    zain: localZain,
    hira: localHira,
    bilal: localBilal,
  },

  about: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85',
  cta: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=85',
  textureDark: localTextureDark,
  hero: localHero,
}
