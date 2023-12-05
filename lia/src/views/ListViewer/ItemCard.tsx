import {
    ActionIcon,
    Checkbox,
    Group,
    Image,
    NumberInput,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { AccessReference } from "../../types/extra";
import { GroceryList, ListItem, RecipeList } from "../../types/list";
import { useEffect, useState } from "react";
import {
    IconCurrencyDollar,
    IconMapPin,
    IconMinus,
    IconPlus,
    IconShoppingBag,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isString } from "lodash";
import { useApiMethods } from "../../api";
import { ItemEditModal } from "../../modals/ItemEditModal/ItemEditModal";

export function ListItemCard({
    list,
    item,
    access,
}: {
    list: GroceryList | RecipeList;
    item: ListItem;
    access: AccessReference;
}) {
    const { t } = useTranslation();
    const [checked, setChecked] = useState(item.checked);
    const [quantity, setQuantity] = useState(item.quantity.amount);
    const api = useApiMethods();
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
    const [denyQtUpdate, setDenyQtUpdate] = useState(false);

    useEffect(() => {
        if (quantity !== item.quantity.amount && api) {
            if (denyQtUpdate) {
                setDenyQtUpdate(false);
                return;
            }
            api.list.updateItem(access.type, access.reference, item.id, {
                quantity: { amount: quantity },
            });
        }
    }, [quantity, item.quantity.amount]);

    return (
        <>
            <Paper
                className="item-list-card"
                p="sm"
                radius="sm"
                shadow="sm"
                onClick={() => setDetailsOpen(true)}
            >
                <Stack gap="sm">
                    <Group justify="space-between" gap="sm">
                        <Group align="center" gap="sm" wrap="nowrap">
                            {item.linked_item && item.linked_item.images[0] ? (
                                <Image
                                    w={48}
                                    h={48}
                                    src={item.linked_item.images[0]}
                                    radius={"sm"}
                                />
                            ) : (
                                <IconShoppingBag size={48} />
                            )}
                            <Stack gap={2}>
                                <Text fw="600">{item.name}</Text>
                                <Group gap={2}>
                                    <IconCurrencyDollar size={16} />
                                    <Text>
                                        {item.price
                                            ? new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                              })
                                                  .format(item.price)
                                                  .slice(1)
                                            : "0.00"}
                                    </Text>
                                </Group>
                            </Stack>
                        </Group>
                        <Checkbox
                            color="green"
                            size="lg"
                            checked={checked}
                            onChange={(event) => {
                                if (api) {
                                    api.list.setItemCheck(
                                        access.type,
                                        access.reference,
                                        item.id,
                                        event.target.checked
                                    );
                                    setChecked(event.target.checked);
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Group>
                    <Group gap="sm" justify="space-between" wrap="nowrap">
                        {item.location ? (
                            <Group gap={2}>
                                <IconMapPin size={16} />
                                <Text>{item.location}</Text>
                            </Group>
                        ) : (
                            <Group gap={2}>
                                <IconMapPin size={16} />
                                <Text>{t("views.viewer.item.noLocation")}</Text>
                            </Group>
                        )}
                        <NumberInput
                            w={110}
                            hideControls
                            onClick={(e) => e.stopPropagation()}
                            leftSection={
                                <ActionIcon
                                    variant="default"
                                    className="qt-control decrease"
                                    onClick={(e) => {
                                        setQuantity((c) => Math.max(0, c - 1));
                                        e.stopPropagation();
                                    }}
                                >
                                    <IconMinus size={16} />
                                </ActionIcon>
                            }
                            rightSection={
                                <ActionIcon
                                    variant="default"
                                    className="qt-control increase"
                                    onClick={(e) => {
                                        setQuantity((c) => c + 1);
                                        e.stopPropagation();
                                    }}
                                >
                                    <IconPlus size={16} />
                                </ActionIcon>
                            }
                            suffix={
                                item.quantity.unit
                                    ? " " + item.quantity.unit
                                    : undefined
                            }
                            value={quantity}
                            onChange={(value) =>
                                setQuantity(isString(value) ? 0 : value)
                            }
                            allowDecimal={false}
                            className="item-quantity"
                        />
                    </Group>
                </Stack>
            </Paper>
            <ItemEditModal
                item={item}
                access={access}
                list={list}
                open={detailsOpen}
                setOpen={setDetailsOpen}
                denyQuantityUpdate={() => setDenyQtUpdate(true)}
            />
        </>
    );
}
