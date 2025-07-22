import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuestionRequest {
  count: number;
  categories?: string[];
  difficulty?: string;
}

serve(async (req) => {
  console.log('Generate IQ Questions function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // Get request data
    const requestData: QuestionRequest = await req.json()
    console.log('Question request data:', requestData)

    const { count = 100, categories = ['logical', 'numerical', 'verbal', 'spatial'], difficulty = 'mixed' } = requestData

    // Create prompt for generating IQ questions
    const prompt = createQuestionPrompt(count, categories, difficulty)
    console.log('Generated prompt for Gemini')

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    const questionsText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!questionsText) {
      throw new Error('No questions content received from Gemini')
    }

    // Parse the JSON response from Gemini
    let questions
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = questionsText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(questionsText)
      }
    } catch (parseError) {
      console.error('Error parsing questions from Gemini:', parseError)
      console.error('Raw response:', questionsText)
      throw new Error('Failed to parse questions from AI response')
    }

    // Validate questions format
    if (!Array.isArray(questions)) {
      throw new Error('Questions should be an array')
    }

    // Ensure each question has required fields
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || index + 1,
      type: q.type || 'logical',
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium'
    }))

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-iq-questions function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate questions', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function createQuestionPrompt(count: number, categories: string[], difficulty: string): string {
  const prompt = `You are an expert psychologist and IQ test creator. Generate exactly ${count} high-quality IQ test questions.

REQUIREMENTS:
- Generate questions across these categories: ${categories.join(', ')}
- Distribute questions evenly across categories (${Math.floor(count/4)} questions per category)
- Mix difficulty levels: easy (30%), medium (50%), hard (20%)
- Each question must have exactly 4 multiple choice options
- Questions should test genuine cognitive abilities
- Avoid cultural bias and ensure accessibility
- Include clear, educational explanations

QUESTION CATEGORIES:
1. **Logical Reasoning**: Deductive/inductive logic, syllogisms, pattern recognition
2. **Numerical Reasoning**: Math sequences, algebra, arithmetic, number patterns
3. **Verbal Reasoning**: Analogies, synonyms/antonyms, word relationships, vocabulary
4. **Spatial Reasoning**: 3D visualization, rotation, folding, geometric patterns

OUTPUT FORMAT:
Return ONLY a valid JSON array with this exact structure:

[
  {
    "id": 1,
    "type": "logical",
    "question": "If all roses are flowers and some flowers are red, which statement must be true?",
    "options": ["All roses are red", "Some roses might be red", "No roses are red", "All red things are roses"],
    "correctAnswer": 1,
    "explanation": "Since some flowers are red and all roses are flowers, it's possible that some roses could be red, but we cannot determine this with certainty.",
    "difficulty": "medium"
  }
]

IMPORTANT RULES:
- correctAnswer is the index (0-3) of the correct option
- Each question must be unique and intellectually challenging
- Explanations should be clear and educational
- No duplicate questions or concepts
- Ensure proper JSON formatting
- Test a variety of cognitive skills within each category

Generate exactly ${count} questions following these specifications.`

  return prompt
}