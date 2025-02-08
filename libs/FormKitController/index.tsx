import React from 'react';

interface ControllerProps<T = any> {
    name: string;
    render: (props: {
        value: T;
        onChange: (value: T) => void;
    }) => React.ReactElement;
}

export default function FormKitController<T = any>({ name, render }: ControllerProps<T>) {
    const [value, setValue] = React.useState<T>({} as T);

    return (
        <div
            data-formkit-controller
            data-name={name}
            data-value={JSON.stringify(value)}
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