export type GroceryItem = {
    type: string;
    id: string;
    name: string;
    location: string | null;
    images: string[];
    tags: string[];
    categories: string[];
    price: number;
    ratings: {
        average: number;
        count: number;
    };
    metadata: { [key: string]: any };
};
