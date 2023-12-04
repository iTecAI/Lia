import {
    ActionIcon,
    Button,
    Divider,
    Group,
    MultiSelect,
    Stack,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import {
    IconBuildingStore,
    IconCheck,
    IconLink,
    IconPencil,
} from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApiSettings } from "../api";
import { upperFirst } from "lodash";
import { modals } from "@mantine/modals";

export type OnCompleteType = (
    action: AddListAction,
    mode: "lists" | "recipes"
) => void;

export type AddListAction =
    | { type: "add"; invite: string }
    | { type: "create"; name: string; stores: string[] };

export function AddListModal({
    onComplete,
    mode,
}: {
    onComplete: OnCompleteType;
    mode: "lists" | "recipes";
}) {
    const { t } = useTranslation();
    const [joinLink, setJoinLink] = useInputState("");
    const settings = useApiSettings();
    const validJoinLink = useMemo(() => {
        return (
            joinLink.length === 12 ||
            (joinLink.startsWith(window.location.origin + "/join/") &&
                joinLink.length ===
                    (window.location.origin + "/join/").length + 12) ||
            (joinLink.startsWith(window.location.host + "/join/") &&
                joinLink.length ===
                    (window.location.host + "/join/").length + 12)
        );
    }, [joinLink]);

    const form = useForm<{ name: string; stores: string[] }>({
        initialValues: {
            name: "",
            stores: [],
        },
        validate: {
            name: (value) =>
                value.length > 0
                    ? null
                    : t("modals.addList.section.create.errors.name"),
        },
    });

    useEffect(() => {
        if (settings) {
            form.setFieldValue("stores", settings.store_support);
        }
    }, [settings]);

    return (
        <Stack gap="md">
            <Group gap="sm" align="end">
                <TextInput
                    leftSection={<IconLink size={16} />}
                    placeholder={t(
                        "modals.addList.section.add.input.placeholder",
                        { origin: window.location.origin }
                    )}
                    label={t("modals.addList.section.add.input.label")}
                    value={joinLink}
                    onChange={setJoinLink}
                    style={{ flexGrow: 1 }}
                />
                <ActionIcon
                    size="lg"
                    color="green"
                    disabled={!validJoinLink}
                    onClick={() => {
                        onComplete({ type: "add", invite: joinLink }, mode);
                        modals.closeAll();
                    }}
                >
                    <IconCheck />
                </ActionIcon>
            </Group>
            <Divider label={t("modals.addList.or")} />
            <form
                onSubmit={form.onSubmit((values) => {
                    onComplete({ type: "create", ...values }, mode);
                    modals.closeAll();
                })}
            >
                <Stack gap="sm">
                    <TextInput
                        label={t("modals.addList.section.create.name")}
                        withAsterisk
                        leftSection={<IconPencil size={16} />}
                        {...form.getInputProps("name")}
                    />
                    <MultiSelect
                        label={t("modals.addList.section.create.stores")}
                        leftSection={<IconBuildingStore size={16} />}
                        data={
                            settings
                                ? settings.store_support.map((store) => ({
                                      value: store,
                                      label: upperFirst(store),
                                  }))
                                : []
                        }
                        {...form.getInputProps("stores")}
                    />
                    <Group justify="right">
                        <Button leftSection={<IconCheck />} type="submit">
                            {t("modals.addList.section.create.submit")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Stack>
    );
}
