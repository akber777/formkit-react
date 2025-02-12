import Listener from "../utils/listener.utils";
import React, { FormEvent } from "react";

export type ListenerType = "isFetching" | "isError" | "isDone" | "submitData" | "reset"

interface Props<T extends Record<string, any> = Record<string, any>> {
    url?: string;
    action?: "POST" | "PUT" | "DELETE" | "PATCH";
    children: React.ReactNode;
    onSubmit?: (data: T) => void;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
    initalData?: T & Record<string, any>;
    customFetch?: (data: T) => Promise<any>;
    submitText?: string;
    loadingText?: string;
    formData?: boolean;
}

type ValidateProps<T extends Record<string, any>> = Props<T> &
    (
        | { customFetch: (data: T) => Promise<any>; url?: never }
        | { url: string; customFetch?: never }
    );

interface FormChildProps<T> {
    name: keyof T;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
}


export default function FormKit<
    T extends Record<string, any> = Record<string, any>
>({ children, ...rest }: ValidateProps<T>) {
    const {
        url,
        action = "POST",
        onSubmit,
        onSuccess,
        onError,
        initalData,
        customFetch,
        submitText = "Submit",
        loadingText = "Submitting...",
    } = rest;
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState<T>((initalData || {}) as T);

    const getFormData = (formElement: HTMLFormElement) => {
        const formInputs = Array.from(
            formElement.querySelectorAll("*")
        ).filter(element => {
            const el = element as HTMLElement;
            return (
                (el.hasAttribute('name') &&
                    (
                        el instanceof HTMLInputElement ||
                        el instanceof HTMLSelectElement ||
                        el instanceof HTMLTextAreaElement
                    )) ||
                el.hasAttribute('data-formkit-controller')
            );
        });

        if (rest.formData) {
            return new FormData(formElement);
        }

        const newFormData = {} as T;

        formInputs.forEach((element) => {
            const input = element as HTMLElement;
            const name = input.getAttribute('name') || input.getAttribute('data-name');

            if (!name) return;

            let value;

            if (input.hasAttribute('data-formkit-controller')) {
                try {
                    value = JSON.parse(input.getAttribute('data-value') || '');
                } catch {
                    value = input.getAttribute('data-value');
                }
            } else if (input instanceof HTMLInputElement && input.type === 'file') {
                return;
            } else {
                value = (input as HTMLInputElement).value;
            }

            if (value !== undefined) {
                (newFormData as Record<keyof T, string>)[name as keyof T] = value;
            }
        });

        return {
            ...(initalData || {}),
            ...formData,
            ...newFormData
        };
    };

    const resetFormElements = (defaultValues: Record<string, any> = {}) => {
        const formElement = document.querySelector('form');
        if (!formElement) return;

        const formInputs = Array.from(
            formElement.querySelectorAll("*")
        ).filter(element => {
            const el = element as HTMLElement;
            return (
                (el.hasAttribute('name') &&
                    (
                        el instanceof HTMLInputElement ||
                        el instanceof HTMLSelectElement ||
                        el instanceof HTMLTextAreaElement
                    )) ||
                el.hasAttribute('data-formkit-controller')
            );
        });

        formInputs.forEach((element) => {
            const input = element as HTMLElement;
            const name = input.getAttribute('name') || input.getAttribute('data-name');
            const defaultValue = name ? defaultValues[name] : undefined;

            if (input.hasAttribute('data-formkit-controller')) {
                const valueToSet = defaultValue !== undefined ?
                    (typeof defaultValue === 'object' ? JSON.stringify(defaultValue) : String(defaultValue))
                    : '';
                input.setAttribute('data-value', valueToSet);
                const event = new CustomEvent('formkit:setValue', {
                    detail: { value: defaultValue !== undefined ? defaultValue : '' }
                });
                input.dispatchEvent(event);
            } else if (input instanceof HTMLInputElement) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = defaultValue === true;
                } else {
                    input.value = defaultValue !== undefined ? String(defaultValue) : '';
                }
            } else if (input instanceof HTMLSelectElement) {
                if (defaultValue !== undefined) {
                    input.value = String(defaultValue);
                } else {
                    input.selectedIndex = 0;
                }
            } else if (input instanceof HTMLTextAreaElement) {
                input.value = defaultValue !== undefined ? String(defaultValue) : '';
            }
        });

        setFormData(defaultValues as T);
    };

    Listener.on<ListenerType>("reset", (params: any) => {
        if (typeof params === "object" && params !== null) {
            setFormData((prev) => ({
                ...prev,
                ...params
            }));

            Object.entries(params).forEach(([name, value]) => {
                const element = document.querySelector(`[name="${name}"]`) as HTMLElement;
                if (element) {
                    if (element instanceof HTMLSelectElement) {
                        element.value = String(value);
                    } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                        element.value = String(value);
                    }
                }

                const controllerElement = document.querySelector(`[data-formkit-controller][data-name="${name}"]`);
                if (controllerElement) {
                    controllerElement.setAttribute('data-value', typeof value === 'object' ? JSON.stringify(value) : String(value));
                    const event = new CustomEvent('formkit:setValue', {
                        detail: { value }
                    });
                    controllerElement.dispatchEvent(event);
                }
            });
        } else {
            resetFormElements(initalData || {});
        }
    });

    React.useEffect(() => {
        if (initalData) {
            Object.entries(initalData).forEach(([name, value]) => {
                const element = document.querySelector(`[name="${name}"]`) as HTMLElement;
                if (element) {
                    if (element instanceof HTMLSelectElement) {
                        element.value = value;
                    } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                        element.value = value;
                    }
                }

                const controllerElement = document.querySelector(`[data-formkit-controller][data-name="${name}"]`);
                if (controllerElement) {
                    controllerElement.setAttribute('data-value', typeof value === 'object' ? JSON.stringify(value) : String(value));

                    const event = new CustomEvent('formkit:setValue', {
                        detail: { value }
                    });
                    controllerElement.dispatchEvent(event);
                }
            });

            setFormData((prev) => ({ ...prev, ...initalData }));
        }
    }, [initalData]);

    const handleFormChange = (name: keyof T, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        Listener.emit('isFetching');

        const formElement = e.target as HTMLFormElement;
        const submitData = getFormData(formElement);

        try {
            let result;
            if (customFetch) {
                result = await customFetch(submitData as T);
            } else if (url) {
                let finalUrl = url;
                const fetchConfig: RequestInit = {
                    method: action,
                    headers: rest.formData ? undefined : {
                        "Content-Type": "application/json",
                    } as HeadersInit,
                };

                if (action !== "DELETE") {
                    fetchConfig.body = rest.formData
                        ? (submitData as FormData)
                        : JSON.stringify(submitData);
                }

                const response = await fetch(finalUrl, fetchConfig);

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                result = await response.json();
            } else {
                throw new Error("Either url or customFetch must be provided");
            }
            onSuccess?.(result);
        } catch (error) {
            Listener.emit('isError', error);
            onError?.(error);
        } finally {
            setLoading(false);
            Listener.emit('isDone');
        }
    };

    const customOnSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formElement = e.target as HTMLFormElement;
        const completeFormData = getFormData(formElement);
        onSubmit?.(completeFormData as T);
    };

    const hasSubmitButton = React.Children.toArray(children).some((child) => {
        if (React.isValidElement(child)) {
            return (child as { props: { type?: string } }).props.type === "submit";
        }
        return false;
    });

    return (
        <form
            action={url}
            method={action}
            onSubmit={onSubmit ? customOnSubmit : handleSubmit}
            autoComplete="off"
        >
            {React.Children.map(children, (child) => {
                if (
                    React.isValidElement<FormChildProps<T>>(child) &&
                    child.props.name
                ) {
                    const value = formData[child.props.name as keyof T];
                    return React.cloneElement(child, {
                        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                            handleFormChange(child.props.name as keyof T, e.target.value),
                        value: value !== undefined ? String(value) : "",
                    });
                }
                return child;
            })}
            {!hasSubmitButton && (
                <button type="submit" disabled={loading}>
                    {loading ? loadingText : submitText}
                </button>
            )}
        </form>
    );
}