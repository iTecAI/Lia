import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/Layout/Layout";
import { LoginView } from "./views/Login/Login";
import { ListViewer } from "./views/ListViewer/ListViewer";
import { CreateAccountView } from "./views/CreateAccount/CreateAccount";

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
                path: "/create_account",
                element: <CreateAccountView />,
            },
            {
                path: "/list/:method/:reference",
                element: <ListViewer />,
            },
        ],
    },
]);
