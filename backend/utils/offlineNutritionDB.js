/**
 * A small built-in nutrition database for common foods, used as an automatic
 * fallback when OpenAI is unavailable (no quota, rate-limited, no API key).
 * Values are per 100g (or per 100ml for liquids) — USDA-style approximations.
 * Not exhaustive by design: anything not in here still falls back to the
 * "enter macros manually" path in the UI, which always works.
 */

// { calories, protein, carbs, fat, fiber, sugar } per 100g/100ml
const FOOD_DB = {
  // ===========================
// EGGS
// ===========================
'egg white': { calories: 52, protein: 6, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7 },
'egg yolk': { calories: 322, protein: 3, carbs: 3.6, fat: 27, fiber: 0, sugar: 0.6 },

// ===========================
// CHICKEN & MEAT
// ===========================
'chicken thigh': { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0 },
'chicken leg': { calories: 214, protein: 27, carbs: 0, fat: 11, fiber: 0, sugar: 0 },
'turkey': { calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
'mutton': { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0 },
'goat meat': { calories: 143, protein: 27, carbs: 0, fat: 3, fiber: 0, sugar: 0 },
'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0 },
'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0 },

// ===========================
// FISH
// ===========================
'tilapia': { calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0, sugar: 0 },
'rohu': { calories: 97, protein: 17, carbs: 0, fat: 2.9, fiber: 0, sugar: 0 },
'catla': { calories: 111, protein: 19, carbs: 0, fat: 3.8, fiber: 0, sugar: 0 },
'bangda': { calories: 205, protein: 19, carbs: 0, fat: 14, fiber: 0, sugar: 0 },
'mackerel': { calories: 205, protein: 19, carbs: 0, fat: 14, fiber: 0, sugar: 0 },
'surmai': { calories: 139, protein: 22, carbs: 0, fat: 5, fiber: 0, sugar: 0 },
'pomfret': { calories: 123, protein: 20, carbs: 0, fat: 4, fiber: 0, sugar: 0 },
'tuna': { calories: 132, protein: 29, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
'cod': { calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0 },
'prawns': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0 },
'shrimp': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0 },

// ===========================
// DAIRY
// ===========================
'low fat milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5 },
'skim milk': { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5 },
'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
'hung curd': { calories: 97, protein: 10, carbs: 3.5, fat: 4, fiber: 0, sugar: 3.5 },
'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7 },
'buttermilk': { calories: 40, protein: 3.3, carbs: 4.8, fat: 1, fiber: 0, sugar: 4.8 },

// ===========================
// PLANT PROTEIN
// ===========================
'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6 },
'tempeh': { calories: 193, protein: 20, carbs: 9, fat: 11, fiber: 2, sugar: 0 },
'edamame': { calories: 121, protein: 12, carbs: 9, fat: 5, fiber: 5, sugar: 2 },
'soybeans': { calories: 446, protein: 36, carbs: 30, fat: 20, fiber: 9, sugar: 7 },

// ===========================
// DALS
// ===========================
'chana dal': { calories: 364, protein: 21, carbs: 61, fat: 6, fiber: 17, sugar: 11 },
'moong dal': { calories: 347, protein: 24, carbs: 63, fat: 1.2, fiber: 16, sugar: 6 },
'masoor dal': { calories: 352, protein: 25, carbs: 60, fat: 1, fiber: 11, sugar: 2 },
'urad dal': { calories: 341, protein: 25, carbs: 59, fat: 1.6, fiber: 18, sugar: 0.5 },
'rajma': { calories: 333, protein: 24, carbs: 60, fat: 1, fiber: 25, sugar: 2 },
'chickpeas': { calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17, sugar: 11 },
'black chana': { calories: 360, protein: 20, carbs: 60, fat: 5, fiber: 18, sugar: 10 },

// ===========================
// SPROUTS
// ===========================
'sprouts': { calories: 30, protein: 3, carbs: 6, fat: 0.2, fiber: 2, sugar: 4 },
'moong sprouts': { calories: 30, protein: 3, carbs: 6, fat: 0.2, fiber: 2, sugar: 4 },
'sprouted chana': { calories: 120, protein: 9, carbs: 22, fat: 2, fiber: 7, sugar: 5 },

// ===========================
// RICE
// ===========================
'basmati rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
'red rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 2, sugar: 0.3 },

// ===========================
// GRAINS
// ===========================
'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9 },
'brown bread': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sugar: 5 },
'whole wheat bread': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sugar: 5 },
'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.4, sugar: 0.6 },
'macaroni': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.4, sugar: 0.6 },
'corn': { calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4, sugar: 4.5 },

