import { View, StatusBar, Dimensions, StyleSheet, Text } from "react-native";
import "../global.css";
import React, { useEffect } from "react";
import { colors } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Shared values for animations
  const translateY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const opacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const textScale = useSharedValue(0.8);

  useEffect(() => {
    // Phase 1: Bouncing animation (0-2s)
    translateY.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
      ),
      2, // Repeat 2 times (2 bounces)
      false
    );

    // Phase 1.5: Text fade in and slide up (starts at 1s)
    setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
      textTranslateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
      textScale.value = withSpring(1, {
        damping: 8,
        stiffness: 100,
      });
    }, 1000);

    // Phase 2: Scale up to fill screen (starts at 2s)
    setTimeout(() => {
      const maxDimension = Math.max(width, height);
      const scaleFactor = (maxDimension * 1.5) / scale(150);

      scaleValue.value = withTiming(scaleFactor, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });

      // Fade out text as icon expands
      textOpacity.value = withTiming(0, {
        duration: 500,
      });

      // Optional: Fade out slightly as it expands
      opacity.value = withDelay(
        500,
        withTiming(0.9, {
          duration: 500,
        })
      );
    }, 2000);

    // Navigate to next screen
    setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 3500); // Total: 2s bounce + 1s scale + 0.5s buffer
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scaleValue.value },
      ],
      opacity: opacity.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { translateY: textTranslateY.value },
        { scale: textScale.value },
      ],
    };
  });

  return (
    <View className="flex-1 items-center justify-center bg-neutral-900">
      <StatusBar barStyle="light-content" backgroundColor={colors.neutral900} />
      <Animated.Image
        source={require("../assets/images/icon.png")}
        style={[
          {
            width: scale(150),
            height: scale(150),
            borderRadius: scale(30),
            backgroundColor: colors.white,
          },
          animatedStyle,
        ]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.appName, animatedTextStyle]}>
        Pingly
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    fontSize: scale(32),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: verticalScale(20),
    letterSpacing: 2,
  },
});
