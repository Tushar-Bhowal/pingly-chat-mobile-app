import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import * as Icons from "phosphor-react-native";

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectVideo: () => void;
  onSelectDocument: () => void;
}

const MENU_ITEMS = [
  { id: "document", label: "Document", icon: Icons.FileIcon },
  { id: "video", label: "Video", icon: Icons.VideoCameraIcon },
  { id: "image", label: "Image", icon: Icons.ImageIcon },
];

export default function AttachmentMenu({
  visible,
  onClose,
  onSelectImage,
  onSelectVideo,
  onSelectDocument,
}: AttachmentMenuProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const animatedValues = useRef(
    MENU_ITEMS.map(() => new Animated.Value(0))
  ).current;
  const scaleValues = useRef(
    MENU_ITEMS.map(() => new Animated.Value(0.5))
  ).current;

  useEffect(() => {
    if (visible) {
      // Staggered animation for each item
      MENU_ITEMS.forEach((_, index) => {
        Animated.parallel([
          Animated.spring(animatedValues[index], {
            toValue: 1,
            delay: index * 50,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(scaleValues[index], {
            toValue: 1,
            delay: index * 50,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      });
    } else {
      // Close animation - reverse
      MENU_ITEMS.forEach((_, index) => {
        const reverseIndex = MENU_ITEMS.length - 1 - index;
        Animated.parallel([
          Animated.timing(animatedValues[reverseIndex], {
            toValue: 0,
            duration: 100,
            delay: index * 30,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValues[reverseIndex], {
            toValue: 0.5,
            duration: 100,
            delay: index * 30,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible]);

  const handleSelect = (id: string) => {
    setShowTooltip(null);
    switch (id) {
      case "image":
        onSelectImage();
        break;
      case "video":
        onSelectVideo();
        break;
      case "document":
        onSelectDocument();
        break;
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop to close menu */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>
        {MENU_ITEMS.map((item, index) => {
          const IconComponent = item.icon;
          const translateY = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemWrapper,
                {
                  opacity: animatedValues[index],
                  transform: [{ translateY }, { scale: scaleValues[index] }],
                },
              ]}
            >
              {/* Tooltip */}
              {showTooltip === item.id && (
                <View style={styles.tooltip}>
                  <Typo size={12} color={colors.white}>
                    {item.label}
                  </Typo>
                </View>
              )}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleSelect(item.id)}
                onPressIn={() => setShowTooltip(item.id)}
                onPressOut={() => setShowTooltip(null)}
                activeOpacity={0.7}
              >
                <IconComponent
                  size={verticalScale(22)}
                  color={colors.neutral700}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  container: {
    position: "absolute",
    bottom: verticalScale(65),
    left: spacingX._10,
    zIndex: 20,
    alignItems: "center",
    gap: spacingY._10,
  },
  menuItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  menuItem: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    backgroundColor: colors.neutral200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
  },
  tooltip: {
    position: "absolute",
    left: verticalScale(48),
    backgroundColor: colors.neutral800,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
});
