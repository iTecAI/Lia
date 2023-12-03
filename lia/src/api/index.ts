import { useContext } from "react";
import { ApiProvider } from "./ApiProvider";
import {
    User,
    Session,
    ApiContextType,
    ApiResponse,
    ApiSettings,
    ApiContext,
} from "./types";
import { generateMethods } from "./methods";

export { ApiProvider };
export type { User, Session, ApiContextType, ApiResponse, ApiSettings };

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

export function useApiMethods(): ReturnType<typeof generateMethods> | null {
    const api = useApi();
    if (api.connected) {
        return api.methods;
    } else {
        return null;
    }
}

export function useApiSettings(): ApiSettings | null {
    const api = useApi();
    if (api.connected) {
        return api.settings;
    } else {
        return null;
    }
}
