export type AccessReference = {
    type: "id" | "alias";
    reference: string;
};

export type Favorite = {
    user_id: string;
    reference: AccessReference;
};