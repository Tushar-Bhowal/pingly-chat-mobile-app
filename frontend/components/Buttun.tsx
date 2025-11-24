import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { ButtonProps } from "@/types";
import { colors, radius } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Loading from "./Loading";

export default function Button({
  style,
  children,
  onPress,
  loading = false,
}: ButtonProps) {

    if (loading) {
    return (
      <View style={[styles.button, style,{backgroundColor: 'transparent'}]}>
        <Loading/>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius._6,
    borderCurve: "continuous",
    height: verticalScale(50),
    justifyContent: "center",
    alignItems: "center",
  },
});
