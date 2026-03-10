import { generateText } from 'ai'
import { z } from 'zod'
import { getRestrictionsById } from '@/lib/dietary-restrictions'

export const maxDuration = 300

const menuItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(), // Allow null or undefined
  safety: z.enum(['safe', 'caution', 'unsafe']),
  reason: z.string(),
  ingredients_of_concern: z.array(z.string()),
  all_detected_allergens: z.array(z.string()).nullable().optional(), // All potential allergens for reanalysis
})

const menuAnalysisSchema = z.object({
  raw_text: z.string(),
  items: z.array(menuItemSchema),
})

export async function POST(req: Request) {
  try {
    const { images, dietaryMode, glutenFree, lactoseFree, restrictions: restrictionIds } = await req.json()

    const imageArray: string[] = Array.isArray(images) ? images : (images ? [images] : [])

    if (imageArray.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 })
    }

    let restrictionNames: string[] = []
    let restrictionKeywords: string[] = []

    if (restrictionIds && Array.isArray(restrictionIds) && restrictionIds.length > 0) {
      const restrictionDetails = getRestrictionsById(restrictionIds)
      restrictionNames = restrictionDetails.map(r => r.name)
      restrictionKeywords = restrictionDetails.flatMap(r => r.keywords)
    } else {
      if (glutenFree) {
        restrictionNames.push('Gluten')
        restrictionKeywords.push('wheat', 'barley', 'rye', 'flour', 'bread', 'pasta', 'gluten')
      }
      if (lactoseFree) {
        restrictionNames.push('Dairy/Lactose')
        restrictionKeywords.push('milk', 'cheese', 'cream', 'butter', 'yogurt', 'lactose', 'dairy')
      }
    }

    if (restrictionNames.length === 0) {
      return Response.json({ error: 'At least one dietary restriction must be selected' }, { status: 400 })
    }

    const strictMode = dietaryMode === 'strict'
    const modeDescription = strictMode
      ? 'STRICT mode: If there is ANY uncertainty, classify as "caution" or "unsafe".'
      : 'MILD mode: Only classify as "unsafe" if it clearly contains restricted ingredients.'

    // Build messages with images using the correct AI SDK format
    const imageContents = imageArray.map(img => ({
      type: 'image' as const,
      image: img,
    }))

    // Build specific instructions for lifestyle diets
    const lifestyleDiets = restrictionNames.filter(name => 
      ['Vegan', 'Vegetarian', 'Halal', 'Kosher'].includes(name)
    )
    
    let lifestyleInstructions = ''
    if (lifestyleDiets.includes('Vegan')) {
      lifestyleInstructions += `
**VEGAN - CRITICAL RULES - THIS IS THE MOST IMPORTANT PART:**
A vegan cannot eat ANY animal products. Mark as "unsafe" if the dish contains or likely contains:

IMPORTANT: Menus may be in ANY language (German, French, Italian, Spanish, etc.). You MUST recognize meat/animal products in ALL languages:

MEAT (always unsafe for vegans) - recognize in any language:
- Beef: steak, ribeye, roast beef, burger | German: Rind, Rindfleisch, Rostbraten, Gulasch, Tafelspitz | Italian: manzo, bistecca | French: boeuf
- Pork: bacon, ham, sausage | German: Schwein, Speck, Schinken, Wurst, Würstel, Leberkäse | Italian: maiale, prosciutto | French: porc, jambon
- Chicken: chicken, poultry, wings | German: Huhn, Hühner, Hähnchen, Hendl, Geflügel | Italian: pollo | French: poulet
- Other meats: lamb, veal, duck, turkey, rabbit, venison | German: Lamm, Kalb, Ente, Pute, Hase, Wild

SEAFOOD (always unsafe for vegans):
- Fish: salmon, tuna, cod, trout | German: Fisch, Lachs, Forelle, Zander | Italian: pesce | French: poisson
- Shellfish: shrimp, crab, lobster, mussels | German: Garnelen, Krabben, Hummer, Muscheln

DAIRY (always unsafe for vegans):
- Milk, cream, butter, cheese, yogurt | German: Milch, Sahne, Rahm, Käse, Butter, Joghurt, Obers | Italian: latte, formaggio, panna

EGGS (always unsafe for vegans):
- Eggs, omelette, mayonnaise | German: Ei, Eier, Spiegelei, Rührei | Italian: uovo, uova | French: oeuf

EXAMPLES OF UNSAFE GERMAN DISHES FOR VEGANS:
- "Wiener Schnitzel" = veal cutlet = UNSAFE
- "Rindergulasch" = beef goulash = UNSAFE (Rinder = beef)
- "Hühnersuppe" = chicken soup = UNSAFE (Hühner = chicken)  
- "Grillwürstel" = grilled sausages = UNSAFE (Würstel = sausages)
- "Schweinebraten" = pork roast = UNSAFE (Schweine = pork)
- "Käsespätzle" = cheese noodles = UNSAFE for vegans (Käse = cheese)

If a dish name contains ANY word indicating meat in ANY language, it MUST be marked "unsafe".
`
    }
    if (lifestyleDiets.includes('Vegetarian')) {
      lifestyleInstructions += `
**VEGETARIAN - CRITICAL RULES:**
A vegetarian cannot eat meat or fish. Mark as "unsafe" if the dish contains any meat or fish in ANY language:

MEAT (always unsafe): 
- English: beef, pork, chicken, turkey, duck, lamb, bacon, ham, sausage, burger
- German: Rind, Schwein, Huhn, Hühner, Hähnchen, Lamm, Kalb, Speck, Schinken, Wurst, Würstel, Gulasch, Braten, Schnitzel
- Italian: carne, manzo, maiale, pollo
- French: viande, boeuf, porc, poulet

SEAFOOD (always unsafe): fish, salmon, tuna, shrimp | German: Fisch, Lachs, Garnelen, Muscheln

If a dish name indicates meat/fish in ANY language, mark it "unsafe" immediately.
`
    }
    
    const result = await generateText({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are MenuSafe, a dietary safety analyzer. You MUST respond with ONLY a valid JSON object, no other text.

The JSON format is: {"raw_text": "transcribed menu text", "items": [{"name": "dish name", "description": "brief description if available", "safety": "safe|caution|unsafe", "reason": "why", "ingredients_of_concern": ["list of restricted ingredients found"], "all_detected_allergens": ["ALL potential allergens detected like gluten, dairy, nuts, shellfish, eggs, soy, fish, meat, etc regardless of user restrictions"]}]}

CRITICAL SAFETY RULES:
${lifestyleInstructions}

For ALL restrictions:
- "safe" = DEFINITELY does not contain restricted ingredients
- "caution" = MIGHT contain restricted ingredients (unclear or hidden ingredients possible)  
- "unsafe" = DEFINITELY or LIKELY contains restricted ingredients

CRITICAL: "all_detected_allergens" MUST include ALL of the following if present in the dish:
- "meat" or specific type (beef, chicken, pork, etc.) - for ANY meat product
- "fish" or specific type (salmon, tuna, etc.) - for ANY fish
- "seafood" or specific type (shrimp, crab, etc.) - for ANY seafood
- "dairy" or specific type (cheese, cream, milk, butter) - for ANY dairy
- "eggs" - for ANY egg product
- "gluten" - for wheat, bread, pasta, etc.
- "nuts" or specific type - for ANY nuts
- "shellfish" - for shrimp, crab, lobster, etc.
This field is essential for reanalysis when users change their dietary settings.

User restrictions: ${restrictionNames.join(', ')}
Mode: ${modeDescription}
Watch for these ingredients: ${restrictionKeywords.slice(0, 30).join(', ')}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this menu for dietary safety. Return ONLY JSON.' },
            ...imageContents
          ],
        }
      ],
    })

    // Extract JSON from response
    let text = result.text.trim()
    
    // Try to find JSON in the response
    let jsonStr = text
    
    // Remove code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    } else {
      // Find JSON boundaries
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start !== -1 && end > start) {
        jsonStr = text.slice(start, end + 1)
      }
    }

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      // Return the raw response for debugging
      return Response.json({ 
        error: 'Failed to parse AI response as JSON',
        debug: text.substring(0, 1000)
      }, { status: 500 })
    }

    const validated = menuAnalysisSchema.safeParse(parsed)
    if (!validated.success) {
      return Response.json({ 
        error: 'Response did not match expected format',
        debug: JSON.stringify(validated.error.issues)
      }, { status: 500 })
    }

    return Response.json({ result: validated.data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: `Analysis failed: ${msg}` }, { status: 500 })
  }
}
