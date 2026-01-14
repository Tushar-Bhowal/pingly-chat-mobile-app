import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Button from "@/components/Buttun";
import Typo from "@/components/Typo";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadToCloudinary } from "@/services/imageService";

const ProfileModal = () => {
  const { user, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "Hey there! I'm using Pingly");
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    // Check if anything changed
    const nameChanged = name.trim() !== user?.name;
    const bioChanged =
      bio.trim() !== (user?.bio || "Hey there! I'm using Pingly");
    const avatarChanged = avatarUri !== user?.avatar;

    if (!nameChanged && !bioChanged && !avatarChanged) {
      router.back();
      return;
    }

    setIsLoading(true);

    try {
      const updateData: { name?: string; avatar?: string; bio?: string } = {};
      if (nameChanged) updateData.name = name.trim();
      if (bioChanged) updateData.bio = bio.trim();

      // Upload avatar to Cloudinary if changed
      if (avatarChanged && avatarUri) {
        // Check if it's a local file URI (needs upload) or already a URL
        if (avatarUri.startsWith("file://")) {
          const cloudinaryUrl = await uploadToCloudinary(avatarUri, "avatars");
          updateData.avatar = cloudinaryUrl;
        } else {
          updateData.avatar = avatarUri;
        }
      }

      const success = await updateProfile(updateData);

      if (success) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload image. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access the photo library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access the camera is required."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert("Change Avatar", "Choose an option", [
      { text: "Take Photo", onPress: takePhotoWithCamera },
      { text: "Choose from Gallery", onPress: pickImageFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title="Update Profile"
          leftIcon={<BackButton color={colors.text} />}
          style={{ marginVertical: spacingY._15 }}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              <Avatar uri={avatarUri} size={120} />
              <View style={styles.editBadge}>
                <Icons.CameraIcon
                  size={verticalScale(18)}
                  color={colors.white}
                  weight="fill"
                />
              </View>
            </TouchableOpacity>
            <Typo size={12} color={colors.neutral500} style={styles.avatarHint}>
              Tap to change photo
            </Typo>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Typo
                size={14}
                fontWeight="500"
                color={colors.neutral600}
                style={styles.label}
              >
                Full Name
              </Typo>
              <Input
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                icon={
                  <Icons.UserIcon
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                }
              />
            </View>

            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Typo
                size={14}
                fontWeight="500"
                color={colors.neutral600}
                style={styles.label}
              >
                Bio
              </Typo>
              <Input
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={setBio}
                maxLength={150}
                icon={
                  <Icons.ChatCircleTextIcon
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                }
              />
              <Typo size={11} color={colors.neutral400} style={styles.hint}>
                {bio.length}/150 characters
              </Typo>
            </View>

            {/* Email Input (readonly) */}
            <View style={styles.inputGroup}>
              <Typo
                size={14}
                fontWeight="500"
                color={colors.neutral600}
                style={styles.label}
              >
                Email Address
              </Typo>
              <Input
                placeholder="Email"
                value={user?.email || ""}
                editable={false}
                icon={
                  <Icons.EnvelopeIcon
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                }
                containerStyle={styles.disabledInput}
              />
              <Typo size={11} color={colors.neutral400} style={styles.hint}>
                Email cannot be changed
              </Typo>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button onPress={handleUpdateProfile} loading={isLoading}>
            <Typo size={16} fontWeight="600" color={colors.white}>
              Update Profile
            </Typo>
          </Button>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icons.SignOutIcon
              size={verticalScale(20)}
              color={colors.rose}
              weight="bold"
            />
            <Typo size={15} fontWeight="500" color={colors.rose}>
              Logout
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacingY._20,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: spacingY._20,
    marginBottom: spacingY._30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: 3,
    borderColor: colors.primary,
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarHint: {
    marginTop: spacingY._10,
  },
  formSection: {
    gap: spacingY._20,
  },
  inputGroup: {
    gap: spacingY._7,
  },
  label: {
    marginLeft: spacingX._5,
  },
  hint: {
    marginLeft: spacingX._5,
    marginTop: spacingY._5,
  },
  disabledInput: {
    backgroundColor: colors.neutral200,
    opacity: 0.7,
  },
  bottomActions: {
    paddingVertical: spacingY._20,
    gap: spacingY._15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._12,
  },
});
