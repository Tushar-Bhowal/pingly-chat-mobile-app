import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { colors, spacingY } from "@/constants/theme";
import Button from "@/components/Buttun";

const Home = () => {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Typo size={24} fontWeight="600">
          Welcome, {user?.name || "User"}!
        </Typo>
        <Typo color={colors.neutral600}>{user?.email}</Typo>

        <View style={styles.buttonContainer}>
          <Button loading={isLoading} onPress={handleSignOut}>
            <Typo fontWeight="bold" color={colors.black} size={18}>
              Sign Out
            </Typo>
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: spacingY._10,
  },
  buttonContainer: {
    marginTop: spacingY._25,
  },
});
