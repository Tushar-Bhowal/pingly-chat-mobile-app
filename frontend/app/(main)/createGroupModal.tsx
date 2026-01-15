import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import BackButton from "@/components/BackButton";
import Button from "@/components/Buttun";
import ContactItem, { ContactItemProps } from "@/components/ContactItem";
import Avatar from "@/components/Avatar";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale, scale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getUsersAPI } from "@/services/userService";
import { createConversationAPI } from "@/services/conversationService";
import { uploadToCloudinary } from "@/services/imageService";

const CreateGroupModal = () => {
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  const [users, setUsers] = useState<ContactItemProps[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsLoadingUsers(true);
    try {
      const { users: fetchedUsers } = await getUsersAPI(token);
      const mappedUsers: ContactItemProps[] = fetchedUsers.map((user) => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar || "",
        bio: user.bio || "Hey there! I'm using Pingly",
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((contact) =>
      contact.name.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

  // Get selected contacts
  const selectedContacts = useMemo(() => {
    return users.filter((c) => selectedIds.includes(c.id));
  }, [selectedIds, users]);

  const handleContactToggle = (contact: ContactItemProps) => {
    setSelectedIds((prev) =>
      prev.includes(contact.id)
        ? prev.filter((id) => id !== contact.id)
        : [...prev, contact.id]
    );
  };

  const handleRemoveMember = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const pickGroupImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupAvatar(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Required", "Please enter a group name.");
      return;
    }

    if (selectedIds.length < 1) {
      Alert.alert(
        "Select Members",
        "Please select at least 1 member for a group."
      );
      return;
    }

    setIsCreating(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      // Upload avatar to Cloudinary if selected
      let avatarUrl = undefined;
      if (groupAvatar && groupAvatar.startsWith("file://")) {
        avatarUrl = await uploadToCloudinary(groupAvatar, "group-avatars");
      } else if (groupAvatar) {
        avatarUrl = groupAvatar;
      }

      // Create group conversation
      const { conversation, isNew } = await createConversationAPI(token, {
        type: "group",
        participants: selectedIds,
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        avatar: avatarUrl,
      });

      console.log("Group created:", conversation._id, "isNew:", isNew);

      // Navigate to conversation
      router.dismissAll();
      router.push({
        pathname: "/(main)/conversation",
        params: {
          conversationId: conversation._id,
          name: conversation.name || groupName.trim(),
          avatar: avatarUrl || "",
          isGroup: "true",
          participantCount: String(selectedIds.length + 1),
        },
      } as any);
    } catch (error: any) {
      console.error("Create group error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create group"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton color={colors.text} />
          <Typo size={20} fontWeight="700" color={colors.text}>
            Create Group
          </Typo>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Group Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.groupAvatarContainer}
              onPress={pickGroupImage}
            >
              {groupAvatar ? (
                <Avatar uri={groupAvatar} size={100} isGroup />
              ) : (
                <View style={styles.groupAvatarPlaceholder}>
                  <Icons.CameraIcon
                    size={verticalScale(36)}
                    color={colors.white}
                  />
                </View>
              )}
              <View style={styles.editBadge}>
                <Icons.PencilSimpleIcon
                  size={verticalScale(14)}
                  color={colors.white}
                />
              </View>
            </TouchableOpacity>
            <Typo size={13} color={colors.neutral500} style={styles.avatarHint}>
              Tap to add group photo
            </Typo>
          </View>

          {/* Group Name Input */}
          <View style={styles.inputContainer}>
            <Typo size={14} fontWeight="600" color={colors.neutral600}>
              Group Name{" "}
              <Typo size={14} color={colors.rose}>
                *
              </Typo>
            </Typo>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter group name..."
              placeholderTextColor={colors.neutral400}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>

          {/* Group Description Input */}
          <View style={styles.inputContainer}>
            <Typo size={14} fontWeight="600" color={colors.neutral600}>
              Description{" "}
              <Typo size={13} color={colors.neutral400}>
                (Optional)
              </Typo>
            </Typo>
            <TextInput
              style={[styles.nameInput, styles.descriptionInput]}
              placeholder="What's this group about?"
              placeholderTextColor={colors.neutral400}
              value={groupDescription}
              onChangeText={setGroupDescription}
              maxLength={200}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Selected Members Chips - Always show with admin */}
          <View style={styles.selectedSection}>
            <Typo size={14} fontWeight="600" color={colors.neutral600}>
              Members ({selectedContacts.length + 1})
            </Typo>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsContainer}
              contentContainerStyle={styles.chipsContent}
            >
              {/* Admin (You) - always first */}
              <View style={styles.chip}>
                <Avatar uri={user?.avatar || null} size={28} />
                <Typo size={13} color={colors.text} style={styles.chipName}>
                  You
                </Typo>
              </View>
              {/* Other selected members */}
              {selectedContacts.map((contact) => (
                <View key={contact.id} style={styles.chip}>
                  <Avatar uri={contact.avatar || null} size={28} />
                  <Typo
                    size={13}
                    color={colors.text}
                    style={styles.chipName}
                    textProps={{ numberOfLines: 1 }}
                  >
                    {contact.name.split(" ")[0]}
                  </Typo>
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(contact.id)}
                    style={styles.chipRemove}
                  >
                    <Icons.XIcon
                      size={verticalScale(14)}
                      color={colors.neutral500}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Search Bar */}
          <View style={styles.sectionHeader}>
            <Typo size={14} fontWeight="600" color={colors.neutral600}>
              Add Members
            </Typo>
          </View>

          <View style={styles.searchContainer}>
            <Icons.MagnifyingGlassIcon
              size={verticalScale(20)}
              color={colors.neutral400}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor={colors.neutral400}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Contact List */}
          <View style={styles.contactListContainer}>
            {isLoadingUsers ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyState}>
                <Typo size={14} color={colors.neutral500}>
                  No users found
                </Typo>
              </View>
            ) : (
              filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  {...contact}
                  selectable
                  isSelected={selectedIds.includes(contact.id)}
                  onPress={() => handleContactToggle(contact)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.createButtonContainer}>
          <Button onPress={handleCreateGroup} loading={isCreating}>
            <Typo size={16} fontWeight="600" color={colors.white}>
              Create Group
            </Typo>
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default CreateGroupModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
  },
  headerSpacer: {
    width: verticalScale(40),
  },
  scrollContent: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: spacingY._20,
  },
  groupAvatarContainer: {
    position: "relative",
  },
  groupAvatarPlaceholder: {
    width: verticalScale(100),
    height: verticalScale(100),
    borderRadius: verticalScale(50),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: verticalScale(16),
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarHint: {
    marginTop: spacingY._10,
  },
  inputContainer: {
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  nameInput: {
    marginTop: spacingY._7,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    backgroundColor: colors.neutral100,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: colors.neutral200,
    fontSize: verticalScale(15),
    color: colors.text,
  },
  descriptionInput: {
    minHeight: verticalScale(80),
    paddingTop: spacingY._12,
  },
  selectedSection: {
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  chipsContainer: {
    marginTop: spacingY._10,
  },
  chipsContent: {
    gap: spacingX._10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: verticalScale(20),
    paddingVertical: spacingY._5,
    paddingLeft: spacingX._5,
    paddingRight: spacingX._10,
    marginRight: spacingX._7,
  },
  adminChip: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipName: {
    marginLeft: spacingX._7,
    maxWidth: scale(70),
  },
  chipRemove: {
    marginLeft: spacingX._5,
    padding: spacingX._5,
  },
  sectionHeader: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    marginHorizontal: spacingX._15,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginBottom: spacingY._10,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacingX._10,
    fontSize: verticalScale(14),
    color: colors.text,
  },
  contactListContainer: {
    paddingBottom: spacingY._20,
  },
  loaderContainer: {
    paddingVertical: spacingY._30,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacingY._30,
    alignItems: "center",
  },
  createButtonContainer: {
    marginHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
