import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChecklist } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { useUser } from "../../api";
import "./layout.scss";

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();
    const user = useUser();
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
            {user && <AppShell.Navbar p="md">Navbar</AppShell.Navbar>}
            <AppShell.Main className="app-content">
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
