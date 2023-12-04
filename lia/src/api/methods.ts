import { ApiResponse } from ".";
import { User } from "../types/auth";
import { AccessReference, Favorite } from "../types/extra";
import { GroceryList, ListAccessSpec } from "../types/list";

export function generateMethods(
    request: <T>(
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
    ) => Promise<ApiResponse<T>>,
    setUser: (user: User | null) => void
) {
    return {
        auth: {
            login: async (
                username: string,
                password: string
            ): Promise<User | null> => {
                const result = await request<User>("/auth/login", {
                    method: "POST",
                    body: { username, password },
                });
                if (result.success) {
                    setUser(result.data);
                    return result.data;
                } else {
                    setUser(null);
                    return null;
                }
            },
            logout: async (): Promise<void> => {
                await request<null>("/auth/logout", { method: "POST" });
                setUser(null);
            },
        },
        list: {
            create: async (
                name: string,
                stores: string[],
                type: "grocery" | "recipe"
            ): Promise<GroceryList | null> => {
                const result = await request<GroceryList>(
                    "/grocery/lists/create",
                    {
                        method: "POST",
                        body: { name, stores, type },
                    }
                );
                if (result.success) {
                    return result.data;
                } else {
                    return null;
                }
            },
            get: async (
                method: "id" | "alias",
                ref: string
            ): Promise<GroceryList | null> => {
                const result = await request<GroceryList>(
                    `/grocery/lists/${method}/${ref}`
                );
                if (result.success) {
                    return result.data;
                } else {
                    return null;
                }
            },
        },
        user: {
            self: async (): Promise<User | null> => {
                const result = await request<User>("/user");
                if (result.success) {
                    return result.data;
                } else {
                    return null;
                }
            },
            lists: async (): Promise<ListAccessSpec[]> => {
                const result = await request<ListAccessSpec[]>("/user/lists");
                if (result.success) {
                    return result.data;
                } else {
                    return [];
                }
            },
            favorites: async (): Promise<Favorite[]> => {
                const result = await request<Favorite[]>("/user/favorites");
                if (result.success) {
                    return result.data;
                } else {
                    return [];
                }
            },
            toggleFavorite: async (
                list: ListAccessSpec | AccessReference
            ): Promise<null | Favorite> => {
                if (Object.keys(list).includes("data")) {
                    const result = await request<Favorite | null>(
                        `/user/favorites/${
                            (list as ListAccessSpec).access_type
                        }/${(list as ListAccessSpec).access_reference}`,
                        { method: "POST" }
                    );
                    if (result.success) {
                        return result.data;
                    } else {
                        return null;
                    }
                } else {
                    const result = await request<Favorite | null>(
                        `/user/favorites/${(list as AccessReference).type}/${
                            (list as AccessReference).reference
                        }`,
                        { method: "POST" }
                    );
                    if (result.success) {
                        return result.data;
                    } else {
                        return null;
                    }
                }
            },
        },
    };
}
