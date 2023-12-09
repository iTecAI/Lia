export type AccountCreationInvite = {
    id: string;
    type: "create_account";
    uri: string;
    uses_remaining?: number;
    expires?: string;
};

export type ListInvite = {
    id: string;
    type: "list";
    uri: string;
    reference: string;
};
