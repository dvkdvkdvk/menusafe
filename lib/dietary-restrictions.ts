// Comprehensive list of dietary restrictions and allergens
export interface DietaryRestriction {
  id: string
  name: string
  description: string
  category: 'allergen' | 'intolerance' | 'lifestyle' | 'medical'
  icon: string
  keywords: string[] // Words to look for in menu items
}

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  // Common Allergens (FDA Big 9)
  {
    id: 'gluten',
    name: 'Gluten',
    description: 'Wheat, barley, rye, and related grains',
    category: 'allergen',
    icon: '🌾',
    keywords: ['wheat', 'barley', 'rye', 'flour', 'bread', 'pasta', 'gluten', 'seitan', 'couscous', 'bulgur', 'semolina', 'spelt', 'farro', 'beer', 'malt', 'breaded', 'crusted', 'battered']
  },
  {
    id: 'dairy',
    name: 'Dairy / Lactose',
    description: 'Milk, cheese, butter, and dairy products',
    category: 'allergen',
    icon: '🥛',
    keywords: ['milk', 'cheese', 'cream', 'butter', 'yogurt', 'lactose', 'dairy', 'whey', 'casein', 'ghee', 'ice cream', 'custard', 'béchamel', 'alfredo', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'ricotta', 'mascarpone', 'sour cream', 'crème']
  },
  {
    id: 'peanuts',
    name: 'Peanuts',
    description: 'Peanuts and peanut-derived products',
    category: 'allergen',
    icon: '🥜',
    keywords: ['peanut', 'groundnut', 'arachis', 'satay', 'pad thai']
  },
  {
    id: 'tree_nuts',
    name: 'Tree Nuts',
    description: 'Almonds, cashews, walnuts, pecans, etc.',
    category: 'allergen',
    icon: '🌰',
    keywords: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'chestnut', 'pine nut', 'praline', 'marzipan', 'nougat', 'gianduja']
  },
  {
    id: 'shellfish',
    name: 'Shellfish',
    description: 'Shrimp, crab, lobster, and crustaceans',
    category: 'allergen',
    icon: '🦐',
    keywords: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'crawfish', 'langoustine', 'scampi', 'shellfish', 'crustacean']
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'All fish and fish-derived products',
    category: 'allergen',
    icon: '🐟',
    keywords: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'anchovy', 'sardine', 'mackerel', 'trout', 'bass', 'snapper', 'swordfish', 'mahi', 'grouper', 'fish sauce', 'worcestershire']
  },
  {
    id: 'eggs',
    name: 'Eggs',
    description: 'Eggs and egg-derived products',
    category: 'allergen',
    icon: '🥚',
    keywords: ['egg', 'mayonnaise', 'mayo', 'aioli', 'meringue', 'custard', 'hollandaise', 'béarnaise', 'quiche', 'frittata', 'omelette', 'scrambled', 'poached', 'fried egg', 'egg wash']
  },
  {
    id: 'soy',
    name: 'Soy',
    description: 'Soybeans and soy-derived products',
    category: 'allergen',
    icon: '🫘',
    keywords: ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce', 'tamari', 'teriyaki', 'soybean']
  },
  {
    id: 'sesame',
    name: 'Sesame',
    description: 'Sesame seeds and sesame oil',
    category: 'allergen',
    icon: '⚪',
    keywords: ['sesame', 'tahini', 'hummus', 'halvah', 'gomashio', 'sesame oil']
  },
  
  // Additional Allergens
  {
    id: 'mustard',
    name: 'Mustard',
    description: 'Mustard seeds and mustard products',
    category: 'allergen',
    icon: '🟡',
    keywords: ['mustard', 'dijon', 'honey mustard']
  },
  {
    id: 'celery',
    name: 'Celery',
    description: 'Celery and celeriac',
    category: 'allergen',
    icon: '🥬',
    keywords: ['celery', 'celeriac', 'celery salt', 'celery seed']
  },
  {
    id: 'lupin',
    name: 'Lupin',
    description: 'Lupin beans and flour',
    category: 'allergen',
    icon: '🌸',
    keywords: ['lupin', 'lupine', 'lupini']
  },
  {
    id: 'mollusks',
    name: 'Mollusks',
    description: 'Clams, mussels, oysters, scallops, squid',
    category: 'allergen',
    icon: '🦪',
    keywords: ['clam', 'mussel', 'oyster', 'scallop', 'squid', 'calamari', 'octopus', 'snail', 'escargot', 'mollusk', 'abalone']
  },
  {
    id: 'sulfites',
    name: 'Sulfites',
    description: 'Sulfur dioxide and sulfites',
    category: 'allergen',
    icon: '🍷',
    keywords: ['sulfite', 'sulphite', 'wine', 'dried fruit']
  },
  
  // Intolerances
  {
    id: 'fructose',
    name: 'Fructose',
    description: 'Fructose and high-fructose foods',
    category: 'intolerance',
    icon: '🍎',
    keywords: ['fructose', 'high fructose', 'agave', 'honey', 'apple', 'pear', 'mango', 'watermelon']
  },
  {
    id: 'fodmap',
    name: 'High FODMAP',
    description: 'Fermentable carbohydrates',
    category: 'intolerance',
    icon: '🧅',
    keywords: ['onion', 'garlic', 'leek', 'shallot', 'wheat', 'rye', 'apple', 'pear', 'mango', 'watermelon', 'mushroom', 'cauliflower', 'artichoke', 'asparagus', 'beans', 'lentils', 'chickpeas']
  },
  {
    id: 'histamine',
    name: 'High Histamine',
    description: 'Foods high in histamine',
    category: 'intolerance',
    icon: '🧀',
    keywords: ['aged cheese', 'fermented', 'cured', 'smoked', 'wine', 'beer', 'champagne', 'vinegar', 'sauerkraut', 'kimchi', 'soy sauce', 'fish sauce', 'anchovy', 'sardine', 'mackerel', 'tuna', 'spinach', 'eggplant', 'tomato', 'avocado']
  },
  
  // Lifestyle
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    description: 'No meat or fish',
    category: 'lifestyle',
    icon: '🥗',
    keywords: [
      // All meats
      'meat', 'beef', 'steak', 'ribeye', 'sirloin', 'filet', 'tenderloin', 'brisket', 'roast beef',
      'pork', 'bacon', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'salami', 'pepperoni',
      'chicken', 'poultry', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'lamb', 'mutton', 'veal', 'venison', 'rabbit', 'game',
      'sausage', 'hot dog', 'frankfurter', 'bratwurst', 'kielbasa',
      'burger', 'patty', 'meatball', 'meatloaf', 'bolognese', 'ragu',
      'pulled pork', 'carnitas', 'al pastor', 'carne asada', 'birria',
      'schnitzel', 'cutlet', 'escalope', 'cordon bleu',
      // Fish & Seafood
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout', 'bass', 'snapper', 'swordfish', 'mahi',
      'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'oyster', 'mussel', 'clam', 'calamari', 'squid', 'octopus',
      'anchovy', 'sardine', 'mackerel', 'herring', 'eel', 'sushi', 'sashimi', 'ceviche',
      'fish sauce', 'oyster sauce', 'worcestershire',
      // Hidden animal products
      'gelatin', 'lard', 'tallow', 'suet', 'bone broth', 'stock',
      'foie gras', 'pate', 'liverwurst'
    ]
  },
  {
    id: 'vegan',
    name: 'Vegan',
    description: 'No animal products',
    category: 'lifestyle',
    icon: '🌱',
    keywords: [
      // All meats
      'meat', 'beef', 'steak', 'ribeye', 'sirloin', 'filet', 'tenderloin', 'brisket', 'roast beef',
      'pork', 'bacon', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'salami', 'pepperoni',
      'chicken', 'poultry', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'lamb', 'mutton', 'veal', 'venison', 'rabbit', 'game',
      'sausage', 'hot dog', 'frankfurter', 'bratwurst', 'kielbasa',
      'burger', 'patty', 'meatball', 'meatloaf', 'bolognese', 'ragu',
      'pulled pork', 'carnitas', 'al pastor', 'carne asada', 'birria',
      'schnitzel', 'cutlet', 'escalope', 'cordon bleu',
      // Fish & Seafood
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout', 'bass', 'snapper', 'swordfish', 'mahi',
      'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'oyster', 'mussel', 'clam', 'calamari', 'squid', 'octopus',
      'anchovy', 'sardine', 'mackerel', 'herring', 'eel', 'sushi', 'sashimi', 'ceviche',
      'fish sauce', 'oyster sauce', 'worcestershire',
      // Dairy
      'milk', 'cheese', 'cream', 'butter', 'ghee', 'yogurt', 'kefir',
      'parmesan', 'mozzarella', 'cheddar', 'brie', 'camembert', 'gouda', 'feta', 'ricotta', 'mascarpone', 'gorgonzola', 'blue cheese',
      'alfredo', 'carbonara', 'bechamel', 'white sauce', 'cream sauce', 'cheese sauce',
      'ice cream', 'gelato', 'custard', 'whipped cream', 'crème fraîche', 'sour cream',
      'whey', 'casein', 'lactose',
      // Eggs
      'egg', 'omelette', 'frittata', 'quiche', 'scrambled', 'poached egg', 'fried egg', 'eggs benedict',
      'mayonnaise', 'mayo', 'aioli', 'hollandaise', 'bearnaise', 'meringue',
      // Other animal products
      'honey', 'gelatin', 'lard', 'tallow', 'suet', 'bone broth', 'stock',
      'foie gras', 'pate', 'liverwurst'
    ]
  },
  {
    id: 'halal',
    name: 'Halal',
    description: 'Islamic dietary requirements',
    category: 'lifestyle',
    icon: '☪️',
    keywords: ['pork', 'bacon', 'ham', 'lard', 'gelatin', 'alcohol', 'wine', 'beer', 'liquor', 'rum', 'whiskey', 'vodka']
  },
  {
    id: 'kosher',
    name: 'Kosher',
    description: 'Jewish dietary requirements',
    category: 'lifestyle',
    icon: '✡️',
    keywords: ['pork', 'bacon', 'ham', 'shellfish', 'shrimp', 'crab', 'lobster', 'mixing meat and dairy']
  },
  
  // Medical
  {
    id: 'diabetes',
    name: 'Low Sugar / Diabetic',
    description: 'Low sugar and low glycemic foods',
    category: 'medical',
    icon: '💉',
    keywords: ['sugar', 'syrup', 'honey', 'molasses', 'candy', 'dessert', 'cake', 'cookie', 'ice cream', 'soda', 'sweetened']
  },
  {
    id: 'low_sodium',
    name: 'Low Sodium',
    description: 'Reduced salt diet',
    category: 'medical',
    icon: '🧂',
    keywords: ['salted', 'brined', 'cured', 'pickled', 'soy sauce', 'miso', 'bacon', 'ham', 'sausage', 'deli meat', 'smoked']
  },
  {
    id: 'keto',
    name: 'Keto / Low Carb',
    description: 'Very low carbohydrate diet',
    category: 'medical',
    icon: '🥓',
    keywords: ['bread', 'pasta', 'rice', 'potato', 'fries', 'chips', 'sugar', 'flour', 'corn', 'beans', 'fruit', 'juice', 'soda']
  },
  {
    id: 'gout',
    name: 'Low Purine (Gout)',
    description: 'Foods that may trigger gout',
    category: 'medical',
    icon: '🦶',
    keywords: ['organ meat', 'liver', 'kidney', 'sweetbread', 'anchovy', 'sardine', 'mackerel', 'herring', 'scallop', 'mussel', 'game meat', 'bacon', 'beer', 'wine']
  }
]

export const RESTRICTION_CATEGORIES = [
  { id: 'allergen', name: 'Allergens', description: 'Common food allergies' },
  { id: 'intolerance', name: 'Intolerances', description: 'Food sensitivities' },
  { id: 'lifestyle', name: 'Lifestyle', description: 'Dietary preferences' },
  { id: 'medical', name: 'Medical', description: 'Health conditions' },
] as const

export function getRestrictionsByCategory(category: string): DietaryRestriction[] {
  return DIETARY_RESTRICTIONS.filter(r => r.category === category)
}

export function getRestrictionById(id: string): DietaryRestriction | undefined {
  return DIETARY_RESTRICTIONS.find(r => r.id === id)
}

export function getRestrictionsById(ids: string[]): DietaryRestriction[] {
  return DIETARY_RESTRICTIONS.filter(r => ids.includes(r.id))
}
