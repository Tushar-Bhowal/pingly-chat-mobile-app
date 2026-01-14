import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import Avatar from "./Avatar";

export interface ContactItemProps {
  id: string;
  name: string;
  avatar?: string;
  bio?: string; // User bio message
  isSelected?: boolean;
  selectable?: boolean;
  onPress?: () => void;
}

export default function ContactItem({
  id,
  name,
  avatar,
  bio,
  isSelected = false,
  selectable = false,
  onPress,
}: ContactItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar uri={avatar || null} size={50} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Typo
          size={16}
          fontWeight="600"
          color={colors.text}
          textProps={{ numberOfLines: 1 }}
        >
          {name}
        </Typo>
        {bio && (
          <Typo
            size={13}
            color={colors.neutral500}
            textProps={{ numberOfLines: 1 }}
          >
            {bio}
          </Typo>
        )}
      </View>

      {/* Selection indicator */}
      {selectable && (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Typo size={12} color={colors.white} fontWeight="700">
              ✓
            </Typo>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    borderRadius: verticalScale(12),
    marginHorizontal: spacingX._15,
    marginVertical: spacingY._5,
  },
  selected: {
    backgroundColor: colors.neutral200,
  },
  avatarContainer: {
    position: "relative",
  },
  info: {
    flex: 1,
    marginLeft: spacingX._12,
  },
  checkbox: {
    width: verticalScale(24),
    height: verticalScale(24),
    borderRadius: verticalScale(12),
    borderWidth: 2,
    borderColor: colors.neutral400,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
