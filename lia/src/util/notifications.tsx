import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function useNotifications() {
    const { t } = useTranslation();
    return {
        success: (message: string) =>
            notifications.show({
                title: t("common.notifications.success.title"),
                message,
                color: "green",
                icon: <IconCheck />,
            }),
        error: (message: string) =>
            notifications.show({
                title: t("common.notifications.error.title"),
                message,
                color: "red",
                icon: <IconX />,
            }),
    };
}
