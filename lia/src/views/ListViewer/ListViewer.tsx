import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiMethods } from "../../api";
import { GroceryList } from "../../types/list";
import { Box, Loader } from "@mantine/core";
import "./viewer.scss";

export function ListViewer() {
    const { method, reference } = useParams() as {
        method: "id" | "alias";
        reference: string;
    };
    const nav = useNavigate();
    const api = useApiMethods();
    const [list, setList] = useState<GroceryList | null>(null);

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

    return list ? (
        <></>
    ) : (
        <Box className="loader-wrapper">
            <Loader className="loading-list" size="xl" />
        </Box>
    );
}
