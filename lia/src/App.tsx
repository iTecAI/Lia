import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./routes";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as langEN from "./lang/en.json";
import { ApiProvider } from "./api";

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: langEN,
        },
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
        escapeValue: false,
    },
});

function App() {
    return (
        <MantineProvider defaultColorScheme="dark">
            <ApiProvider>
                <ModalsProvider>
                    <RouterProvider router={appRouter} />
                </ModalsProvider>
            </ApiProvider>
        </MantineProvider>
    );
}

export default App;
