import {
    Button,
    Group,
    Modal,
    MultiSelect,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useApiMethods, useApiSettings } from "../../api";
import { AccessReference } from "../../types/extra";
import { GroceryList, RecipeList } from "../../types/list";
import {
    IconBuildingStore,
    IconDeviceFloppy,
    IconList,
    IconSettings,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useInputState } from "@mantine/hooks";
import { useEffect } from "react";
import { capitalize } from "lodash";

export function ListSettingsModal({
    list,
    access,
    open,
    setOpen,
}: {
    list: GroceryList | RecipeList;
    access: AccessReference;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const api = useApiMethods();
    const { t } = useTranslation();
    const [listName, setListName] = useInputState("");
    const [listStores, setListStores] = useInputState<string[]>([]);
    const apiSettings = useApiSettings();

    useEffect(() => {
        setListName(list.name);
        setListStores(list.included_stores);
    }, [list.name, list.included_stores]);

    return (
        <Modal
            size="xl"
            opened={open}
            onClose={() => setOpen(false)}
            title={
                <Group gap="sm" justify="space-between" style={{ flexGrow: 2 }}>
                    <IconSettings />
                    <Text>{t("modals.listSettings.title")}</Text>
                </Group>
            }
        >
            <Stack gap="sm">
                <TextInput
                    leftSection={<IconList size={16} />}
                    label={t("modals.listSettings.fields.name.label")}
                    value={listName}
                    onChange={setListName}
                />
                <MultiSelect
                    leftSection={<IconBuildingStore size={16} />}
                    label={t("modals.listSettings.fields.stores.label")}
                    value={listStores.map(capitalize)}
                    onChange={setListStores}
                    data={
                        apiSettings
                            ? apiSettings.store_support.map((v) => ({
                                  label: capitalize(v),
                                  value: v,
                              }))
                            : []
                    }
                />
                <Group justify="right">
                    <Button leftSection={<IconDeviceFloppy />}>
                        {t("modals.listSettings.actions.save")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
