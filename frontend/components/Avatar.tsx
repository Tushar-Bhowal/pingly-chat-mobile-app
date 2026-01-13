import { verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AvatarProps } from "@/types";
import { getAvatarPath } from "@/services/imageService";
import { colors, radius } from "@/constants/theme";

const Avatar = ({
  uri,
  size = 40,
  style,
  isGroup = false,
  showOnlineIndicator = false,
}: AvatarProps) => {
  return (
    <View
      style={[
        styles.avatar,
        {
          height: verticalScale(size),
          width: verticalScale(size),
          borderRadius: verticalScale(size / 2),
        },
        style,
      ]}
    >
      <Image
        style={styles.image}
        source={getAvatarPath(uri, isGroup)}
        contentFit="cover"
        transition={100}
      />
      {showOnlineIndicator && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: verticalScale(size * 0.28),
              height: verticalScale(size * 0.28),
              borderRadius: verticalScale(size * 0.14),
            },
          ]}
        />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  image: {
    flex: 1,
    borderRadius: 999,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
