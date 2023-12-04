import { useNavigate } from "react-router-dom";
import { ListAccessSpec } from "../../types/list";
import { useTranslation } from "react-i18next";
import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import "./listCard.scss";
import { useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

export function ListCard({ list }: { list: ListAccessSpec }) {
    const nav = useNavigate();
    const { t } = useTranslation();
    const [favorite, setFavorite] = useState<boolean>(list.favorited);

    return (
        <Paper p="sm" radius="sm" className="list-card">
            <Group gap="xs" align="center">
                <ActionIcon
                    radius="xs"
                    onClick={(event) => {
                        event.stopPropagation();
                        setFavorite(!favorite);
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
