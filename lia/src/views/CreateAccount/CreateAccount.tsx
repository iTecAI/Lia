import {
    Paper,
    Stack,
    Group,
    Title,
    TextInput,
    PasswordInput,
    Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNotifications } from "../../util/notifications";
import { IconUser, IconPassword, IconUserPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApiSettings, useApiMethods } from "../../api";
import "./createAccount.scss";
import { useEffect } from "react";

export function CreateAccountView() {
    const { t } = useTranslation();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
            passwordConfirm: "",
        },
        validate: {
            username: (value) =>
                value.length > 0
                    ? null
                    : t("views.createAccount.username.errors.empty"),
            password: (value, { passwordConfirm }) =>
                value.length > 0
                    ? value.length <= 512
                        ? value === passwordConfirm
                            ? null
                            : t("views.createAccount.password.errors.match")
                        : t("views.createAccount.password.errors.tooLong")
                    : t("views.createAccount.password.errors.empty"),
        },
    });
    const settings = useApiSettings();
    const api = useApiMethods();
    const nav = useNavigate();
    const notifs = useNotifications();

    useEffect(() => {
        if (settings && !settings.allow_account_creation) {
            nav("/login");
        }
    }, [settings]);

    return (
        <Paper p="md" shadow="sm" radius="sm" className="ca-base">
            <form
                onSubmit={form.onSubmit(
                    (values) =>
                        api &&
                        api.auth
                            .createAccount(values.username, values.password)
                            .then((result) => {
                                if (result) {
                                    notifs.success(
                                        t(
                                            "views.createAccount.feedback.success"
                                        )
                                    );
                                    nav("/");
                                } else {
                                    notifs.error(
                                        t("views.createAccount.feedback.error")
                                    );
                                }
                            })
                )}
            >
                <Stack gap="sm">
                    <Group gap="md">
                        <IconUserPlus />
                        <Title order={4}>
                            {t("views.createAccount.title")}
                        </Title>
                    </Group>
                    <TextInput
                        withAsterisk
                        leftSection={<IconUser size={16} />}
                        label={t("views.createAccount.username.label")}
                        {...form.getInputProps("username")}
                    />
                    <PasswordInput
                        leftSection={<IconPassword size={16} />}
                        label={t("views.createAccount.password.label")}
                        {...form.getInputProps("password")}
                    />
                    <PasswordInput
                        leftSection={<IconPassword size={16} />}
                        label={t("views.createAccount.passwordConfirm.label")}
                        {...form.getInputProps("passwordConfirm")}
                    />
                    <Group gap="sm" justify={"space-between"}>
                        <Button variant="subtle" onClick={() => nav("/login")}>
                            {t("views.createAccount.actions.login")}
                        </Button>
                        <Button variant="filled" type="submit">
                            {t("views.createAccount.actions.submit")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
