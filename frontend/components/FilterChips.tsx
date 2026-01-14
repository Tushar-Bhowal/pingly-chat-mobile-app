import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";

export type FilterOption = "all" | "unread" | "groups";

interface FilterChipsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  unreadCount?: number;
}

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
];

export default function FilterChips({
  activeFilter,
  onFilterChange,
  unreadCount = 0,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Typo
              size={13}
              fontWeight={isActive ? "600" : "400"}
              color={isActive ? colors.white : colors.neutral600}
            >
              {filter.label}
            </Typo>
            {filter.key === "unread" && unreadCount > 0 && (
              <View style={styles.badge}>
                <Typo size={10} fontWeight="600" color={colors.white}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Typo>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacingX._10,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._15,
    height: verticalScale(32),
    borderRadius: verticalScale(8),
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: colors.neutral300,
    gap: spacingX._5,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badge: {
    backgroundColor: colors.rose,
    minWidth: verticalScale(16),
    height: verticalScale(16),
    borderRadius: verticalScale(8),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._5,
  },
});
