import React from 'react';

interface InputProps {
    name: string;
    label?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    defaultValue?: string;
    pattern?: string;
}

export default function EasyInput({
    name,
    label,
    type = "text",
    required = false,
    placeholder,
    defaultValue,
    pattern,
}: InputProps) {
    return (
        <div className="formkit-input-container">
            {label && (
                <label htmlFor={name}>
                    {label}

                    {required && <span className="required">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                defaultValue={defaultValue}
                pattern={pattern}
            />
        </div>
    );
}
