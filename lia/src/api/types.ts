import { createContext } from "react";

export type ApiResponse<T = any> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          code: number;
          detail: string;
      };

export type ApiMethods = {};

export type Session = {
    id: string;
    last_request: string;
    user_id: string;
};

export type User = {
    id: string;
    username: string;
};

export type ApiSettings = {
    store_location: string;
    store_support: string[];
    allow_account_creation: boolean;
};

export type ApiContextType =
    | {
          connected: true;
          session: Session;
          user: User | null;
          methods: ApiMethods;
          settings: ApiSettings;
      }
    | {
          connected: false;
      };

export const ApiContext = createContext<ApiContextType>({ connected: false });
