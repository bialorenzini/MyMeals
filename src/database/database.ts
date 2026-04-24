import * as SQLite from 'expo-sqlite';
import { Meal, MealInput } from '../types/meal';

const db = SQLite.openDatabaseSync('mymeals.db');

// Run synchronously at module load — table exists before any component mounts
db.execSync(`
  CREATE TABLE IF NOT EXISTS meals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category    TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    time        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
  );
`);

// Migration: add nutritional columns if they don't exist yet
for (const col of ['calories', 'protein', 'carbs', 'fat']) {
  try {
    db.execSync(`ALTER TABLE meals ADD COLUMN ${col} REAL NOT NULL DEFAULT 0`);
  } catch {
    // Column already exists — safe to ignore
  }
}

// Tabela de ingredientes por refeição
db.execSync(`
  CREATE TABLE IF NOT EXISTS meal_ingredients (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id   INTEGER NOT NULL,
    name      TEXT    NOT NULL,
    brand     TEXT    NOT NULL DEFAULT '',
    grams     REAL    NOT NULL DEFAULT 100,
    calories  REAL    NOT NULL DEFAULT 0,
    protein   REAL    NOT NULL DEFAULT 0,
    carbs     REAL    NOT NULL DEFAULT 0,
    fat       REAL    NOT NULL DEFAULT 0
  );
`);

/** @deprecated table is created at module load; kept for compatibility */
export function setupDatabase(): void {}

export function getAllMeals(): Meal[] {
  return db.getAllSync<Meal>(
    'SELECT * FROM meals ORDER BY date DESC, time ASC'
  );
}

export function getMealsByDate(date: string): Meal[] {
  return db.getAllSync<Meal>(
    'SELECT * FROM meals WHERE date = ? ORDER BY time ASC',
    [date]
  );
}

export function getMealById(id: number): Meal | null {
  return (
    db.getFirstSync<Meal>('SELECT * FROM meals WHERE id = ?', [id]) ?? null
  );
}

export function insertMeal(meal: MealInput): number {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO meals (name, description, category, date, time, calories, protein, carbs, fat, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      meal.name, meal.description, meal.category,
      meal.date, meal.time,
      meal.calories, meal.protein, meal.carbs, meal.fat,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateMeal(id: number, meal: MealInput): void {
  db.runSync(
    `UPDATE meals
     SET name = ?, description = ?, category = ?, date = ?, time = ?,
         calories = ?, protein = ?, carbs = ?, fat = ?
     WHERE id = ?`,
    [
      meal.name, meal.description, meal.category,
      meal.date, meal.time,
      meal.calories, meal.protein, meal.carbs, meal.fat,
      id,
    ]
  );
}

export function deleteMeal(id: number): void {
  db.runSync('DELETE FROM meals WHERE id = ?', [id]);
  db.runSync('DELETE FROM meal_ingredients WHERE meal_id = ?', [id]);
}

// ─── Ingredientes ────────────────────────────────────────────────────────────

export interface MealIngredient {
  id: number;
  meal_id: number;
  name: string;
  brand: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function getIngredientsByMealId(mealId: number): MealIngredient[] {
  return db.getAllSync<MealIngredient>(
    'SELECT * FROM meal_ingredients WHERE meal_id = ? ORDER BY id ASC',
    [mealId]
  );
}

export function replaceIngredients(
  mealId: number,
  ingredients: Omit<MealIngredient, 'id' | 'meal_id'>[]
): void {
  db.runSync('DELETE FROM meal_ingredients WHERE meal_id = ?', [mealId]);
  for (const ing of ingredients) {
    db.runSync(
      `INSERT INTO meal_ingredients (meal_id, name, brand, grams, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [mealId, ing.name, ing.brand, ing.grams, ing.calories, ing.protein, ing.carbs, ing.fat]
    );
  }
}

