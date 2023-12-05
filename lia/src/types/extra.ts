export type AccessReference = {
    type: "id" | "alias";
    reference: string;
};

export type Favorite = {
    user_id: string;
    reference: AccessReference;
};

export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;