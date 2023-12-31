import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiMethods } from "../../api";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import {
    ActionIcon,
    Box,
    Divider,
    Group,
    Loader,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import "./viewer.scss";
import {
    IconStarFilled,
    IconStar,
    IconSettings,
    IconListDetails,
    IconChecklist,
    IconLayoutList,
    IconLayoutKanban,
    IconSquare,
    IconCheckbox,
    IconShoppingBagPlus,
} from "@tabler/icons-react";
import { useLayoutContext } from "../Layout/ctx";
import { useMediaQuery } from "@mantine/hooks";
import { useModals } from "../../modals";
import { useEvent } from "../../util/events";
import { ListItemCard } from "./ItemCard";
import { useTranslation } from "react-i18next";
import { getCookie, setCookie } from "typescript-cookie";
import { ListSettingsModal } from "./SettingsModal";

export function ListViewer() {
    const { method, reference } = useParams() as {
        method: "id" | "alias";
        reference: string;
    };
    const nav = useNavigate();
    const api = useApiMethods();
    const [list, setList] = useState<GroceryList | RecipeList | null>(null);
    const [favorite, setFavorite] = useState<boolean>(false);
    const { refreshLists } = useLayoutContext();
    const [layout, setLayout] = useState<"list" | "grid">(
        (getCookie("lia-pref-layout") as "list" | "grid") ?? "list"
    );
    const isDesktop = useMediaQuery("(min-width: 48em)", true);
    const realLayout: typeof layout = useMemo(
        () => (isDesktop ? layout : "list"),
        [layout, isDesktop]
    );
    const { addItem } = useModals();
    const [items, setItems] = useState<ListItem[]>([]);
    const { t } = useTranslation();
    const layoutContext = useLayoutContext();

    const loadItems = useCallback(() => {
        if (api) {
            api.list.items(method, reference).then((result) => {
                if (result) {
                    setItems(result);
                } else {
                    setItems([]);
                }
            });
        }
    }, [api, method, reference]);

    useEvent<{ action: string }>(
        `list.${(list?.id ?? "null").replace(/-/g, "")}`,
        loadItems
    );

    useEvent<null>(
        `list.${(list?.id ?? "null").replace(/-/g, "")}.delete`,
        () => {
            layoutContext.refreshLists();
            nav("/");
        }
    );

    const loadList = useCallback(() => {
        if (api) {
            api.list.get(method, reference).then((result) => {
                if (result) {
                    setList(result);
                } else {
                    nav("/");
                }
            });
        }
    }, [method, reference, api]);

    useEvent<{ action: string }>(
        `list.${(list?.id ?? "null").replace(/-/g, "")}.settings`,
        loadList
    );

    useEffect(() => {
        api &&
            api.user.favorites().then((favorites): void => {
                setFavorite(
                    Boolean(
                        favorites.find(
                            (f) =>
                                f.reference.type === method &&
                                f.reference.reference === reference
                        )
                    )
                );
            });
    }, [api, list]);

    useEffect(loadList, [method, reference, api]);

    useEffect(loadItems, [method, reference, api]);

    useEffect(() => {
        setCookie("lia-pref-layout", layout);
    }, [layout]);

    const [settings, setSettings] = useState(false);

    return list && api ? (
        <>
            <Stack gap="sm" className="view-wrapper">
                <Group gap="sm" justify="space-between" pl="md" pr="md">
                    <Group gap="sm">
                        <ActionIcon
                            radius="xs"
                            onClick={(event) => {
                                event.stopPropagation();
                                setFavorite(!favorite);
                                api &&
                                    api.user
                                        .toggleFavorite({
                                            type: method,
                                            reference,
                                        })
                                        .then(refreshLists);
                            }}
                            variant="transparent"
                            color={favorite ? "yellow" : "white"}
                        >
                            {favorite ? <IconStarFilled /> : <IconStar />}
                        </ActionIcon>
                        <Divider orientation="vertical" />
                        {list.type === "grocery" ? (
                            <IconChecklist />
                        ) : (
                            <IconListDetails />
                        )}
                        <Text size="lg">{list.name}</Text>
                    </Group>
                    <Group gap="sm">
                        <ActionIcon
                            size="lg"
                            radius="xl"
                            onClick={() =>
                                addItem({ type: method, reference }, list)
                            }
                        >
                            <IconShoppingBagPlus size={20} />
                        </ActionIcon>
                        {isDesktop && (
                            <SegmentedControl
                                value={layout}
                                onChange={setLayout as any}
                                size="xs"
                                data={[
                                    {
                                        value: "list",
                                        label: (
                                            <IconLayoutList
                                                style={{ marginTop: "5px" }}
                                                size={20}
                                            />
                                        ),
                                    },
                                    {
                                        value: "grid",
                                        label: (
                                            <IconLayoutKanban
                                                style={{ marginTop: "5px" }}
                                                size={20}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        )}
                        {method === "id" && (
                            <ActionIcon
                                size="xl"
                                variant="subtle"
                                onClick={() => setSettings(true)}
                            >
                                <IconSettings />
                            </ActionIcon>
                        )}
                    </Group>
                </Group>
                <Divider />
                <ScrollArea className="items-area" type="auto">
                    {realLayout === "list" ? (
                        <Stack gap="sm" pl="sm" pr="sm">
                            {items
                                .filter((i) => !i.checked)
                                .map((v) => (
                                    <ListItemCard
                                        key={v.id}
                                        list={list}
                                        item={v}
                                        access={{ type: method, reference }}
                                    />
                                ))}
                            {items
                                .filter((i) => i.checked)
                                .map((v) => (
                                    <ListItemCard
                                        key={v.id}
                                        list={list}
                                        item={v}
                                        access={{ type: method, reference }}
                                    />
                                ))}
                        </Stack>
                    ) : (
                        <Group
                            gap="sm"
                            pl="sm"
                            pr="sm"
                            style={{ minHeight: "calc(100vh - 156px)" }}
                            align="start"
                        >
                            <Stack
                                gap="sm"
                                style={{
                                    width: "calc(50% - 13px)",
                                    height: "fit-content",
                                }}
                            >
                                <Group gap="md" style={{ userSelect: "none" }}>
                                    <IconSquare size={32} />
                                    <Text size="lg">
                                        {t("views.viewer.item.unchecked")}
                                    </Text>
                                </Group>
                                <Divider />
                                {items
                                    .filter((i) => !i.checked)
                                    .map((v) => (
                                        <ListItemCard
                                            key={v.id}
                                            list={list}
                                            item={v}
                                            access={{ type: method, reference }}
                                        />
                                    ))}
                            </Stack>
                            <Divider orientation="vertical" />
                            <Stack
                                gap="sm"
                                style={{
                                    width: "calc(50% - 13px)",
                                    height: "fit-content",
                                }}
                            >
                                <Group gap="md" style={{ userSelect: "none" }}>
                                    <IconCheckbox size={32} />
                                    <Text size="lg">
                                        {t("views.viewer.item.checked")}
                                    </Text>
                                </Group>
                                <Divider />
                                {items
                                    .filter((i) => i.checked)
                                    .map((v) => (
                                        <ListItemCard
                                            key={v.id}
                                            list={list}
                                            item={v}
                                            access={{ type: method, reference }}
                                        />
                                    ))}
                            </Stack>
                        </Group>
                    )}
                </ScrollArea>
            </Stack>
            <ListSettingsModal
                open={settings}
                setOpen={setSettings}
                list={list}
                access={{ type: method, reference }}
            />
        </>
    ) : (
        <Box className="loader-wrapper">
            <Loader className="loading-list" size="xl" />
        </Box>
    );
}
