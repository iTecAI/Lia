import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChecklist } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();
    return (
        <AppShell
            className="app-root"
            header={{ height: { base: 64, sm: 48 } }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding={"md"}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <IconChecklist size={24} />
                    <Title order={4}>{t("appName")}</Title>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">Navbar</AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
