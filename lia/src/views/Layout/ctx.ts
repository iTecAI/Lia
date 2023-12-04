import { useOutletContext } from "react-router-dom";

export type LayoutContext = {
    refreshLists: () => void;
};

export function useLayoutContext(): LayoutContext {
    return useOutletContext<LayoutContext>();
}
