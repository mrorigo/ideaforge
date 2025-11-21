"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DynamicForm } from '@/components/DynamicForm';
import { LLMResponse, FormSchema, Artifacts } from '@/lib/llm-protocol';
import { Send, Bot, User, CheckCircle, FileText, Code, Palette, Loader2, Sparkles, Copy, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function InterviewPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentForm, setCurrentForm] = useState<FormSchema | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generationStep, setGenerationStep] = useState<'prd' | 'design' | 'tech' | null>(null);
    const [artifacts, setArtifacts] = useState<Artifacts | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentForm, generationStep]);

    // Initial start
    useEffect(() => {
        if (!startedRef.current) {
            startedRef.current = true;
            startInterview();
        }
    }, []);

    const startInterview = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [] }),
            });
            const data: LLMResponse = await res.json();
            handleLLMResponse(data);
        } catch (error) {
            console.error("Failed to start interview", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (formData: Record<string, any>) => {
        setIsLoading(true);

        // Add user's form submission as a message for the UI (formatted nicely)
        const formattedResponse = Object.entries(formData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');

        const newMessages = [
            ...messages,
            { role: 'user' as const, content: formattedResponse, timestamp: Date.now() }
        ];
        setMessages(newMessages);
        setCurrentForm(null); // Clear form while loading

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    formData
                }),
            });

            const data: LLMResponse = await res.json();
            handleLLMResponse(data);
        } catch (error) {
            console.error("Failed to submit form", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLLMResponse = async (data: LLMResponse) => {
        if (data.message) {
            setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: Date.now() }]);
        }

        if (data.form) {
            setCurrentForm(data.form);
        }

        if (data.isComplete) {
            setCurrentForm(null);

            // Trigger Multi-Step Generation
            try {
                // Step 1: PRD
                setGenerationStep('prd');
                const prdRes = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messages, step: 'prd' }),
                });
                const prdData = await prdRes.json();
                const prdContent = prdData.content;

                // Step 2: Design
                setGenerationStep('design');
                const designRes = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messages, step: 'design', context: { prd: prdContent } }),
                });
                const designData = await designRes.json();
                const designContent = designData.content;

                // Step 3: Tech
                setGenerationStep('tech');
                const techRes = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messages, step: 'tech', context: { prd: prdContent, design: designContent } }),
                });
                const techData = await techRes.json();
                const techContent = techData.content;

                // Generate Chat Log (Client-side)
                const chatLogContent = "# Interview Transcript\n\n" + messages.map(m =>
                    `**${m.role === 'assistant' ? 'AI' : 'User'}**: ${m.content}\n\n---\n\n`
                ).join('');

                // Complete
                setArtifacts({
                    prd: prdContent,
                    design: designContent,
                    tech: techContent,
                    chatLog: chatLogContent
                });

            } catch (error) {
                console.error("Generation failed", error);
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I failed to generate the documents. Please try again.", timestamp: Date.now() }]);
            } finally {
                setGenerationStep(null);
            }
        }
    };

    if (artifacts) {
        return <ArtifactView artifacts={artifacts} />;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight">
                        <span className="text-blue-500">Idea</span>Forge
                    </div>
                    <div className="text-sm text-gray-400">
                        AI Product Interview
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl flex flex-col gap-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex gap-4 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === 'assistant' ? "bg-blue-600" : "bg-gray-700"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        <div className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                            msg.role === 'assistant'
                                ? "bg-gray-900 border border-white/5 text-gray-200 rounded-tl-none"
                                : "bg-blue-600 text-white rounded-tr-none"
                        )}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator (Standard) */}
                {isLoading && !currentForm && !generationStep && (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Bot size={16} />
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}

                {/* Generation Progress Indicator (Prominent) */}
                {generationStep && (
                    <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center animate-spin-slow">
                                    <Sparkles size={20} />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-50 animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {generationStep === 'prd' && "Drafting Product Requirements..."}
                                    {generationStep === 'design' && "Designing User Interface..."}
                                    {generationStep === 'tech' && "Architecting Technical Solution..."}
                                </h3>
                                <p className="text-blue-200 text-sm">
                                    {generationStep === 'prd' && "Analyzing user stories and acceptance criteria."}
                                    {generationStep === 'design' && "Selecting color palettes and typography."}
                                    {generationStep === 'tech' && "Defining database schema and API endpoints."}
                                </p>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
                        </div>
                    </div>
                )}

                {/* Dynamic Form Area */}
                {currentForm && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DynamicForm
                            schema={currentForm}
                            onSubmit={handleFormSubmit}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Fallback Chat Input (When no form is active) */}
                {!currentForm && !isLoading && !artifacts && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('message') as HTMLInputElement;
                            if (input.value.trim()) {
                                handleFormSubmit({ message: input.value });
                                input.value = '';
                            }
                        }}
                        className="mt-4 flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <input
                            type="text"
                            name="message"
                            placeholder="Type your answer..."
                            className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                )}

                <div ref={messagesEndRef} />
            </main>
        </div>
    );
}

import ReactMarkdown from 'react-markdown';

function ArtifactView({ artifacts }: { artifacts: Artifacts }) {
    const [activeTab, setActiveTab] = useState<'prd' | 'design' | 'tech' | 'chatLog'>('prd');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(artifacts[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl">
                        <span className="text-green-500">Ready</span> to Ship
                    </div>
                    <button onClick={() => window.location.reload()} className="text-sm text-gray-400 hover:text-white">
                        Start Over
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('prd')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                activeTab === 'prd' ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <FileText size={18} />
                            PRD
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                activeTab === 'design' ? "bg-pink-600/20 text-pink-400 border border-pink-600/30" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <Palette size={18} />
                            Design Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                activeTab === 'tech' ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/30" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <Code size={18} />
                            Tech Specs
                        </button>
                        <button
                            onClick={() => setActiveTab('chatLog')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                activeTab === 'chatLog' ? "bg-purple-600/20 text-purple-400 border border-purple-600/30" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <MessageSquare size={18} />
                            Interview Log
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3 bg-gray-900 rounded-xl border border-white/10 p-8 min-h-[600px] relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold capitalize">
                                {activeTab === 'prd' && 'Product Requirements'}
                                {activeTab === 'design' && 'Design System'}
                                {activeTab === 'tech' && 'Technical Specifications'}
                                {activeTab === 'chatLog' && 'Interview Transcript'}
                            </h2>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm text-gray-300 transition-colors"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy Markdown'}
                            </button>
                        </div>
                        <div className="prose prose-invert prose-blue max-w-none bg-black/30 p-8 rounded-lg border border-white/5">
                            <ReactMarkdown>{artifacts[activeTab]}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
