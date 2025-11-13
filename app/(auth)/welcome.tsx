import {
  View,
  Text,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

import React, { useEffect } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import Button from "@/components/Buttun";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = scale(136);
const IMAGE_BORDER = scale(3);
const IMAGE_OVERLAP = scale(12);
const VERTICAL_SPACING = verticalScale(12);

export default function Welcome() {
  const router = useRouter();

  const leftCol1 = useSharedValue(-width);
  const rightCol1 = useSharedValue(width);
  const leftCol2 = useSharedValue(-width);
  const rightCol2 = useSharedValue(width);
  const leftCol3 = useSharedValue(-width);
  const rightCol3 = useSharedValue(width);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate images from left and right
    leftCol1.value = withSpring(0, { damping: 15, stiffness: 90 });
    rightCol1.value = withDelay(
      100,
      withSpring(0, { damping: 15, stiffness: 90 })
    );

    leftCol2.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 90 })
    );
    rightCol2.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 90 })
    );

    leftCol3.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 90 })
    );
    rightCol3.value = withDelay(
      500,
      withSpring(0, { damping: 15, stiffness: 90 })
    );

    // Fade in text and button
    opacity.value = withDelay(700, withSpring(1, { damping: 20 }));
  }, []);

  // Animated styles
  const leftCol1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: leftCol1.value }],
  }));

  const rightCol1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: rightCol1.value }],
  }));

  const leftCol2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: leftCol2.value }],
  }));

  const rightCol2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: rightCol2.value }],
  }));

  const leftCol3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: leftCol3.value }],
  }));

  const rightCol3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: rightCol3.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const imageStyle = {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: IMAGE_BORDER,
    borderColor: colors.white,
  };

  return (
    <ScreenWrapper showPattern={true}>
      <View style={styles.container}>
        <View>
          {/* Row 1 */}
          <View style={styles.row}>
            <Animated.View style={[leftCol1Style, styles.imageLeft]}>
              <Image
                source={require("@/assets/images/splash-screen/image1.png")}
                style={imageStyle}
              />
            </Animated.View>
            <Animated.View style={[rightCol1Style, styles.imageRight]}>
              <Image
                source={require("@/assets/images/splash-screen/image2.png")}
                style={imageStyle}
              />
            </Animated.View>
          </View>

          {/* Row 2 */}
          <View style={[styles.row, { marginTop: -VERTICAL_SPACING }]}>
            <Animated.View style={[leftCol2Style, styles.imageLeft]}>
              <Image
                source={require("@/assets/images/splash-screen/image6.png")}
                style={imageStyle}
              />
            </Animated.View>
            <Animated.View style={[rightCol2Style, styles.imageRight]}>
              <Image
                source={require("@/assets/images/splash-screen/image4.png")}
                style={imageStyle}
              />
            </Animated.View>
          </View>

          {/* Row 3 */}
          <View style={[styles.row, { marginTop: -VERTICAL_SPACING }]}>
            <Animated.View style={[leftCol3Style, styles.imageLeft]}>
              <Image
                source={require("@/assets/images/splash-screen/image5.png")}
                style={imageStyle}
              />
            </Animated.View>
            <Animated.View style={[rightCol3Style, styles.imageRight]}>
              <Image
                source={require("@/assets/images/splash-screen/image3.png")}
                style={imageStyle}
              />
            </Animated.View>
          </View>
        </View>
        <Animated.View style={[textStyle, styles.textContainer]}>
          <Typo color={colors.white} size={32} fontWeight={"600"}>
            Stay connected{"\n"}and chat with ease
          </Typo>
          <Typo color={colors.neutral400} size={15} style={{ marginTop: 8 }}>
            Stay connected with your loved ones through{"\n"}seamless messaging
            and chat features
          </Typo>
        </Animated.View>
        <Button
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push("/(auth)/Register")}
        >
          <Typo fontWeight="bold" size={18}>
            Get Started
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: spacingX._20,
    marginVertical: spacingY._10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: -IMAGE_OVERLAP,
  },
  imageLeft: {
    zIndex: 10,
  },
  imageRight: {
    marginLeft: -IMAGE_OVERLAP,
    zIndex: 20,
  },
  textContainer: {
    width: "100%",
  },
});
