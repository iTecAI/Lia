export type GroceryList = {
    id: string;
    name: string;
    owner_id: string;
    included_stores: string[];
    type: "grocery";
};

export type RecipeList = {
    id: string;
    name: string;
    owner_id: string;
    included_stores: string[];
    type: "recipe";
};

export type ListAccessSpec = {
    data: GroceryList | RecipeList;
    access_type: "id" | "alias";
    access_reference: string;
    favorited: boolean;
};
