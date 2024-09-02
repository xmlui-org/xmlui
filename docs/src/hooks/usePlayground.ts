import {useContext} from "react";
import {PlaygroundContext} from "@/src/state/store";

export const usePlayground = () => {
    const context = useContext(PlaygroundContext);
    if (context === undefined) {
        throw new Error('usePlayground must be used within a PlaygroundProvider');
    }

    return context;
};
