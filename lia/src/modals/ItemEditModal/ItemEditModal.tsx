import { useForm } from "@mantine/form";
import { AccessReference } from "../../types/extra";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import {
    ActionIcon,
    Button,
    Center,
    Group,
    Image,
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
    IconLinkOff,
    IconLinkPlus,
    IconMapPin,
    IconMeat,
    IconShoppingBag,
    IconStarHalfFilled,
    IconTrashFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import "./modal.scss";
import { capitalize } from "lodash";
import { useDebouncedState, useDidUpdate, useMediaQuery } from "@mantine/hooks";
import { useApiMethods } from "../../api";
import { useCallback } from "react";
import { modals } from "@mantine/modals";

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
                                    <ActionIcon size="lg" variant="subtle">
                                        <IconEdit />
                                    </ActionIcon>
                                </Stack>
                            )}
                            <Stack
                                gap="sm"
                                align="start"
                                className="item-details"
                            >
                                <Group gap="sm">
                                    <IconShoppingBag size={24} />
                                    <Text>
                                        {item.linked_item.name
                                            .split(" ")
                                            .map(capitalize)
                                            .join(" ")}
                                    </Text>
                                </Group>
                                <Group gap="sm">
                                    <IconBuildingStore size={24} />
                                    <Text>
                                        {item.linked_item.type
                                            .split(" ")
                                            .map(capitalize)
                                            .join(" ")}
                                    </Text>
                                </Group>
                                {item.linked_item.location && (
                                    <Group gap="sm">
                                        <IconMapPin size={24} />
                                        <Text>
                                            {item.linked_item.location
                                                .split(" ")
                                                .map(capitalize)
                                                .join(" ")}
                                        </Text>
                                    </Group>
                                )}
                                <Group gap="sm">
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
                                    <ActionIcon size="lg" variant="subtle">
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
        </Modal>
    );
}
