export type Session = {
    id: string;
    last_request: string;
    user_id: string;
};

export type User = {
    id: string;
    username: string;
    admin: boolean;
};
