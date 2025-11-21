import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

const GENERATION_SYSTEM_PROMPT = `
You are an expert Product Manager, UI/UX Designer, and CTO.
Your goal is to generate a specific part of a software specification package based on the interview history and previous context.

**Input Context:**
- You will receive the conversation history.
- You may receive previously generated artifacts (e.g., PRD) to ensure consistency.

**Task:**
Generate ONLY the requested section in Markdown format. Do not wrap it in JSON. Just return the Markdown string.

**Sections:**
1.  **PRD**: Executive summary, user stories, acceptance criteria, MoSCoW prioritization.
2.  **Design**: Color palette (hex), typography, UI component suggestions, vibe description.
3.  **Tech**: Stack selection, database schema (SQL/Prisma), API endpoints list, security considerations.
`;

export async function POST(req: Request) {
    try {
        const { messages, step, context } = await req.json();

        // MOCK MODE
        if (process.env.OPENAI_API_KEY === 'mock-key' || !process.env.OPENAI_API_KEY) {
            return mockGenerationResponse(step);
        }

        let specificPrompt = "";
        switch (step) {
            case 'prd':
                specificPrompt = "Generate the **Product Requirements Document (PRD)**. Focus on the 'What' and 'Why'. Include User Stories and Acceptance Criteria.";
                break;
            case 'design':
                specificPrompt = `Generate the **Design Guide**. Focus on the 'Look and Feel'. Use the following PRD for context: \n\n${context?.prd || ''}`;
                break;
            case 'tech':
                specificPrompt = `Generate the **Technical Specifications**. Focus on the 'How'. Use the following PRD and Design Guide for context: \n\nPRD: ${context?.prd || ''}\n\nDesign: ${context?.design || ''}`;
                break;
            default:
                throw new Error("Invalid step");
        }

        // REAL MODE
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-5-mini",
            messages: [
                { role: "system", content: GENERATION_SYSTEM_PROMPT },
                { role: "user", content: `Here is the interview transcript. ${specificPrompt}` },
                ...messages,
            ],
        });

        const responseContent = completion.choices[0].message.content;
        if (!responseContent) throw new Error("No content from LLM");

        return NextResponse.json({ content: responseContent });

    } catch (error) {
        console.error("Generation API Error:", error);
        return NextResponse.json({
            message: "Failed to generate artifact.",
        }, { status: 500 });
    }
}

async function mockGenerationResponse(step: string) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation time per step

    let content = "";
    switch (step) {
        case 'prd':
            content = "# Product Requirements Document\n\n## Executive Summary\nGenerated from mock mode (Step 1/3)...\n\n## User Stories\n- As a user...";
            break;
        case 'design':
            content = "# Design Guide\n\n## Colors\n- Blue: #0000FF\n\n(Generated from mock mode Step 2/3)";
            break;
        case 'tech':
            content = "# Technical Specifications\n\n## Stack\n- Next.js\n\n(Generated from mock mode Step 3/3)";
            break;
    }

    return NextResponse.json({ content });
}
