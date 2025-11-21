# IdeaForge 🚀

**Turn your spark of an idea into a shipping-ready product package in minutes.**

IdeaForge is an AI-powered "Co-Founder" that interviews you about your app idea, helps you refine it, and automatically generates professional-grade documentation including a **Product Requirements Document (PRD)**, **Design System Guide**, and **Technical Specifications**.

![IdeaForge Demo](https://placehold.co/1200x600/1e293b/ffffff?text=IdeaForge+Preview)

## ✨ Key Features

-   **🤖 Intelligent Interviewer**: An AI agent acts as your Product Manager, asking targeted questions to flesh out your concept.
-   **📝 Dynamic Forms**: Instead of boring text chats, IdeaForge generates interactive forms on the fly to capture structured data about your users, features, and goals.
-   **⚡ Multi-Step Artifact Generation**:
    -   **PRD**: Executive summary, user stories, acceptance criteria, and MoSCoW prioritization.
    -   **Design Guide**: Color palettes, typography choices, and UI component recommendations based on your brand vibe.
    -   **Tech Specs**: Recommended stack, database schema, API endpoints, and security considerations.
-   **📜 Interview Log**: Keeps a full transcript of your brainstorming session for future reference.
-   **📋 Copy-Ready Markdown**: All artifacts are generated in clean Markdown, ready to be copied into Notion, GitHub, or Jira.

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   An OpenAI API Key (or compatible provider like OpenRouter)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ideaforge.git
    cd ideaforge
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env.local` file in the root directory:
    ```env
    OPENAI_API_KEY=sk-your-api-key-here
    OPENAI_MODEL=gpt-4o # or your preferred model
    # Optional: Set a custom base URL if using a proxy or different provider
    # OPENAI_BASE_URL=https://openrouter.ai/api/v1
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open your browser**
    Navigate to `http://localhost:3000` to start forging your idea!

## 💡 How It Works

1.  **Start a Session**: Click "Start New Idea" on the home page.
2.  **The Interview**: The AI will greet you and ask about your core concept. Answer the questions using the chat or the dynamic forms provided.
3.  **Refinement**: The AI will dig deeper into specific areas like target audience, key features, and technical constraints.
4.  **Generation**: Once the AI has enough information, it will automatically trigger the generation process. You'll see it drafting your documents in real-time:
    -   *Drafting Product Requirements...*
    -   *Designing User Interface...*
    -   *Architecting Technical Solution...*
5.  **Review & Export**: Browse through the generated tabs (PRD, Design, Tech, Log) and copy the content to your clipboard.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **AI Integration**: OpenAI API
-   **Markdown Rendering**: `react-markdown`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
