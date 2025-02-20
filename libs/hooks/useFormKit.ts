import { ListenerType } from "libs/FormKit";
import Listener from "../utils/listener.utils";
import React from "react";

export function useFormKit() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<unknown>();

    const reset = (params?: any) => {
        Listener.emit("reset", params)
    }

    Listener.on<ListenerType>("isFetching", () => {
        setIsLoading(true)
    })

    Listener.on<ListenerType>("isError", (e) => {
        setIsLoading(false)
        setError(e)
    })

    Listener.on<ListenerType>("isDone", () => {
        setIsLoading(false)
    })

    return {
        isLoading,
        error,
        reset
    };
}
