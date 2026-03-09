import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const INPUT_BASE =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    
    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {hint ? <p id={hintId} className="text-xs text-muted-foreground">{hint}</p> : null}
        <input 
          id={inputId} 
          ref={ref} 
          className={`${INPUT_BASE} ${error ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/20' : ''}`} 
          aria-invalid={!!error}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim() || undefined}
          {...props} 
        />
        {error ? <p id={errorId} className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {hint ? <p id={hintId} className="text-xs text-muted-foreground">{hint}</p> : null}
        <textarea 
          id={inputId} 
          ref={ref} 
          className={`${INPUT_BASE} ${error ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/20' : ''}`} 
          aria-invalid={!!error}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim() || undefined}
          {...props} 
        />
        {error ? <p id={errorId} className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
