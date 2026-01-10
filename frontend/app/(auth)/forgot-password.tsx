import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import { useRouter } from "expo-router";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Buttun";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const emailRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const handleSubmit = async () => {
    if (!emailRef.current) {
      Alert.alert("Forgot Password", "Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(emailRef.current);
      // Navigate to OTP verification
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { email: emailRef.current, flow: "forgot-password" },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={28} />
          </View>

          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={styles.form}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                <Typo size={28} fontWeight={"600"}>
                  Forgot Password
                </Typo>
                <Typo color={colors.neutral600}>
                  Enter your email to receive a verification code
                </Typo>
              </View>

              <Input
                placeholder="Enter your email"
                onChangeText={(value: string) => (emailRef.current = value)}
                textContentType="emailAddress"
                autoComplete="email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={
                  <Icons.AtIcon
                    size={verticalScale(26)}
                    color={colors.primary}
                  />
                }
              />

              <View style={{ marginTop: spacingY._25 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo fontWeight={"bold"} color={colors.black} size={20}>
                    Send Code
                  </Typo>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.chatBox,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingX._20,
  },
});
