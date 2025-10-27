import { GoogleGenAI } from '@google/genai';

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// route for generating AI exercise instructions using Google GenAI
export async function POST(req: Request) {
  const { exerciseName } = await req.json();

  if (!exerciseName) {
    return Response.json({ error: 'Exercise name is required' }, { status: 400 });
  }

  //   const prompt = `
  //   You are a fitness coach.
  //   You are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required. Explain the exercise in details for a beginner.

  //   The exercise name is: ${exerciseName}
  //   Keep it short and concise within 150 words using markdown formatting.

  //   use the following format:

  //   ## Equipment Required

  //   ## Instructions

  //   ### Tips

  //   ### Variations

  //   ### Safety

  //   keep spacing between the headers and the content.

  //   Always use heading and subheadings
  //   `;

  const prompt = `
You are a certified fitness coach.

Your task is to provide clear, beginner-friendly instructions for the following exercise: ${exerciseName}.

Your response must:
- Be concise (under 150 words)
- Use proper Markdown formatting
- Include spacing between headers and their content
- Always include the following sections (even if a section says "None" or "Not required"):

## Equipment Required

## Instructions

### Tips

### Variations

### Safety

Keep your tone encouraging, educational, and suitable for a fitness app or guide.
`;

  try {
    const response = await googleGenAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // console.log('Google GenAI Response:', response);

    // Extract the text from the response
    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      throw new Error('No text content in response');
    }
    // console.log('Generated Text:', generatedText);
    return Response.json({ guidance: generatedText });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return Response.json({ error: 'Error fetching AI response' }, { status: 500 });
  }
}
