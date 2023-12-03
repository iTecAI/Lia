import { ApiResponse, User } from ".";

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
        },
    };
}
