import {
    ActionIcon,
    AppShell,
    Burger,
    Button,
    Divider,
    Group,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconChecklist,
    IconListDetails,
    IconLogout,
    IconMoonFilled,
    IconPlus,
    IconShieldCog,
    IconSunFilled,
    IconUserCog,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApiConnection, useApiMethods, useUser } from "../../api";
import "./layout.scss";
import { useCallback, useEffect, useState } from "react";
import { useModals } from "../../modals";
import { AddListAction } from "../../modals/AddListModal";
import { ListAccessSpec } from "../../types/list";
import { ListCard } from "../../components/ListCard/ListCard";
import { setCookie } from "typescript-cookie";

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();
    const user = useUser();
    const connected = useApiConnection();
    const api = useApiMethods();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const nav = useNavigate();
    const location = useLocation();
    const { addList } = useModals();
    const [lists, setLists] = useState<ListAccessSpec[]>([]);

    useEffect(() => {
        if (
            !["/login", "/create_account"].includes(location.pathname) &&
            !user &&
            connected
        ) {
            nav("/login");
        }
    }, [location, user, connected]);

    const addListCompletion = useCallback(
        async (action: AddListAction, mode: "lists" | "recipes") => {
            if (action.type === "add") {
                if (api) {
                    const result = await api.user.joinList(action.invite);
                    if (result) {
                        api.user.lists().then(setLists);
                    }
                }
            } else {
                if (api) {
                    const result = await api.list.create(
                        action.name,
                        action.stores,
                        mode === "lists" ? "grocery" : "recipe"
                    );
                    if (result) {
                        api.user.lists().then(setLists);
                    }
                }
            }
        },
        [api]
    );

    useEffect(() => {
        if (api) {
            api.user.lists().then(setLists);
        }
    }, [api]);

    const [listDisplay, setListDisplay] = useState<"lists" | "recipes">(
        "lists"
    );

    return (
        <AppShell
            className="app-root"
            header={{ height: 64, offset: true }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: user
                    ? { mobile: !opened }
                    : { mobile: true, desktop: true },
            }}
            padding={0}
        >
            <AppShell.Header>
                <Group gap="sm" justify="space-between" h="100%" px="md">
                    <Group h="100%">
                        {user && (
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                        )}
                        <Group
                            gap="sm"
                            className="header-title"
                            onClick={() => nav("/")}
                        >
                            <IconChecklist size={24} />
                            <Title order={4}>{t("appName")}</Title>
                        </Group>
                    </Group>
                    <ActionIcon
                        size="lg"
                        onClick={() => {
                            setCookie(
                                "lia-pref-color",
                                colorScheme === "dark" ? "light" : "dark"
                            );
                            toggleColorScheme();
                        }}
                        variant="transparent"
                    >
                        {colorScheme === "dark" ? (
                            <IconSunFilled />
                        ) : (
                            <IconMoonFilled />
                        )}
                    </ActionIcon>
                </Group>
            </AppShell.Header>
            {user && (
                <AppShell.Navbar p="sm" className="list-nav">
                    <Stack gap="sm" h={"100%"}>
                        {/*<SegmentedControl
                            value={listDisplay}
                            onChange={setListDisplay as any}
                            fullWidth
                            data={[
                                {
                                    value: "lists",
                                    label: (
                                        <Group gap="sm" justify="space-between">
                                            <IconChecklist size={20} />
                                            <Text>
                                                {t(
                                                    "views.layout.lists.display.lists"
                                                )}
                                            </Text>
                                        </Group>
                                    ),
                                },
                                {
                                    value: "recipes",
                                    label: (
                                        <Group gap="sm" justify="space-between">
                                            <IconListDetails size={20} />
                                            <Text>
                                                {t(
                                                    "views.layout.lists.display.recipes"
                                                )}
                                            </Text>
                                        </Group>
                                    ),
                                },
                            ]}
                        />*/}
                        <ScrollArea className="list-container" type="scroll">
                            <Stack gap="sm" className="list-stack">
                                {lists
                                    .filter(
                                        (v) =>
                                            (listDisplay === "lists"
                                                ? v.data.type === "grocery"
                                                : v.data.type === "recipe") &&
                                            v.favorited
                                    )
                                    .map((v) => (
                                        <ListCard
                                            list={v}
                                            key={v.access_reference}
                                            refresh={() => {
                                                api &&
                                                    api.user
                                                        .lists()
                                                        .then(setLists);
                                            }}
                                        />
                                    ))}
                                {lists.filter(
                                    (v) =>
                                        (listDisplay === "lists"
                                            ? v.data.type === "grocery"
                                            : v.data.type === "recipe") &&
                                        v.favorited
                                ).length > 0 &&
                                    lists.filter(
                                        (v) =>
                                            (listDisplay === "lists"
                                                ? v.data.type === "grocery"
                                                : v.data.type === "recipe") &&
                                            !v.favorited
                                    ).length > 0 && <Divider />}
                                {lists
                                    .filter(
                                        (v) =>
                                            (listDisplay === "lists"
                                                ? v.data.type === "grocery"
                                                : v.data.type === "recipe") &&
                                            !v.favorited
                                    )
                                    .map((v) => (
                                        <ListCard
                                            list={v}
                                            key={v.access_reference}
                                            refresh={() => {
                                                api &&
                                                    api.user
                                                        .lists()
                                                        .then(setLists);
                                            }}
                                        />
                                    ))}
                            </Stack>
                        </ScrollArea>
                        <Button
                            leftSection={<IconPlus />}
                            justify="space-between"
                            size="lg"
                            className="add-list-action"
                            onClick={() =>
                                addList(addListCompletion, listDisplay)
                            }
                        >
                            {t(`views.layout.create.${listDisplay}`)}
                        </Button>
                        <Divider />
                        <Group gap="sm">
                            {/*user.admin && (
                                <ActionIcon size="lg" variant="subtle">
                                    <IconShieldCog />
                                </ActionIcon>
                            )*/}
                            {/*<ActionIcon size="lg" variant="subtle">
                                <IconUserCog />
                            </ActionIcon>*/}
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
                <Outlet
                    context={{
                        refreshLists: () =>
                            api && api.user.lists().then(setLists),
                    }}
                />
            </AppShell.Main>
        </AppShell>
    );
}
