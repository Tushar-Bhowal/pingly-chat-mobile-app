import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { scale, verticalScale } from "@/utils/styling";
import Button from "@/components/Buttun";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the fields");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(emailRef.current, passwordRef.current);
      // Navigate to home on success
      router.replace("/(main)/home" as any);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
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
              {/* --- Header --- */}
              <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                <Typo size={28} fontWeight={"600"}>
                  Welcome Back!
                </Typo>
                <Typo color={colors.neutral600}>
                  Time to catch up on your conversations
                </Typo>
              </View>

              {/* --- Inputs --- */}
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
              <Input
                placeholder="Enter your password"
                secureTextEntry
                onChangeText={(value: string) => (passwordRef.current = value)}
                textContentType="none"
                autoComplete="off"
                icon={
                  <Icons.LockIcon
                    size={verticalScale(26)}
                    color={colors.primary}
                  />
                }
              />

              {/* --- Forgot Password --- */}
              <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                <Typo
                  size={14}
                  color={colors.text}
                  fontWeight={"500"}
                  style={{ alignSelf: "flex-end" }}
                >
                  Forgot Password?
                </Typo>
              </Pressable>

              {/* --- Buttons --- */}
              <View style={{ gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo fontWeight={"bold"} color={colors.black} size={20}>
                    Sign In
                  </Typo>
                </Button>

                <View style={[styles.dividerContainer]}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  loading={isLoading}
                  onPress={handleSubmit}
                  style={styles.googleButtun}
                >
                  <Image
                    source={require("../../assets/google.png")}
                    style={{ width: scale(25), height: scale(25) }}
                  ></Image>
                  <Typo fontWeight={"bold"} color={colors.black} size={20}>
                    Google
                  </Typo>
                </Button>

                {/* --- Footer --- */}
                <View style={styles.footer}>
                  <Typo>Don't have an account?</Typo>
                  <Pressable onPress={() => router.push("/(auth)/Register")}>
                    <Typo fontWeight={"bold"} color={colors.primaryDark}>
                      Sign Up
                    </Typo>
                  </Pressable>
                </View>
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
  googleButtun: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._5,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._6,
    borderCurve: "continuous",
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingX._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacingY._10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral300,
  },
  dividerText: {
    color: colors.neutral400,
    fontSize: verticalScale(14),
    paddingHorizontal: spacingX._15,
    fontWeight: "500",
  },
});
