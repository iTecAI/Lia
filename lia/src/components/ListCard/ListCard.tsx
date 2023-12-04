import { useNavigate, useParams } from "react-router-dom";
import { ListAccessSpec } from "../../types/list";
import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import "./listCard.scss";
import { useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useApiMethods } from "../../api";

export function ListCard({ list, refresh }: { list: ListAccessSpec; refresh: () => void }) {
    const nav = useNavigate();
    const [favorite, setFavorite] = useState<boolean>(list.favorited);
    const api = useApiMethods();
    const { method, reference } = useParams();

    return (
        <Paper
            p="sm"
            radius="sm"
            className={
                "list-card" +
                (method === list.access_type &&
                reference === list.access_reference
                    ? " current"
                    : "")
            }
            onClick={() =>
                nav(`/list/${list.access_type}/${list.access_reference}`)
            }
        >
            <Group gap="xs" align="center">
                <ActionIcon
                    radius="xs"
                    onClick={(event) => {
                        event.stopPropagation();
                        setFavorite(!favorite);
                        api && api.user.toggleFavorite(list).then(refresh);
                    }}
                    variant="transparent"
                    color={favorite ? "yellow" : "white"}
                >
                    {favorite ? <IconStarFilled /> : <IconStar />}
                </ActionIcon>
                <Text>{list.data.name}</Text>
            </Group>
        </Paper>
    );
}
