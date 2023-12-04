import { GroceryItem } from "./grocery";

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

export type ListItemQuantity = {
    amount: number;
    unit: string | null;
};

export type ListItemAlternative = {
    alternative_to: string;
    index: number;
};

export type ListItem = {
    id: string;
    name: string;
    list_id: string;
    checked: boolean;
    quantity: ListItemQuantity;
    alternative: ListItemAlternative | null;
    categories: string[];
    price: number | null;
    location: string | null;
    linked_item: GroceryItem | null;
    recipe: string | null;
};
