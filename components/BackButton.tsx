import { StyleSheet, TouchableOpacity} from "react-native";
import React from "react";
import { BackButtonProps } from "@/types";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { verticalScale } from "@/utils/styling";
import { CaretLeftIcon } from "phosphor-react-native";
export default function BackButton({
  style,
  iconSize = 26,
  color = colors.white,
}: BackButtonProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[styles.button, style]}
    >
      <CaretLeftIcon
        size={verticalScale(iconSize)}
        color={color}
        weight="bold"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {},
});
