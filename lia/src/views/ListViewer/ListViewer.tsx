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
} from "@tabler/icons-react";
import { useLayoutContext } from "../Layout/ctx";
import { useMediaQuery } from "@mantine/hooks";

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
        <Stack gap="sm">
            <Group gap="sm" justify="space-between">
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
                                        />
                                    ),
                                },
                                {
                                    value: "grid",
                                    label: (
                                        <IconLayoutGrid
                                            style={{ marginTop: "5px" }}
                                        />
                                    ),
                                },
                            ]}
                        />
                    )}
                    <ActionIcon size="lg" variant="subtle">
                        <IconSettings />
                    </ActionIcon>
                </Group>
            </Group>
            <Divider />
        </Stack>
    ) : (
        <Box className="loader-wrapper">
            <Loader className="loading-list" size="xl" />
        </Box>
    );
}
