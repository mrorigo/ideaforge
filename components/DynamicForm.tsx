"use client";

import React, { useState } from 'react';
import { FormSchema } from '@/lib/llm-protocol';
import { cn } from '@/lib/utils';

interface DynamicFormProps {
    schema: FormSchema;
    onSubmit: (data: Record<string, any>) => void;
    isLoading?: boolean;
}

export function DynamicForm({ schema, onSubmit, isLoading }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleMultiSelectChange = (id: string, value: string, checked: boolean) => {
        setFormData((prev) => {
            const current = (prev[id] as string[]) || [];
            if (checked) {
                return { ...prev, [id]: [...current, value] };
            } else {
                return { ...prev, [id]: current.filter((item) => item !== value) };
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm">
            {schema.title && (
                <h3 className="text-xl font-semibold text-white mb-4">{schema.title}</h3>
            )}
            {schema.description && (
                <p className="text-gray-400 mb-6 text-sm">{schema.description}</p>
            )}

            <div className="space-y-5">
                {schema.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-300">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>

                        {field.description && (
                            <p className="text-xs text-gray-500 mb-1">{field.description}</p>
                        )}

                        {field.type === 'text' && (
                            <input
                                type="text"
                                id={field.id}
                                required={field.required}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                value={formData[field.id] || ''}
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                id={field.id}
                                required={field.required}
                                placeholder={field.placeholder}
                                rows={4}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all resize-none"
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                value={formData[field.id] || ''}
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                id={field.id}
                                required={field.required}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all appearance-none"
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                value={formData[field.id] || ''}
                            >
                                <option value="" disabled>Select an option</option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt} className="bg-gray-900 text-white">
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        )}

                        {field.type === 'radio' && (
                            <div className="space-y-2">
                                {field.options?.map((opt) => (
                                    <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="radio"
                                                name={field.id}
                                                value={opt}
                                                required={field.required}
                                                className="peer sr-only"
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                checked={formData[field.id] === opt}
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-600 rounded-full peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all"></div>
                                            <div className="absolute w-2 h-2 bg-white rounded-full top-1.5 left-1.5 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {field.type === 'checkbox' && (
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id={field.id}
                                        className="peer sr-only"
                                        onChange={(e) => handleChange(field.id, e.target.checked)}
                                        checked={!!formData[field.id]}
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-600 rounded-md peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all"></div>
                                    <svg className="absolute w-3.5 h-3.5 text-white top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors">{field.label}</span>
                            </label>
                        )}

                        {field.type === 'multiselect' && (
                            <div className="space-y-2">
                                {field.options?.map((opt) => (
                                    <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                className="peer sr-only"
                                                onChange={(e) => handleMultiSelectChange(field.id, opt, e.target.checked)}
                                                checked={(formData[field.id] as string[])?.includes(opt) || false}
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-600 rounded-md peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all"></div>
                                            <svg className="absolute w-3.5 h-3.5 text-white top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    schema.submitLabel || 'Continue'
                )}
            </button>
        </form>
    );
}
