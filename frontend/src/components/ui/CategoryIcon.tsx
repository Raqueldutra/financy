import {
  Briefcase,
  Car,
  Heart,
  PiggyBank,
  ShoppingCart,
  Ticket,
  Gift,
  UtensilsCrossed,
  TrendingUp,
  Home,
  Package,
  Scissors,
  BookOpen,
  ShoppingBag,
  Book,
  ClipboardList,
  Tag,
  type LucideIcon,
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  car: Car,
  heart: Heart,
  'piggy-bank': PiggyBank,
  'shopping-cart': ShoppingCart,
  ticket: Ticket,
  gift: Gift,
  utensils: UtensilsCrossed,
  'trending-up': TrendingUp,
  home: Home,
  package: Package,
  scissors: Scissors,
  'book-open': BookOpen,
  'shopping-bag': ShoppingBag,
  book: Book,
  clipboard: ClipboardList,
  tag: Tag,
}

export const ICON_LIST = [
  'briefcase',
  'car',
  'heart',
  'piggy-bank',
  'shopping-cart',
  'ticket',
  'gift',
  'utensils',
  'trending-up',
  'home',
  'package',
  'scissors',
  'book-open',
  'shopping-bag',
  'book',
  'clipboard',
]

export const CATEGORY_COLORS = [
  '#16A34A',
  '#2563EB',
  '#7C3AED',
  '#EC4899',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
]

interface CategoryIconBadgeProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { wrapper: 'w-8 h-8 rounded-lg', iconSize: 15 },
  md: { wrapper: 'w-10 h-10 rounded-xl', iconSize: 18 },
  lg: { wrapper: 'w-12 h-12 rounded-xl', iconSize: 22 },
}

export function CategoryIconBadge({ icon, color, size = 'md' }: CategoryIconBadgeProps) {
  const Icon = ICON_MAP[icon] ?? Tag
  const { wrapper, iconSize } = sizeConfig[size]

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${wrapper}`}
      style={{ backgroundColor: color + '25', color }}
    >
      <Icon size={iconSize} />
    </div>
  )
}

export function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: color + '25', color }}
    >
      {name}
    </span>
  )
}
