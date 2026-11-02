import {
  Scissors,
  Palette,
  UserRound,
  Sparkles,
  Hand,
  Flower2,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  Hair: Scissors,
  Colour: Palette,
  Color: Palette,
  Grooming: UserRound,
  Skin: Sparkles,
  Nails: Hand,
  Relax: Flower2,
}

export function getCategoryIcon(categoryName) {
  if (!categoryName) return Sparkles
  return CATEGORY_ICONS[categoryName] || Sparkles
}

export default function CategoryIcon({ category, size = 16, className = '', strokeWidth = 1.75 }) {
  const IconComponent = getCategoryIcon(category)
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />
}

