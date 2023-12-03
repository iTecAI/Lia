import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/Layout/Layout";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
    },
]);
