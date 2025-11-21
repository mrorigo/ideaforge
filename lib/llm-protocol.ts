export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox';

export interface FormField {
    id: string;
    label: string;
    type: FieldType;
    options?: string[]; // For select/radio/multiselect
    placeholder?: string;
    required?: boolean;
    description?: string; // Helper text
}

export interface FormSchema {
    title?: string;
    description?: string;
    fields: FormField[];
    submitLabel?: string;
}

export interface Artifacts {
    prd: string;
    design: string;
    tech: string;
    chatLog: string;
}

export interface LLMResponse {
    thought?: string; // Internal reasoning, not shown to user
    message: string; // The chat message from the AI
    form?: FormSchema;
    isComplete?: boolean; // If true, the interview is done
    artifacts?: Artifacts;
}
