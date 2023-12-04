import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/Layout/Layout";
import { LoginView } from "./views/Login/Login";
import { ListViewer } from "./views/ListViewer/ListViewer";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/login",
                element: <LoginView />,
            },
            {
                path: "/list/:method/:reference",
                element: <ListViewer />,
            },
        ],
    },
]);
