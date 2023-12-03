import { ReactNode, useEffect, useState } from "react";
import { ApiContext, ApiResponse, ApiSettings, Session, User } from "./types";
import { generateMethods } from "./methods";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<ApiSettings | null>(null);
    const [firstLoad, setFirstLoad] = useState<boolean>(false);

    useEffect(() => {
        fetch("/api/auth/session", { method: "GET" }).then(async (response) => {
            if (response.ok) {
                setSession(await response.json());
            } else {
                setSession(null);
            }
        });
    }, []);

    async function request<T = any>(
        path: string,
        options?: Partial<
            | {
                  method: "GET" | "DELETE";
                  params: { [key: string]: any };
                  body: undefined;
              }
            | {
                  method: "POST" | "PUT";
                  params: { [key: string]: any };
                  body: any;
              }
        >
    ): Promise<ApiResponse<T>> {
        if (session) {
            const params = options?.params
                ? "?" + new URLSearchParams(options.params).toString()
                : "";
            const result = await fetch(`/api${path}${params}`, {
                method: options?.method ?? "GET",
                body: options?.body ? JSON.stringify(options.body) : undefined,
            });
            if (result.ok) {
                if (result.status === 204) {
                    return {
                        success: true,
                        data: null as any,
                    };
                } else {
                    const data = await result.text();
                    try {
                        return {
                            success: true,
                            data: JSON.parse(data),
                        };
                    } catch {
                        return {
                            success: true,
                            data: data as any,
                        };
                    }
                }
            } else {
                return {
                    success: false,
                    code: result.status,
                    detail: await result.text(),
                };
            }
        } else {
            return {
                success: false,
                code: 0,
                detail: "not connected",
            };
        }
    }

    useEffect(() => {
        if (!session) {
            return;
        }
        if (session?.user_id) {
            request<User>("/user").then((result) => {
                if (result.success) {
                    setUser(result.data);
                } else {
                    setUser(null);
                }
                setFirstLoad(true);
            });
        } else {
            setUser(null);
            setFirstLoad(true);
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            request<ApiSettings>("/").then((result) =>
                result.success ? setSettings(result.data) : setSettings(null)
            );
        } else {
            setSettings(null);
        }
    }, [session]);

    return (
        <ApiContext.Provider
            value={
                session && settings && firstLoad
                    ? {
                          connected: true,
                          session,
                          user,
                          methods: generateMethods(request, setUser),
                          settings,
                      }
                    : { connected: false }
            }
        >
            {children}
        </ApiContext.Provider>
    );
}
