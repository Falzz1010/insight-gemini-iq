import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisData {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  categoryPerformance: {
    logical: number;
    numerical: number;
    verbal: number;
    spatial: number;
  };
  answers: Array<{
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    type: string;
    difficulty: string;
  }>;
}

serve(async (req) => {
  console.log('Analyze IQ Results function called');

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
    const analysisData: AnalysisData = await req.json()
    console.log('Analysis data received:', analysisData)

    // Create detailed analysis prompt for Gemini
    const prompt = createAnalysisPrompt(analysisData)
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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

    let analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!analysis) {
      throw new Error('No analysis content received from Gemini')
    }

    // Clean up markdown formatting and special characters
    analysis = analysis
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown
      .replace(/#+ /g, '')              // Remove markdown headers
      .replace(/\*#\*#/g, '')           // Remove specific problematic characters
      .replace(/[*#]+/g, '')            // Remove any remaining asterisks and hashes
      .trim()

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')
    let userId = null
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { authorization: authHeader }
        }
      })

      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    }

    // Save results to database if user is authenticated
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
        
        const { error: insertError } = await supabaseService
          .from('iq_test_results')
          .insert({
            user_id: userId,
            score: analysisData.score,
            answers: analysisData.answers,
            category_performance: analysisData.categoryPerformance,
            ai_analysis: analysis
          })

        if (insertError) {
          console.error('Error saving test results:', insertError)
        } else {
          console.log('Test results saved successfully')
        }
      } catch (error) {
        console.error('Error in database operation:', error)
        // Don't fail the analysis if database save fails
      }
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-iq-results function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze results', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function createAnalysisPrompt(data: AnalysisData): string {
  const { score, correctAnswers, totalQuestions, categoryPerformance, answers } = data
  
  const percentage = (correctAnswers / totalQuestions) * 100
  
  // Analyze category strengths and weaknesses
  const categoryAnalysis = Object.entries(categoryPerformance)
    .map(([category, score]) => `${category}: ${score.toFixed(1)}%`)
    .join(', ')
  
  // Analyze incorrect answers
  const incorrectAnswers = answers.filter(a => !a.isCorrect)
  const incorrectByCategory = incorrectAnswers.reduce((acc, answer) => {
    acc[answer.type] = (acc[answer.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const prompt = `You are an AI psychologist and cognitive assessment expert. Analyze this IQ test performance and provide detailed, personalized insights.

TEST RESULTS:
- IQ Score: ${score}
- Questions Answered: ${correctAnswers}/${totalQuestions} (${percentage.toFixed(1)}%)
- Category Performance: ${categoryAnalysis}

DETAILED BREAKDOWN:
${answers.map((answer, index) => 
  `Question ${index + 1} (${answer.type}, ${answer.difficulty}): ${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}`
).join('\n')}

ANALYSIS REQUIREMENTS:
Please provide a comprehensive analysis covering:

1. **Overall Performance Assessment**
   - Interpret the IQ score in context
   - Compare to population norms
   - Overall cognitive strengths

2. **Category-Specific Analysis**
   - Strengths and weaknesses by reasoning type
   - What each category reveals about cognitive abilities
   - Specific insights for each area

3. **Learning Patterns & Insights**
   - Error patterns and what they suggest
   - Cognitive style preferences
   - Information processing tendencies

4. **Personalized Recommendations**
   - Specific exercises to improve weak areas
   - Strategies to leverage strengths
   - Daily practices for cognitive enhancement

5. **Development Roadmap**
   - Short-term goals (1-3 months)
   - Long-term cognitive development plan
   - Resources and techniques to explore

Format your response in clear, encouraging language. Be specific and actionable. Focus on growth potential rather than limitations. Keep the tone professional yet accessible, like a knowledgeable mentor providing guidance.

Length: Aim for 400-600 words for comprehensive insights.`

  return prompt
}