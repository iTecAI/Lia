import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiMethods } from "../../api";
import { GroceryList, RecipeList } from "../../types/list";
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
    IconLayoutGrid,
    IconPlus,
} from "@tabler/icons-react";
import { useLayoutContext } from "../Layout/ctx";
import { useMediaQuery } from "@mantine/hooks";
import { useModals } from "../../modals";

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
    const [layout, setLayout] = useState<"list" | "grid">("list");
    const isDesktop = useMediaQuery("(min-width: 48em)", true);
    const realLayout: typeof layout = useMemo(
        () => (isDesktop ? layout : "list"),
        [layout, isDesktop]
    );
    const { addItem } = useModals();

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

    useEffect(() => {
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

    return list && api ? (
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
                                    .toggleFavorite({ type: method, reference })
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
                                        <IconLayoutGrid
                                            style={{ marginTop: "5px" }}
                                            size={20}
                                        />
                                    ),
                                },
                            ]}
                        />
                    )}
                    {method === "id" && (
                        <ActionIcon size="xl" variant="subtle">
                            <IconSettings />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
            <Divider />
            <ActionIcon
                size="xl"
                radius="xl"
                className="add-item-button"
                onClick={() => addItem({ type: method, reference }, list)}
            >
                <IconPlus size={32} />
            </ActionIcon>
            <ScrollArea className="items-area" type="auto"></ScrollArea>
        </Stack>
    ) : (
        <Box className="loader-wrapper">
            <Loader className="loading-list" size="xl" />
        </Box>
    );
}
