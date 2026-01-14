import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import * as Icons from "phosphor-react-native";

export type EmptyStateType = "no-chats" | "no-unread" | "no-groups";

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
}

const EMPTY_STATES: Record<
  EmptyStateType,
  {
    icon: keyof typeof Icons;
    title: string;
    subtitle: string;
    actionLabel?: string;
  }
> = {
  "no-chats": {
    icon: "ChatCircleIcon",
    title: "No conversations yet",
    subtitle: "Start chatting with your friends!",
    actionLabel: "Start Chat",
  },
  "no-unread": {
    icon: "CheckCircleIcon",
    title: "All caught up!",
    subtitle: "No unread messages",
  },
  "no-groups": {
    icon: "UsersThreeIcon",
    title: "No group chats",
    subtitle: "Create or join a group to get started",
    actionLabel: "Create Group",
  },
};

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const config = EMPTY_STATES[type];
  const IconComponent = Icons[config.icon] as React.ComponentType<any>;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent
          size={verticalScale(64)}
          color={colors.neutral400}
          weight="light"
        />
      </View>
      <Typo
        size={18}
        fontWeight="600"
        color={colors.neutral700}
        style={styles.title}
      >
        {config.title}
      </Typo>
      <Typo size={14} color={colors.neutral500} style={styles.subtitle}>
        {config.subtitle}
      </Typo>
      {config.actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Typo size={14} fontWeight="600" color={colors.white}>
            {config.actionLabel}
          </Typo>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._30,
    paddingVertical: spacingY._50,
  },
  iconContainer: {
    marginBottom: spacingY._20,
  },
  title: {
    textAlign: "center",
    marginBottom: spacingY._7,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacingY._20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    borderRadius: radius._10,
  },
});
