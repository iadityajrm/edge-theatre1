const GEMINI_API_KEY = 'AIzaSyAGdc0AlJqWxI3BD-Fgb1n6StFxjQwMGL8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function callGeminiAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Atlas, a helpful AI assistant for a smart TV interface. Keep your responses to 2-3 lines maximum. Be concise and helpful. User question: ${prompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    return "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('Gemini AI error:', error);
    return "I'm experiencing technical difficulties. Please try again.";
  }
}

export function extractAppCommand(command: string): string | null {
  const lowerCommand = command.toLowerCase();
  
  // Define app mappings
  const appMappings: { [key: string]: string } = {
    'netflix': 'netflix',
    'youtube': 'youtube', 
    'prime video': 'primevideo',
    'prime': 'primevideo',
    'disney': 'disney',
    'disney plus': 'disney',
    'hulu': 'hulu',
    'spotify': 'spotify',
    'twitch': 'twitch',
    'hbo': 'hbomax',
    'hbo max': 'hbomax'
  };

  // Check for "open" commands
  if (lowerCommand.includes('open') || lowerCommand.includes('launch') || lowerCommand.includes('start')) {
    for (const [keyword, appId] of Object.entries(appMappings)) {
      if (lowerCommand.includes(keyword)) {
        return appId;
      }
    }
  }

  return null;
}