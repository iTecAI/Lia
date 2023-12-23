import {
    ActionIcon,
    Badge,
    Button,
    Divider,
    Group,
    Modal,
    MultiSelect,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useApiMethods, useApiSettings } from "../../api";
import { AccessReference } from "../../types/extra";
import { GroceryList, RecipeList } from "../../types/list";
import {
    IconBuildingStore,
    IconCopy,
    IconDeviceFloppy,
    IconLink,
    IconLinkPlus,
    IconList,
    IconSettings,
    IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useInputState, useMediaQuery } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { capitalize } from "lodash";
import { useLayoutContext } from "../Layout/ctx";
import { ListInvite } from "../../types/invites";

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
    const layoutContext = useLayoutContext();
    const [invites, setInvites] = useState<ListInvite[]>([]);
    const isDesktop = useMediaQuery("(min-width: 48em)", true);

    useEffect(() => {
        setListName(list.name);
        setListStores(list.included_stores);
    }, [list.name, list.included_stores]);

    const updateInviteList = useCallback(
        () =>
            api &&
            api.list
                .listInvites(access.reference)
                .then((result) =>
                    result ? setInvites(result) : setInvites([])
                ),
        [api, access.reference]
    );

    useEffect(() => {
        updateInviteList();
    }, []);

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
                    <Button
                        leftSection={<IconDeviceFloppy />}
                        disabled={listName.length < 1}
                        variant="subtle"
                        onClick={() => {
                            if (api) {
                                api.list
                                    .updateSettings(
                                        access.reference,
                                        listName,
                                        listStores
                                    )
                                    .then(() => {
                                        setOpen(false);
                                        layoutContext.refreshLists();
                                    });
                            }
                        }}
                    >
                        {t("modals.listSettings.actions.save")}
                    </Button>
                </Group>
                <Divider label={t("modals.listSettings.invites.title")} />
                <SimpleGrid
                    cols={{ base: 1, md: 2 }}
                    className="invite-list"
                    spacing="sm"
                    verticalSpacing="sm"
                >
                    {invites.map((i) => (
                        <Paper
                            className="invite-item"
                            withBorder
                            p="sm"
                            radius="sm"
                            key={i.id}
                        >
                            <Group
                                gap="sm"
                                justify="space-between"
                                wrap="nowrap"
                            >
                                <Group gap="sm">
                                    <IconLink />
                                    <Badge
                                        style={{ textTransform: "initial" }}
                                        size={isDesktop ? "lg" : "md"}
                                        color="dark"
                                    >
                                        {i.uri}
                                    </Badge>
                                </Group>
                                <Group gap="sm">
                                    <ActionIcon
                                        size="lg"
                                        disabled={!window.navigator.clipboard}
                                        variant="subtle"
                                        onClick={() =>
                                            window.navigator.clipboard.writeText(
                                                location.origin +
                                                    "/join/" +
                                                    i.uri
                                            )
                                        }
                                    >
                                        <IconCopy />
                                    </ActionIcon>
                                    <ActionIcon
                                        size="lg"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => {
                                            if (api) {
                                                api.invites
                                                    .deleteListInvite(i.uri)
                                                    .then(updateInviteList);
                                            }
                                        }}
                                    >
                                        <IconTrash />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>
                <Button
                    justify="space-between"
                    size="md"
                    leftSection={<IconLinkPlus />}
                    variant="subtle"
                    onClick={() =>
                        api &&
                        api.invites
                            .createListInvite(access.reference)
                            .then(() => updateInviteList())
                    }
                >
                    {t("modals.listSettings.invites.addInvite")}
                </Button>
            </Stack>
        </Modal>
    );
}
