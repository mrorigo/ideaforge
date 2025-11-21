import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { LLMResponse } from '@/lib/llm-protocol';

// Initialize OpenAI client
// Note: In a real app, you'd use process.env.OPENAI_API_KEY
// For this playground, we assume the environment is set up or we mock it if needed.
// Since I don't have the key, I will mock the response for now to allow the UI to work.
// WAIT - I should try to use the real client if the user provides a key, but usually I don't have one.
// I will implement a mock mode if no key is present, but structure it for real usage.

const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

const SYSTEM_PROMPT = `
You are an expert Product Manager, UI/UX Designer, and CTO. 
Your goal is to interview the user to build a comprehensive software specification package.

**Process:**
1.  **Inception**: Ask the user what they want to build.
2.  **Refinement**: Ask clarifying questions. Use the "form" tool to ask structured questions.
    -   Do not ask too many questions at once.
    -   Group related questions into a single form.
    -   Drill down into technical details (e.g., "SQL vs NoSQL" -> "Postgres vs MySQL").
3.  **Completion**: When you have enough information, generate the artifacts.

**Output Format:**
You must output JSON matching this TypeScript interface:

interface LLMResponse {
  thought: string; // Your internal reasoning
  message: string; // Message to the user
  form?: {
    title: string;
    description?: string;
    fields: {
      id: string;
      label: string;
      type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox';
      options?: string[];
      required?: boolean;
    }[];
    submitLabel?: string;
  };
  isComplete?: boolean;
}

**Rules:**
-   Always be professional but encouraging.
-   If the user's idea is vague, ask for the "Why" and "Who".
-   If the user is technical, go deep. If not, explain concepts simply.
-   When you have enough information to generate the specs, set 'isComplete' to true. DO NOT generate the artifacts yourself. Just say something like "I have everything I need. Generating your package now..."
`;

export async function POST(req: Request) {
    try {
        const { messages, formData } = await req.json();

        // OPTIMIZATION: Hardcode the initial message to avoid latency and errors
        if (messages.length === 0) {
            return NextResponse.json({
                thought: "Starting the interview. Need to know the core idea.",
                message: "Hello! I'm your AI Product Co-founder. I'm here to help you turn your idea into reality. To get started, tell me: What do you want to build today?",
                form: {
                    title: "The Spark",
                    fields: [
                        { id: "idea", label: "Describe your app idea", type: "textarea", placeholder: "e.g., A Tinder for adopting pets...", required: true }
                    ],
                    submitLabel: "Let's Go"
                }
            });
        }

        // MOCK MODE (If no API key is set or if it's the dummy key)
        if (process.env.OPENAI_API_KEY === 'mock-key' || !process.env.OPENAI_API_KEY) {
            return mockResponse(messages, formData);
        }

        // REAL MODE
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-5-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages,
                // If there's formData, we append it as the latest user input context
                ...(formData ? [{ role: "user", content: `User submitted form data: ${JSON.stringify(formData)}` }] : [])
            ],
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0].message.content;
        if (!responseContent) throw new Error("No content from LLM");

        // Robust JSON extraction: Find the first '{' and the last '}'
        const start = responseContent.indexOf('{');
        const end = responseContent.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error("No JSON found in response");
        }

        const cleanContent = responseContent.substring(start, end + 1);

        return NextResponse.json(JSON.parse(cleanContent));

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            message: "Sorry, I encountered an error. Please try again.",
            thought: "Error occurred"
        }, { status: 500 });
    }
}

// --- MOCK LOGIC FOR DEMONSTRATION ---
async function mockResponse(messages: any[], formData: any): Promise<NextResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency

    const messageCount = messages.length;

    // Step 0: Initial Greeting
    if (messageCount === 0) {
        return NextResponse.json({
            thought: "Starting the interview. Need to know the core idea.",
            message: "Hello! I'm your AI Product Co-founder. I'm here to help you turn your idea into reality. To get started, tell me: What do you want to build today?",
            form: {
                title: "The Spark",
                fields: [
                    { id: "idea", label: "Describe your app idea", type: "textarea", placeholder: "e.g., A Tinder for adopting pets...", required: true }
                ],
                submitLabel: "Let's Go"
            }
        });
    }

    // Step 1: Product Questions
    if (messageCount <= 2) {
        return NextResponse.json({
            thought: "User provided idea. Now need to define the audience and platform.",
            message: "That sounds interesting! Let's pin down the basics.",
            form: {
                title: "The Basics",
                fields: [
                    { id: "target_audience", label: "Who is this for?", type: "text", placeholder: "e.g., Busy professionals, Students...", required: true },
                    { id: "platform", label: "Primary Platform", type: "radio", options: ["Web", "Mobile (iOS/Android)", "Desktop", "Cross-platform"], required: true },
                    { id: "monetization", label: "How will it make money?", type: "select", options: ["Free", "Subscription", "Ads", "One-time purchase"], required: false }
                ],
                submitLabel: "Next: Design"
            }
        });
    }

    // Step 2: Design Questions
    if (messageCount <= 4) {
        return NextResponse.json({
            thought: "Basics done. Now asking about design preferences.",
            message: "Got it. Now let's talk about the look and feel.",
            form: {
                title: "Design Vibes",
                fields: [
                    { id: "style", label: "Visual Style", type: "select", options: ["Minimalist", "Playful/Cartoon", "Corporate/Professional", "Dark/Futuristic"], required: true },
                    { id: "colors", label: "Primary Color Preference", type: "radio", options: ["Blue", "Green", "Purple", "Black/White"], required: true }
                ],
                submitLabel: "Next: Tech"
            }
        });
    }

    // Step 3: Tech Questions
    if (messageCount <= 6) {
        return NextResponse.json({
            thought: "Design done. Now technical details.",
            message: "Okay, last step before I generate the specs. Let's get technical.",
            form: {
                title: "Under the Hood",
                fields: [
                    { id: "users", label: "Expected User Scale (Year 1)", type: "select", options: ["< 1,000", "1,000 - 10,000", "10,000 - 1M", "1M+"], required: true },
                    { id: "features", label: "Key Technical Features", type: "multiselect", options: ["Real-time Chat", "Payments", "AI Integration", "Video Streaming", "Maps/Location"], required: false }
                ],
                submitLabel: "Generate Specs"
            }
        });
    }

    // Step 4: Completion
    return NextResponse.json({
        thought: "All info gathered. signaling completion.",
        message: "I have everything I need! Generating your complete product package now...",
        isComplete: true
    });
}
