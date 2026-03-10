'use server'

import { createClient } from '@/lib/supabase/server'
import { getRestrictionsById } from '@/lib/dietary-restrictions'

export async function reanalyzeScans(restrictions: string[], dietaryMode: 'strict' | 'mild') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized', count: 0 }
  }

  // If no restrictions, mark everything as safe
  if (!restrictions || restrictions.length === 0) {
    const { data: scans } = await supabase
      .from('scans')
      .select('id, menu_items')
      .eq('user_id', user.id)
    
    if (scans) {
      for (const scan of scans) {
        if (!scan.menu_items) continue
        const updatedItems = (scan.menu_items as Record<string, unknown>[]).map((item) => ({
          ...item,
          safety: 'safe',
          reason: 'No dietary restrictions set',
          ingredients_of_concern: [],
        }))
        await supabase
          .from('scans')
          .update({ menu_items: updatedItems })
          .eq('id', scan.id)
      }
    }
    return { count: scans?.length || 0 }
  }

  // Get all scans for this user
  const { data: scans, error: scansError } = await supabase
    .from('scans')
    .select('id, restaurant_id, menu_items')
    .eq('user_id', user.id)

  if (scansError || !scans) {
    return { error: 'Failed to fetch scans', count: 0 }
  }

  if (scans.length === 0) {
    return { count: 0 }
  }

  // Build restriction info
  const restrictionDetails = getRestrictionsById(restrictions)
  const restrictionNamesArray = restrictionDetails.map(r => r.name.toLowerCase())
  const restrictionKeywordsArray = restrictionDetails.flatMap(r => r.keywords.map(k => k.toLowerCase()))
  
  // Check if user has vegan or vegetarian restriction
  const isVegan = restrictions.includes('vegan')
  const isVegetarian = restrictions.includes('vegetarian')
  
  // Categories that should always be flagged for vegan/vegetarian - MULTILINGUAL (English, German, French, Italian, Spanish)
  const meatKeywords = [
    // English
    'meat', 'beef', 'steak', 'ribeye', 'sirloin', 'filet', 'tenderloin', 'brisket', 'roast',
    'pork', 'bacon', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'salami', 'pepperoni',
    'chicken', 'poultry', 'turkey', 'duck', 'goose', 'wings', 'drumstick', 'thigh', 'breast',
    'lamb', 'mutton', 'veal', 'venison', 'rabbit',
    'sausage', 'hot dog', 'bratwurst', 'kielbasa', 'frankfurter',
    'burger', 'patty', 'meatball', 'meatloaf', 'bolognese', 'ragu', 'ragout',
    'pulled pork', 'carnitas', 'al pastor', 'carne', 'asada', 'birria', 'barbacoa',
    'schnitzel', 'cutlet', 'escalope', 'cordon bleu', 'pastrami', 'corned beef',
    'ribs', 'rib eye', 'short rib', 'spare rib', 'baby back',
    'ground beef', 'ground pork', 'ground turkey', 'minced',
    // German
    'fleisch', 'rind', 'rinder', 'rindfleisch', 'rinds', 'rostbraten', 'braten',
    'schwein', 'schweinebraten', 'schweinefleisch', 'speck', 'schinken', 'wurst', 'würst', 'würstel', 'würstchen', 'wurstel', 'wiener', 'leberkäse', 'leberkäs',
    'huhn', 'hühner', 'hähnchen', 'hendl', 'poulet', 'geflügel', 'truthahn', 'pute', 'ente', 'gans',
    'lamm', 'lammfleisch', 'kalb', 'kalbfleisch', 'kalbs', 'wild', 'wildfleisch', 'hirsch', 'reh', 'hase', 'kaninchen',
    'gulasch', 'goulasch', 'goulash', 'tafelspitz', 'sauerbraten', 'kassler', 'kasseler', 'leberwurst', 'blutwurst', 'bockwurst', 'currywurst', 'weisswurst', 'weißwurst',
    'frikadelle', 'bulette', 'hackfleisch', 'gehacktes', 'hackbraten', 'fleischpflanzerl', 'fleischlaberl',
    'grill', 'gegrillt', 'gebraten', 'geschmort',
    // French
    'viande', 'boeuf', 'porc', 'poulet', 'canard', 'agneau', 'veau', 'lapin', 'jambon', 'saucisse', 'saucisson',
    'confit', 'rillettes', 'terrine', 'gigot', 'côte', 'entrecôte', 'bavette', 'tournedos',
    // Italian
    'carne', 'manzo', 'maiale', 'pollo', 'anatra', 'agnello', 'vitello', 'coniglio', 'prosciutto',
    'bistecca', 'cotoletta', 'saltimbocca', 'ossobuco', 'porchetta', 'mortadella', 'bresaola', 'spezzatino', 'polpette',
    // Spanish
    'cerdo', 'ternera', 'cordero', 'pollo', 'pato', 'jamon', 'chorizo', 'morcilla', 'lomo', 'chuleta', 'albondigas'
  ]
  const seafoodKeywords = [
    // English
    'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout', 'bass', 'snapper', 'swordfish', 'mahi',
    'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'oyster', 'mussel', 'clam', 
    'calamari', 'squid', 'octopus', 'anchovy', 'sardine', 'mackerel', 'herring',
    'seafood', 'shellfish', 'ceviche', 'sashimi', 'sushi', 'poke',
    'fish sauce', 'oyster sauce', 'worcestershire', 'fish and chips', 'fish & chips',
    // German
    'fisch', 'lachs', 'thunfisch', 'kabeljau', 'dorsch', 'forelle', 'zander', 'hecht', 'karpfen', 'scholle', 'seezunge', 'heilbutt',
    'garnele', 'garnelen', 'krabbe', 'krabben', 'hummer', 'muschel', 'muscheln', 'auster', 'austern', 'tintenfisch', 'calamares',
    'matjes', 'hering', 'makrele', 'sardine', 'sardellen', 'anchovis', 'meeresfrüchte',
    // French
    'poisson', 'saumon', 'thon', 'cabillaud', 'truite', 'crevette', 'homard', 'moules', 'huitres', 'coquilles',
    // Italian
    'pesce', 'salmone', 'tonno', 'merluzzo', 'trota', 'gamberi', 'aragosta', 'cozze', 'vongole', 'ostriche', 'frutti di mare',
    // Spanish
    'pescado', 'atún', 'bacalao', 'trucha', 'gambas', 'langosta', 'mejillones', 'almejas', 'mariscos'
  ]
  const dairyKeywords = [
    // English
    'milk', 'cheese', 'cream', 'butter', 'ghee', 'yogurt', 'kefir',
    'parmesan', 'mozzarella', 'cheddar', 'brie', 'camembert', 'gouda', 'feta', 'ricotta', 'mascarpone', 'gorgonzola',
    'alfredo', 'carbonara', 'bechamel', 'cream sauce', 'cheese sauce', 'white sauce', 'queso',
    'ice cream', 'gelato', 'custard', 'whipped cream', 'sour cream', 'crème', 'creme',
    'whey', 'casein', 'lactose', 'dairy',
    // German
    'milch', 'käse', 'sahne', 'rahm', 'schmand', 'quark', 'joghurt', 'butter', 'schlagsahne', 'obers',
    'käsespätzle', 'rahmschnitzel', 'rahmsauce', 'käsesauce', 'überbacken',
    // French
    'lait', 'fromage', 'crème', 'beurre', 'yaourt',
    // Italian
    'latte', 'formaggio', 'panna', 'burro',
    // Spanish
    'leche', 'queso', 'nata', 'mantequilla'
  ]
  const eggKeywords = [
    // English
    'egg', 'eggs', 'omelette', 'omelet', 'frittata', 'quiche', 'scrambled', 'poached', 'fried egg', 'sunny side',
    'mayonnaise', 'mayo', 'aioli', 'hollandaise', 'bearnaise', 'custard', 'meringue',
    'eggs benedict', 'egg salad', 'deviled egg',
    // German
    'ei', 'eier', 'spiegelei', 'rührei', 'eierspeise', 'omelette', 'eierkuchen', 'pfannkuchen',
    // French
    'oeuf', 'oeufs',
    // Italian  
    'uovo', 'uova',
    // Spanish
    'huevo', 'huevos', 'tortilla'
  ]
  
  const isStrict = dietaryMode === 'strict'
  let updatedCount = 0

  // Re-evaluate each scan's items based on new restrictions
  for (const scan of scans) {
    if (!scan.menu_items || !Array.isArray(scan.menu_items)) continue

    const updatedItems = scan.menu_items.map((item: { name: string; description?: string; safety: string; reason: string; ingredients_of_concern?: string[]; all_detected_allergens?: string[] }) => {
      // Only check item name and description - NOT the reason field (which contains old allergen info)
      const itemNameLower = (item.name || '').toLowerCase()
      const itemDescLower = (item.description || '').toLowerCase()
      const fullText = `${itemNameLower} ${itemDescLower}`
      
      // Use all_detected_allergens from original AI scan if available
      const originalAllergens = (item.all_detected_allergens || []).map(a => a.toLowerCase())
      
      const concerningIngredients: string[] = []
      
      // For vegan/vegetarian, also check against our specific keywords
      if (isVegan || isVegetarian) {
        // Check for meat
        for (const keyword of meatKeywords) {
          if (fullText.includes(keyword) || originalAllergens.some(a => a.includes(keyword))) {
            concerningIngredients.push(keyword)
          }
        }
        // Check for seafood
        for (const keyword of seafoodKeywords) {
          if (fullText.includes(keyword) || originalAllergens.some(a => a.includes(keyword))) {
            concerningIngredients.push(keyword)
          }
        }
      }
      
      // For vegan only, also check dairy and eggs
      if (isVegan) {
        for (const keyword of dairyKeywords) {
          if (fullText.includes(keyword) || originalAllergens.some(a => a.includes(keyword))) {
            concerningIngredients.push(keyword)
          }
        }
        for (const keyword of eggKeywords) {
          if (fullText.includes(keyword) || originalAllergens.some(a => a.includes(keyword))) {
            concerningIngredients.push(keyword)
          }
        }
      }
      
      // Check each restriction keyword against item name and description
      for (const keyword of restrictionKeywordsArray) {
        // Check item name and description
        if (fullText.includes(keyword)) {
          if (!concerningIngredients.includes(keyword)) {
            concerningIngredients.push(keyword)
          }
          continue
        }
        
        // Check original AI-detected allergens
        for (const allergen of originalAllergens) {
          if (allergen.includes(keyword)) {
            if (!concerningIngredients.includes(allergen)) {
              concerningIngredients.push(allergen)
            }
            break
          }
        }
      }
      
      // Also check restriction names (e.g., "dairy", "gluten") in name/description only
      for (const name of restrictionNamesArray) {
        if (fullText.includes(name)) {
          if (!concerningIngredients.includes(name)) {
            concerningIngredients.push(name)
          }
        }
      }
      
      // Deduplicate
      const uniqueConcerns = [...new Set(concerningIngredients)]

      let newSafety: 'safe' | 'caution' | 'unsafe' = 'safe'
      let newReason = `No ${restrictionNamesArray.join(', ')} ingredients detected.`

      if (uniqueConcerns.length > 0) {
        // For vegan/vegetarian, any meat/seafood/dairy/egg is always unsafe
        const isMeatOrSeafood = uniqueConcerns.some(c => 
          meatKeywords.includes(c) || seafoodKeywords.includes(c)
        )
        const isDairyOrEgg = uniqueConcerns.some(c => 
          dairyKeywords.includes(c) || eggKeywords.includes(c)
        )
        
        if ((isVegan || isVegetarian) && isMeatOrSeafood) {
          newSafety = 'unsafe'
          newReason = `Contains: ${uniqueConcerns.join(', ')}`
        } else if (isVegan && isDairyOrEgg) {
          newSafety = 'unsafe'
          newReason = `Contains: ${uniqueConcerns.join(', ')}`
        } else if (isStrict) {
          newSafety = 'unsafe'
          newReason = `Contains: ${uniqueConcerns.join(', ')}`
        } else {
          // Mild mode: direct matches are unsafe, indirect are caution
          const directMatch = uniqueConcerns.some(c => 
            restrictionNamesArray.includes(c.toLowerCase()) ||
            restrictionKeywordsArray.slice(0, 5).includes(c.toLowerCase())
          )
          newSafety = directMatch ? 'unsafe' : 'caution'
          newReason = `May contain: ${uniqueConcerns.join(', ')}`
        }
      }

      return {
        ...item,
        safety: newSafety,
        reason: newReason,
        ingredients_of_concern: uniqueConcerns,
      }
    })

    // Update only menu_items (scans table doesn't have dietary_mode or updated_at)
    const { error: updateError } = await supabase
      .from('scans')
      .update({ menu_items: updatedItems })
      .eq('id', scan.id)

    if (!updateError) {
      updatedCount++
    }
  }

  return { count: updatedCount }
}
