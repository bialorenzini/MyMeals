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
    `INSERT INTO meals (name, description, category, date, time, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [meal.name, meal.description, meal.category, meal.date, meal.time, now]
  );
  return result.lastInsertRowId;
}

export function updateMeal(id: number, meal: MealInput): void {
  db.runSync(
    `UPDATE meals
     SET name = ?, description = ?, category = ?, date = ?, time = ?
     WHERE id = ?`,
    [meal.name, meal.description, meal.category, meal.date, meal.time, id]
  );
}

export function deleteMeal(id: number): void {
  db.runSync('DELETE FROM meals WHERE id = ?', [id]);
}
