import { useForm } from "@mantine/form";
import { AccessReference } from "../../types/extra";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import { useApiMethods } from "../../api";
import { useTranslation } from "react-i18next";
import {
    Center,
    Divider,
    Fieldset,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { IconLink, IconMeat, IconX } from "@tabler/icons-react";
import { GroceryItem } from "../../types/grocery";
import "./modal.scss";

function GroceryItemResultCard({
    item,
    selected,
    onSelected,
}: {
    item: GroceryItem;
    selected: any;
    onSelected: (item: GroceryItem) => void;
}) {
    return (
        <Paper
            p="sm"
            radius="sm"
            className={"item-result" + (selected ? " selected" : "")}
            shadow="sm"
        ></Paper>
    );
}

export function AddItemModal({
    access,
    list,
}: {
    access: AccessReference;
    list: GroceryList | RecipeList;
}) {
    const form = useForm<
        Omit<ListItem, "id" | "list_id" | "alternative" | "checked" | "recipe">
    >({
        initialValues: {
            name: "",
            quantity: { amount: 1, unit: null },
            categories: [],
            price: 0,
            location: null,
            linked_item: null,
        },
    });
    const api = useApiMethods();
    const { t } = useTranslation();
    const [results, setResults] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const nameRef = useRef<HTMLInputElement | null>();

    useEffect(() => {
        function changeListener(event: Event) {
            if (api && (event.target as any).value.length > 0) {
                setLoading(true);
                api.groceries
                    .search(list.included_stores, (event.target as any).value)
                    .then((val) => {
                        setResults(val);
                        setLoading(false);
                    });
            } else {
                setResults([]);
            }
        }
        nameRef.current &&
            nameRef.current.addEventListener("change", changeListener);
        return () => {
            nameRef.current &&
                nameRef.current.removeEventListener("change", changeListener);
        };
    });

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Stack gap="sm">
                <TextInput
                    ref={nameRef as any}
                    label={t("modals.addItem.fields.name.label")}
                    leftSection={<IconMeat size={16} />}
                    {...form.getInputProps("name")}
                />
                <Fieldset
                    legend={
                        <Group gap="xs">
                            <IconLink size={16} />
                            <span>
                                {t("modals.addItem.fields.linked.label")}
                            </span>
                        </Group>
                    }
                    className="result-list"
                >
                    <Stack gap="sm">
                        {form.values.linked_item && (
                            <>
                                <GroceryItemResultCard
                                    item={form.values.linked_item}
                                    key={form.values.linked_item.id}
                                    selected={0}
                                    onSelected={() => {}}
                                />
                                <Divider />
                            </>
                        )}
                        {loading ? (
                            <Center pt="xl" pb="xl">
                                <Loader />
                            </Center>
                        ) : results.length > 0 ? (
                            results
                                .filter(
                                    (v) => v.id !== form.values.linked_item?.id
                                )
                                .map((v) => (
                                    <GroceryItemResultCard
                                        item={v}
                                        key={v.id}
                                        selected={0}
                                        onSelected={() => {}}
                                    />
                                ))
                        ) : (
                            <Center pt="xl" pb="xl">
                                <Group gap="sm" opacity={0.6} unselectable="on">
                                    <IconX size={32} />
                                    <Text size="lg">
                                        {t(
                                            "modals.addItem.fields.linked.noResults"
                                        )}
                                    </Text>
                                </Group>
                            </Center>
                        )}
                    </Stack>
                </Fieldset>
            </Stack>
        </form>
    );
}