// ===========================
// FRUITS
// ===========================
'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14 },
'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16 },
'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, sugar: 6 },
'papaya': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, sugar: 8 },
'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sugar: 10 },
'kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, sugar: 9 },
'guava': { calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, sugar: 9 },
'pear': { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, sugar: 10 },
'strawberry': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9 },
'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7 },

// ===========================
// DRY FRUITS & NUTS
// ===========================
'cashews': { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, sugar: 6 },
'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 7, sugar: 2.6 },
'pistachios': { calories: 562, protein: 20, carbs: 28, fat: 45, fiber: 10, sugar: 8 },
'raisins': { calories: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 59 },
'dates': { calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8, sugar: 63 },
'figs': { calories: 249, protein: 3.3, carbs: 64, fat: 0.9, fiber: 10, sugar: 48 },

// ===========================
// SEEDS
// ===========================
'chia seeds': { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0 },
'flax seeds': { calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27, sugar: 1.5 },
'pumpkin seeds': { calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, sugar: 1.4 },
'sunflower seeds': { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 9, sugar: 2.6 },

// ===========================
// VEGETABLES
// ===========================
'cucumber': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7 },
'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
'capsicum': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
'bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
'cauliflower': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9 },

// ===========================
// PROTEIN SUPPLEMENTS
// ===========================
'whey protein': { calories: 400, protein: 80, carbs: 8, fat: 7, fiber: 0, sugar: 5 },
'protein powder': { calories: 400, protein: 80, carbs: 8, fat: 7, fiber: 0, sugar: 5 },
'mass gainer': { calories: 390, protein: 20, carbs: 70, fat: 4, fiber: 2, sugar: 10 },
};

// Approximate weight (grams) of one "piece" of common countable foods.
const PIECE_WEIGHTS = {
  egg: 50,
  'boiled egg': 50,
  'fried egg': 50,
  banana: 118,
  apple: 182,
  roti: 40,
  chapati: 40,
  bread: 30, // per slice
  orange: 131,
  potato: 170,
};

// Rough grams for non-gram units when no piece-specific weight is known.
const GENERIC_UNIT_GRAMS = {
  g: 1,
  ml: 1,
  piece: 100,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  oz: 28.35,
  serving: 100,
};

function findMatch(name) {
  const lower = name.toLowerCase().trim();
  if (FOOD_DB[lower]) return lower;
  // partial match: does the food name contain one of our known keys (or vice versa)?
  const key = Object.keys(FOOD_DB).find((k) => lower.includes(k) || k.includes(lower));
  return key || null;
}

/**
 * Returns { calories, protein, carbs, fat, fiber, sugar } for the full quantity,
 * or null if the food isn't in the offline database (caller should fall back
 * to manual entry in that case).
 */
function estimateOffline(name, quantityValue, unit) {
  const key = findMatch(name);
  if (!key) return null;

  const per100 = FOOD_DB[key];
  let grams;
  if (unit === 'piece' && PIECE_WEIGHTS[key]) {
    grams = quantityValue * PIECE_WEIGHTS[key];
  } else {
    grams = quantityValue * (GENERIC_UNIT_GRAMS[unit] ?? 1);
  }

  const factor = grams / 100;
  const round = (n) => Math.round(n * factor);

  return {
    calories: round(per100.calories),
    protein: round(per100.protein),
    carbs: round(per100.carbs),
    fat: round(per100.fat),
    fiber: round(per100.fiber),
    sugar: round(per100.sugar),
  };
}

module.exports = { estimateOffline, FOOD_DB, PIECE_WEIGHTS };
