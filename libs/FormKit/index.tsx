import React from "react";

interface Props<T extends Record<string, any> = Record<string, any>> {
    url?: string;
    action?: "POST" | "PUT" | "DELETE" | "PATCH";
    children: React.ReactNode;
    onSubmit?: (data: T) => void;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
    body?: T;
    customFetch?: (data: T) => Promise<any>;
    submitText?: string;
    loadingText?: string;
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
        body,
        customFetch,
        submitText = "Submit",
        loadingText = "Submitting...",
    } = rest;
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState<T>((body || {}) as T);


    React.useEffect(() => {
        if (body)
            setFormData(body);
    }, [body]);



    const handleFormChange = (name: keyof T, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        let submitData: T;

        if (!body) {
            const formElement = e.target as HTMLFormElement;
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

            const newFormData = {} as T;

            formInputs.forEach((element) => {
                const input = element as HTMLElement;
                const name = input.getAttribute('name') || input.getAttribute('data-name');

                if (name) {
                    let value;

                    if (input.hasAttribute('data-formkit-controller')) {
                        try {
                            value = JSON.parse(input.getAttribute('data-value') || '');
                        } catch {
                            value = input.getAttribute('data-value');
                        }
                    } else {
                        value = (input as HTMLInputElement).value;
                    }

                    if (value !== undefined) {
                        (newFormData as Record<keyof T, string>)[name as keyof T] = value;
                    }
                }
            });

            submitData = newFormData;
            setFormData(newFormData);
        } else {
            submitData = { ...body, ...formData };
        }

        try {
            onSubmit?.(submitData);

            let result;
            if (customFetch) {
                result = await customFetch(submitData);
            } else if (url) {
                let finalUrl = url;
                const fetchConfig: RequestInit = {
                    method: action,
                    headers: {
                        "Content-Type": "application/json",
                    } as HeadersInit,
                };

                if (action !== "DELETE") {
                    fetchConfig.body = JSON.stringify(submitData);
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
            onError?.(error);
        } finally {
            setLoading(false);
        }
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
            onSubmit={handleSubmit}
            autoComplete="off"
        >
            {React.Children.map(children, (child) => {
                if (
                    React.isValidElement<FormChildProps<T>>(child) &&
                    child.props.name
                ) {
                    return React.cloneElement(child, {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFormChange(child.props.name as keyof T, e.target.value),
                        value: formData[child.props.name as keyof T] || "",
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
