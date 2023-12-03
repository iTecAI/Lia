import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/Layout/Layout";
import { LoginView } from "./views/Login/Login";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/login",
                element: <LoginView />,
            },
        ],
    },
]);
