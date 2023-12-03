import { Group, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { AddListModal } from "./AddListModal";
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
        addList: () => {
            modals.open({
                title: (
                    <ModalHeader
                        icon={<IconPlus />}
                        title={t("modals.addList.title")}
                    />
                ),
                children: <AddListModal />,
            });
        },
    };
}
