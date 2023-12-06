import { useForm } from "@mantine/form";
import { AccessReference } from "../../types/extra";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import { useApiMethods } from "../../api";
import { useTranslation } from "react-i18next";
import {
    ActionIcon,
    Button,
    Center,
    Collapse,
    Divider,
    Fieldset,
    Group,
    Image,
    Loader,
    NumberInput,
    Paper,
    Pill,
    Rating,
    Select,
    SimpleGrid,
    Stack,
    TagsInput,
    Text,
    TextInput,
    rem,
} from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    IconCategoryFilled,
    IconCheck,
    IconCurrencyDollar,
    IconHash,
    IconInfoCircle,
    IconLink,
    IconMapPin,
    IconMeat,
    IconShoppingBag,
    IconStarHalfFilled,
    IconX,
} from "@tabler/icons-react";
import { GroceryItem } from "../../types/grocery";
import "./modal.scss";
import { capitalize } from "lodash";
import { useDisclosure } from "@mantine/hooks";
import { useNotifications } from "../../util/notifications";
import { modals } from "@mantine/modals";

export function GroceryItemResultCard({
    item,
    selected,
    onSelected,
}: {
    item: GroceryItem;
    selected: string | number | null;
    onSelected: (item: GroceryItem | null) => void;
}) {
    const [opened, { toggle }] = useDisclosure(false);
    return (
        <Paper
            p="sm"
            radius="sm"
            className={
                "item-result" + (selected === item.id ? " selected" : "")
            }
            shadow="sm"
            onClick={() =>
                selected === item.id ? onSelected(null) : onSelected(item)
            }
        >
            <Stack gap="sm">
                <Group gap="sm" align="center">
                    {item.images[0] ? (
                        <Image src={item.images[0]} radius="sm" h={48} w={48} />
                    ) : (
                        <IconShoppingBag size={32} />
                    )}
                    <Stack
                        gap={2}
                        justify="space-between"
                        className="item-details-basic"
                    >
                        <Text>
                            {item.name.split(" ").map(capitalize).join(" ")}
                        </Text>
                        <Text c="dimmed">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(item.price)}{" "}
                            - {capitalize(item.type)}
                        </Text>
                    </Stack>
                    <ActionIcon
                        size="xl"
                        variant="subtle"
                        onClick={(event) => {
                            event.stopPropagation();
                            toggle();
                        }}
                    >
                        <IconInfoCircle size={24} />
                    </ActionIcon>
                </Group>
                <Collapse in={opened}>
                    <Stack gap="xs">
                        <Group gap="xs" align="center" wrap="nowrap">
                            <IconCategoryFilled size={20} />
                            <Pill.Group>
                                {item.categories.map((c, i) => (
                                    <Pill key={i}>
                                        {c.split(" ").map(capitalize).join(" ")}
                                    </Pill>
                                ))}
                            </Pill.Group>
                        </Group>
                        {item.location && (
                            <Group gap="xs" align="center" wrap="nowrap">
                                <IconMapPin size={20} />
                                {item.location
                                    .split(" ")
                                    .map(capitalize)
                                    .join(" ")}
                            </Group>
                        )}
                        {item.ratings && item.ratings.count > 0 && (
                            <Group gap="xs" align="center" wrap="nowrap">
                                <IconStarHalfFilled size={20} />
                                <Rating
                                    value={item.ratings.average}
                                    fractions={2}
                                    readOnly
                                />
                                ({item.ratings.count})
                            </Group>
                        )}
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
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
        Omit<
            ListItem,
            "id" | "list_id" | "alternative" | "checked" | "recipe" | "added_by"
        >
    >({
        initialValues: {
            name: "",
            quantity: { amount: 1, unit: null },
            categories: [],
            price: 0,
            location: null,
            linked_item: null,
        },
        validate: {
            name: (values) =>
                values.length > 0
                    ? null
                    : t("modals.addItem.fields.name.error"),
        },
    });
    const api = useApiMethods();
    const { t } = useTranslation();
    const [results, setResults] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const nameRef = useRef<HTMLInputElement | null>();
    const { success, error } = useNotifications();

    useEffect(() => {
        function changeListener(event: Event) {
            event.stopPropagation();
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
    }, [api, nameRef.current, setLoading, setResults]);

    const handleLinkedSelect = useCallback(
        (item: GroceryItem | null) => {
            form.setFieldValue("linked_item", item);
            if (item) {
                form.setValues({
                    categories: item.categories,
                    location: item.location,
                    price: item.price,
                    name: item.name.split(" ").map(capitalize).join(" "),
                });
            }
        },
        [form]
    );

    const renderedResults = useMemo(() => {
        return results
            .filter((v) => v.id !== form.values.linked_item?.id)
            .map((v) => (
                <GroceryItemResultCard
                    item={v}
                    key={v.id}
                    selected={form.values.linked_item?.id ?? null}
                    onSelected={handleLinkedSelect}
                />
            ));
    }, [results, form.values.linked_item?.id]);

    return (
        <form>
            <Stack gap="sm">
                <TextInput
                    withAsterisk
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
                                    selected={
                                        form.values.linked_item?.id ?? null
                                    }
                                    onSelected={handleLinkedSelect}
                                />
                                <Divider />
                            </>
                        )}
                        {loading ? (
                            <Center pt="xl" pb="xl">
                                <Loader />
                            </Center>
                        ) : results.length > 0 ? (
                            renderedResults
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
                <SimpleGrid
                    cols={{ base: 1, md: 3 }}
                    spacing="sm"
                    verticalSpacing="sm"
                >
                    <NumberInput
                        hideControls
                        leftSection={<IconHash size={16} />}
                        rightSection={
                            <Select
                                data={[
                                    "kg",
                                    "lb",
                                    "liters",
                                    "gallons",
                                    "quarts",
                                ]}
                                clearable
                                {...form.getInputProps("quantity.unit")}
                                style={{
                                    input: {
                                        fontWeight: 500,
                                        borderTopLeftRadius: "0 !important",
                                        borderBottomLeftRadius: "0 !important",
                                        width: rem(92),
                                        marginRight: rem(-2),
                                    },
                                }}
                                rightSectionWidth={28}
                                placeholder={t(
                                    "modals.addItem.fields.quantity.unitPlaceholder"
                                )}
                                className="quantity-input-unit-select"
                            />
                        }
                        label={t("modals.addItem.fields.quantity.label")}
                        rightSectionWidth={92}
                        {...form.getInputProps("quantity.amount")}
                    />

                    <TextInput
                        label={t("modals.addItem.fields.location.label")}
                        leftSection={<IconMapPin size={16} />}
                        value={form.values.location ?? ""}
                        onChange={(event) =>
                            form.setFieldValue(
                                "location",
                                event.target.value.length > 0
                                    ? event.target.value
                                    : null
                            )
                        }
                    />
                    <NumberInput
                        leftSection={<IconCurrencyDollar size={16} />}
                        label={t("modals.addItem.fields.price.label")}
                        min={0}
                        decimalScale={2}
                        {...form.getInputProps("price")}
                    />
                </SimpleGrid>
                <TagsInput
                    label={t("modals.addItem.fields.categories.label")}
                    leftSection={<IconCategoryFilled size={16} />}
                    {...form.getInputProps("categories")}
                />
                <Group justify="right">
                    <Button
                        leftSection={<IconCheck />}
                        onClick={() => {
                            const valid = form.validate();
                            if (!valid.hasErrors) {
                                api &&
                                    api.list
                                        .addItem(
                                            access.type,
                                            access.reference,
                                            form.values
                                        )
                                        .then((result) => {
                                            if (result) {
                                                success(
                                                    t(
                                                        "modals.addItem.feedback.success"
                                                    )
                                                );
                                                modals.closeAll();
                                            } else {
                                                error(
                                                    t(
                                                        "modals.addItem.feedback.error"
                                                    )
                                                );
                                            }
                                        });
                            }
                        }}
                    >
                        {t("modals.addItem.submit")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
