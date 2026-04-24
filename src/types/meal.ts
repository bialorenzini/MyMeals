export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: number;
  name: string;
  description: string;
  category: MealCategory;
  date: string;       // 'YYYY-MM-DD'
  time: string;       // 'HH:MM'
  created_at: string;
}

export type MealInput = Omit<Meal, 'id' | 'created_at'>;

export const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

export const CATEGORY_EMOJI: Record<MealCategory, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export const CATEGORY_ORDER: MealCategory[] = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
];
