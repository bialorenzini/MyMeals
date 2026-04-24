export interface FoodItem {
  name: string;
  brand: string;
  calories: number; // kcal per 100g
  protein: number;  // g per 100g
  carbs: number;    // g per 100g
  fat: number;      // g per 100g
}

// Servidor brasileiro do Open Food Facts — produtos em português, infra separada
const BR_URL    = 'https://br.openfoodfacts.org/cgi/search.pl';
const WORLD_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

function buildParams(query: string): string {
  return new URLSearchParams({
    search_terms:  query,
    search_simple: '1',
    action:        'process',
    json:          '1',
    page_size:     '25',
    fields:        'product_name,brands,nutriments',
  }).toString();
}

function parseProducts(products: any[]): FoodItem[] {
  return products
    .filter((p) => {
      if (!p.product_name) return false;
      const n = p.nutriments ?? {};
      return n['energy-kcal_100g'] != null || n['energy_100g'] != null;
    })
    .map((p) => {
      const n = p.nutriments ?? {};
      const kcal =
        n['energy-kcal_100g'] ??
        Math.round((n['energy_100g'] ?? 0) / 4.184);
      return {
        name:     p.product_name as string,
        brand:    (p.brands as string) ?? '',
        calories: Math.round(kcal),
        protein:  Math.round((n['proteins_100g']      ?? 0) * 10) / 10,
        carbs:    Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
        fat:      Math.round((n['fat_100g']           ?? 0) * 10) / 10,
      };
    })
    .slice(0, 12);
}

async function fetchProducts(url: string, query: string): Promise<any[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${url}?${buildParams(query)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.products ?? [];
  } finally {
    clearTimeout(timer);
  }
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  // 1ª tentativa: servidor BR (produtos com nomes em português)
  try {
    const products = await fetchProducts(BR_URL, query);
    const parsed = parseProducts(products);
    if (parsed.length > 0) return parsed;
  } catch {
    // segue para o fallback
  }

  // 2ª tentativa: servidor mundial sem filtro de país
  const products = await fetchProducts(WORLD_URL, query);
  return parseProducts(products);
}
