import { Group, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { AddListModal, OnCompleteType } from "./AddListModal";
import { memo } from "react";

export function useModals() {
    const { t } = useTranslation();

    const ModalHeader = memo(
        ({ icon, title }: { icon: JSX.Element; title: string }) => {
            return (
                <Group gap="sm" justify="space-between" style={{ flexGrow: 2 }}>
                    {icon}
                    <Text>{title}</Text>
                </Group>
            );
        }
    );

    return {
        addList: (onComplete: OnCompleteType, mode: "lists" | "recipes") => {
            modals.open({
                id: "addList",
                title: (
                    <ModalHeader
                        icon={<IconPlus />}
                        title={t(`modals.addList.title.${mode}`)}
                    />
                ),
                children: <AddListModal onComplete={onComplete} mode={mode} />,
            });
        },
    };
}
