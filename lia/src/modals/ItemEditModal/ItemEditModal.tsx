import { useForm } from "@mantine/form";
import { AccessReference } from "../../types/extra";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import {
    ActionIcon,
    Button,
    Center,
    Divider,
    Fieldset,
    Group,
    Image,
    Loader,
    Modal,
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
import {
    IconBuildingStore,
    IconCategoryFilled,
    IconCurrencyDollar,
    IconEdit,
    IconHash,
    IconInfoCircle,
    IconLink,
    IconLinkOff,
    IconLinkPlus,
    IconMapPin,
    IconMeat,
    IconSearch,
    IconShoppingBag,
    IconStarHalfFilled,
    IconTrashFilled,
    IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import "./modal.scss";
import { capitalize } from "lodash";
import { useDebouncedState, useDidUpdate, useMediaQuery } from "@mantine/hooks";
import { useApiMethods } from "../../api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GroceryItem } from "../../types/grocery";
import { GroceryItemResultCard } from "../AddItemModal/AddItemModal";

function SwitchLinkedItemModal({
    open,
    submit,
    list,
}: {
    open: boolean;
    submit: (selection: null | GroceryItem) => void;
    list: GroceryList | RecipeList;
}) {
    const [results, setResults] = useState<GroceryItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const api = useApiMethods();

    useEffect(() => {
        if (open) {
            setResults([]);
            setSearch("");
        }
    }, [open]);

    const renderedResults = useMemo(() => {
        return results.map((v) => (
            <GroceryItemResultCard
                item={v}
                key={v.id}
                selected={null}
                onSelected={(selection) => {
                    submit(selection);
                }}
            />
        ));
    }, [results]);

    const searchGroceries = useCallback(() => {
        if (api && search.length > 0) {
            setLoading(true);
            api.groceries
                .search(list.included_stores, search)
                .then((result) => {
                    setResults(result);
                    setLoading(false);
                });
        } else {
            setResults([]);
        }
    }, [api, search, list.included_stores]);

    return (
        <Modal
            opened={open}
            onClose={() => submit(null)}
            title={
                <Group gap="sm" justify="space-between" style={{ flexGrow: 2 }}>
                    <IconEdit />
                    <Text>{t("modals.editItem.switchLink.title")}</Text>
                </Group>
            }
            size="xl"
        >
            <Stack gap="sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchGroceries();
                    }}
                >
                    <Group gap="sm" align="end">
                        <TextInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            leftSection={<IconSearch size={16} />}
                            placeholder={t(
                                "modals.editItem.switchLink.search.placeholder"
                            )}
                            style={{ flexGrow: 1 }}
                        />
                        <ActionIcon size="lg" onClick={searchGroceries}>
                            <IconSearch size={16} />
                        </ActionIcon>
                    </Group>
                </form>
                <Fieldset
                    legend={
                        <Group gap="xs">
                            <IconLink size={16} />
                            <span>{t("modals.editItem.switchLink.label")}</span>
                        </Group>
                    }
                    className="result-list"
                >
                    <Stack gap="sm">
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
                                            "modals.editItem.switchLink.noResults"
                                        )}
                                    </Text>
                                </Group>
                            </Center>
                        )}
                    </Stack>
                </Fieldset>
            </Stack>
        </Modal>
    );
}

