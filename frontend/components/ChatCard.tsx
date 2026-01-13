import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { ChatCardProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import Avatar from "./Avatar";
import * as Icons from "phosphor-react-native";

export default function ChatCard({
  id,
  name,
  avatar,
  lastMessage,
  time,
  unreadCount = 0,
  isRead = true,
  isOnline = false,
  onPress,
}: ChatCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar uri={avatar || null} size={56} />
      </View>

      {/* Content with border */}
      <View style={styles.content}>
        <View style={styles.contentInner}>
          <View style={styles.topRow}>
            <Typo
              size={16}
              fontWeight="600"
              color={colors.text}
              style={styles.name}
              textProps={{ numberOfLines: 1 }}
            >
              {name}
            </Typo>
            <Typo size={12} color={colors.neutral500}>
              {time}
            </Typo>
          </View>

          <View style={styles.bottomRow}>
            <Typo
              size={14}
              color={colors.neutral500}
              style={styles.message}
              textProps={{ numberOfLines: 1 }}
            >
              {lastMessage}
            </Typo>

            {/* Unread badge or read check */}
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Typo size={11} color={colors.white} fontWeight="600">
                  {unreadCount}
                </Typo>
              </View>
            ) : isRead ? (
              <Icons.ChecksIcon
                size={verticalScale(18)}
                color={colors.primary}
                weight="bold"
              />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacingX._20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral350,
  },
  avatarContainer: {
    position: "relative",
    paddingVertical: spacingY._12,
  },
  avatar: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
    marginLeft: spacingX._12,
  },
  contentInner: {
    paddingVertical: spacingY._12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  name: {
    flex: 1,
    marginRight: spacingX._10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    flex: 1,
    marginRight: spacingX._10,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._5,
  },
});
