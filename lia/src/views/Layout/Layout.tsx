import {
    ActionIcon,
    AppShell,
    Box,
    Burger,
    Button,
    Divider,
    Group,
    Skeleton,
    Space,
    Stack,
    Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconChecklist,
    IconLogout,
    IconPlus,
    IconShieldCog,
    IconUserCog,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApiConnection, useApiMethods, useUser } from "../../api";
import "./layout.scss";
import { useEffect } from "react";

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();
    const user = useUser();
    const connected = useApiConnection();
    const api = useApiMethods();

    const nav = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== "/login" && !user && connected) {
            nav("/login");
        }
    }, [location, user, connected]);

    return (
        <AppShell
            className="app-root"
            header={{ height: { base: 64, sm: 48 }, offset: true }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: user
                    ? { mobile: !opened }
                    : { mobile: true, desktop: true },
            }}
            padding={"md"}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    {user && (
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                    )}
                    <IconChecklist size={24} />
                    <Title order={4}>{t("appName")}</Title>
                </Group>
            </AppShell.Header>
            {user && (
                <AppShell.Navbar p="md" className="list-nav">
                    <Stack gap="sm" h={"100%"}>
                        <Box className="list-container" p="sm">
                            <Stack gap="sm" className="list-stack">
                                {Array(50)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            h={28}
                                            animate={false}
                                        />
                                    ))}
                            </Stack>
                        </Box>
                        <Button
                            leftSection={<IconPlus />}
                            justify="space-between"
                            size="lg"
                            className="add-list-action"
                        >
                            {t("views.layout.create.button")}
                        </Button>
                        <Divider />
                        <Group gap="sm">
                            {user.admin && (
                                <ActionIcon size="lg" variant="subtle">
                                    <IconShieldCog />
                                </ActionIcon>
                            )}
                            <ActionIcon size="lg" variant="subtle">
                                <IconUserCog />
                            </ActionIcon>
                            <Button
                                className="logout-action"
                                rightSection={<IconLogout />}
                                justify="space-between"
                                variant="subtle"
                                onClick={() => api && api.auth.logout()}
                            >
                                {t("views.layout.logout")}
                            </Button>
                        </Group>
                    </Stack>
                </AppShell.Navbar>
            )}
            <AppShell.Main className="app-content">
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