export function ItemEditModal({
    item,
    access,
    list,
    open,
    setOpen,
    denyQuantityUpdate,
}: {
    item: ListItem;
    access: AccessReference;
    list: GroceryList | RecipeList;
    open: boolean;
    setOpen: (open: boolean) => void;
    denyQuantityUpdate: () => void;
}) {
    const { t } = useTranslation();
    const isDesktop = useMediaQuery("(min-width: 48em)", true);
    const form = useForm<
        Omit<
            ListItem,
            | "id"
            | "list_id"
            | "alternative"
            | "checked"
            | "recipe"
            | "added_by"
            | "linked_item"
        >
    >({
        initialValues: {
            name: item.name,
            quantity: item.quantity,
            categories: item.categories,
            price: item.price,
            location: item.location,
        },
        validate: {
            name: (values) =>
                values.length > 0
                    ? null
                    : t("modals.editItem.fields.name.error"),
        },
    });

    const api = useApiMethods();
    const [debouncedVals, setDebouncedVals] = useDebouncedState<
        Omit<
            ListItem,
            | "id"
            | "list_id"
            | "alternative"
            | "checked"
            | "recipe"
            | "added_by"
            | "linked_item"
        >
    >(
        {
            name: item.name,
            quantity: item.quantity,
            categories: item.categories,
            price: item.price,
            location: item.location,
        },
        250
    );

    useDidUpdate(() => {
        setDebouncedVals(form.values);
    }, [
        form.values.categories,
        form.values.location,
        form.values.name,
        form.values.price,
        form.values.quantity.amount,
        form.values.quantity.unit,
    ]);

    useDidUpdate(() => {
        denyQuantityUpdate();
        api?.list.updateItem(
            access.type,
            access.reference,
            item.id,
            debouncedVals
        );
    }, [
        debouncedVals.categories,
        debouncedVals.location,
        debouncedVals.name,
        debouncedVals.price,
        debouncedVals.quantity.amount,
        debouncedVals.quantity.unit,
    ]);

    const removeLinkedItem = useCallback(() => {
        if (api) {
            api.list.updateItem(access.type, access.reference, item.id, {
                linked_item: null,
            });
        }
    }, [item, api]);

    useDidUpdate(() => {
        if (!open) {
            form.setValues({
                name: item.name,
                quantity: item.quantity,
                categories: item.categories,
                price: item.price,
                location: item.location,
            });
        }
    }, [item.name, item.quantity, item.categories, item.price, item.location]);

    const [switching, setSwitching] = useState(false);

    return (
        <Modal
            title={
                <Group gap="sm" justify="space-between" style={{ flexGrow: 2 }}>
                    <IconInfoCircle />
                    <Text>{t("modals.editItem.title")}</Text>
                </Group>
            }
            opened={open}
            onClose={() => setOpen(false)}
            size="xl"
        >
            <Stack gap="sm">
                <TextInput
                    leftSection={<IconMeat size={16} />}
                    label={t("modals.editItem.fields.name.label")}
                    {...form.getInputProps("name")}
                />
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
                                    "modals.editItem.fields.quantity.unitPlaceholder"
                                )}
                                className="quantity-input-unit-select"
                            />
                        }
                        label={t("modals.editItem.fields.quantity.label")}
                        rightSectionWidth={92}
                        {...form.getInputProps("quantity.amount")}
                    />

                    <TextInput
                        label={t("modals.editItem.fields.location.label")}
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
                        label={t("modals.editItem.fields.price.label")}
                        min={0}
                        decimalScale={2}
                        {...form.getInputProps("price")}
                    />
                </SimpleGrid>
                <TagsInput
                    label={t("modals.editItem.fields.categories.label")}
                    leftSection={<IconCategoryFilled size={16} />}
                    {...form.getInputProps("categories")}
                />
                <Paper
                    p="sm"
                    radius="sm"
                    shadow="sm"
                    className="linked-item-card"
                >
                    {item.linked_item ? (
                        <Group
                            className="linked-item-display"
                            gap="sm"
                            align="start"
                            wrap="nowrap"
                        >
                            {item.linked_item.images[0] ? (
                                <Image
                                    src={item.linked_item.images[0]}
                                    className="item-img"
                                />
                            ) : (
                                <IconShoppingBag className="item-img" />
                            )}
                            {!isDesktop && (
                                <Stack
                                    gap="sm"
                                    style={{
                                        marginLeft: "auto",
                                        marginRight: "0px",
                                    }}
                                >
                                    <ActionIcon
                                        size="lg"
                                        variant="subtle"
                                        onClick={() => removeLinkedItem()}
                                    >
                                        <IconLinkOff />
                                    </ActionIcon>
                                    <ActionIcon
                                        size="lg"
                                        variant="subtle"
                                        onClick={() => setSwitching(true)}
                                    >
                                        <IconEdit />
                                    </ActionIcon>
                                </Stack>
                            )}
                            <Stack
                                gap="sm"
                                align="start"
                                className="item-details"
                            >
                                <Group gap="sm" wrap="nowrap">
                                    <IconShoppingBag size={24} />
                                    <Text>
                                        {item.linked_item.name
                                            .split(" ")
                                            .map(capitalize)
                                            .join(" ")}
                                    </Text>
                                </Group>
                                <Group gap="sm" wrap="nowrap">
                                    <IconBuildingStore size={24} />
                                    <Text>
                                        {item.linked_item.type
                                            .split(" ")
                                            .map(capitalize)
                                            .join(" ")}
                                    </Text>
                                </Group>
                                {item.linked_item.location && (
                                    <Group gap="sm" wrap="nowrap">
                                        <IconMapPin size={24} />
                                        <Text>
                                            {item.linked_item.location
                                                .split(" ")
                                                .map(capitalize)
                                                .join(" ")}
                                        </Text>
                                    </Group>
                                )}
                                <Group gap="sm" wrap="nowrap">
                                    <IconCurrencyDollar size={24} />
                                    <Text>
                                        {item.linked_item.price
                                            ? new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                              })
                                                  .format(
                                                      item.linked_item.price
                                                  )
                                                  .slice(1)
                                            : "0.00"}
                                    </Text>
                                </Group>
                                <Group gap="sm" wrap="nowrap">
                                    <IconCategoryFilled size={24} />
                                    <Pill.Group>
                                        <Group gap={4}>
                                            {item.linked_item.categories.map(
                                                (v, i) => (
                                                    <Pill key={i}>{v}</Pill>
                                                )
                                            )}
                                        </Group>
                                    </Pill.Group>
                                </Group>
                                <Group gap="sm" wrap="nowrap">
                                    <IconStarHalfFilled size={24} />
                                    <Rating
                                        value={item.linked_item.ratings.average}
                                        fractions={2}
                                        readOnly
                                    />
                                    ({item.linked_item.ratings.count})
                                </Group>
                            </Stack>
                            {isDesktop && (
                                <Stack gap="sm">
                                    <ActionIcon
                                        size="lg"
                                        variant="subtle"
                                        onClick={() => removeLinkedItem()}
                                    >
                                        <IconLinkOff />
                                    </ActionIcon>
                                    <ActionIcon
                                        size="lg"
                                        variant="subtle"
                                        onClick={() => setSwitching(true)}
                                    >
                                        <IconEdit />
                                    </ActionIcon>
                                </Stack>
                            )}
                        </Group>
                    ) : (
                        <Center p="lg">
                            <Group gap="sm">
                                <Button
                                    size="lg"
                                    leftSection={<IconLinkPlus size={24} />}
                                    onClick={() => setSwitching(true)}
                                >
                                    {t("modals.editItem.actions.addLinked")}
                                </Button>
                            </Group>
                        </Center>
                    )}
                </Paper>
                <Group justify="right" gap="sm">
                    <Button
                        leftSection={<IconTrashFilled size={20} />}
                        color="red"
                        onClick={() => {
                            if (api) {
                                api.list.deleteItem(
                                    access.type,
                                    access.reference,
                                    item.id
                                );
                                setOpen(false);
                            }
                        }}
                    >
                        {t("modals.editItem.actions.removeItem")}
                    </Button>
                </Group>
            </Stack>
            <SwitchLinkedItemModal
                open={switching}
                submit={(selection) => {
                    if (selection && api) {
                        api.list.updateItem(
                            access.type,
                            access.reference,
                            item.id,
                            { linked_item: selection }
                        );
                    }

                    setSwitching(false);
                }}
                list={list}
            />
        </Modal>
    );
}
