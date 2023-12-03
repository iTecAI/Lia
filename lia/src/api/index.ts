import { useContext } from "react";
import { ApiProvider } from "./ApiProvider";
import {
    User,
    Session,
    ApiContextType,
    ApiMethods,
    ApiResponse,
    ApiSettings,
    ApiContext,
} from "./types";

export { ApiProvider };
export type {
    User,
    Session,
    ApiContextType,
    ApiMethods,
    ApiResponse,
    ApiSettings,
};

export function useApi(): ApiContextType {
    return useContext(ApiContext);
}

export function useSession(): Session | null {
    const api = useApi();
    if (api.connected) {
        return api.session;
    } else {
        return null;
    }
}

export function useUser(): User | null {
    const api = useApi();
    if (api.connected) {
        return api.user;
    } else {
        return null;
    }
}

export function useApiConnection(): boolean {
    return useApi().connected;
}

export function useApiMethods(): ApiMethods | null {
    const api = useApi();
    if (api.connected) {
        return api.methods;
    } else {
        return null;
    }
}
