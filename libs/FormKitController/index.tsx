import React, { useEffect, useRef } from 'react';

interface ControllerProps<T = any> {
    name: string;
    render: (props: {
        value: T;
        onChange: (value: T) => void;
    }) => React.ReactElement;
}

export default function FormKitController<T = any>({ name, render }: ControllerProps<T>) {
    const [value, setValue] = React.useState<T>({} as T);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleSetValue = (event: CustomEvent) => {
            const { value } = event.detail;
            setValue(value);
        };

        element.addEventListener('formkit:setValue', handleSetValue as EventListener);
        return () => {
            element.removeEventListener('formkit:setValue', handleSetValue as EventListener);
        };
    }, []);

    return (
        <div
            data-formkit-controller
            data-name={name}
            data-value={JSON.stringify(value)}
            ref={ref}
        >
            {render({
                value,
                onChange: (newValue) => {
                    setValue(newValue);
                }
            })}
        </div>
    );
} 