import {
    Button,
    Group,
    Paper,
    PasswordInput,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import "./login.scss";
import { useTranslation } from "react-i18next";
import { IconLogin, IconPassword, IconUser } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useApiMethods, useApiSettings } from "../../api";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../util/notifications";

export function LoginView() {
    const { t } = useTranslation();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length > 0
                    ? null
                    : t("views.login.username.errors.empty"),
            password: (value) =>
                value.length > 0
                    ? value.length <= 512
                        ? null
                        : t("views.login.password.errors.tooLong")
                    : t("views.login.password.errors.empty"),
        },
    });
    const settings = useApiSettings();
    const api = useApiMethods();
    const nav = useNavigate();
    const notifs = useNotifications();
    return (
        <Paper p="md" shadow="sm" radius="sm" className="login-base">
            <form
                onSubmit={form.onSubmit(
                    (values) =>
                        api &&
                        api.auth
                            .login(values.username, values.password)
                            .then((result) => {
                                if (result) {
                                    notifs.success(
                                        t("views.login.feedback.success")
                                    );
                                    nav("/");
                                } else {
                                    notifs.error(
                                        t("views.login.feedback.error")
                                    );
                                }
                            })
                )}
            >
                <Stack gap="sm">
                    <Group gap="md">
                        <IconLogin />
                        <Title order={4}>{t("views.login.title")}</Title>
                    </Group>
                    <TextInput
                        withAsterisk
                        leftSection={<IconUser size={16} />}
                        label={t("views.login.username.label")}
                        {...form.getInputProps("username")}
                    />
                    <PasswordInput
                        leftSection={<IconPassword size={16} />}
                        label={t("views.login.password.label")}
                        {...form.getInputProps("password")}
                    />
                    <Group
                        gap="sm"
                        justify={
                            settings?.allow_account_creation
                                ? "space-between"
                                : "end"
                        }
                    >
                        {settings?.allow_account_creation && (
                            <Button
                                variant="subtle"
                                onClick={() => nav("/create_account")}
                            >
                                {t("views.login.actions.createAccount")}
                            </Button>
                        )}
                        <Button variant="filled" type="submit">
                            {t("views.login.actions.login")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
