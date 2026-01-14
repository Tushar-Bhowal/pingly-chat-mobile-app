import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import BackButton from "@/components/BackButton";
import ContactItem, { ContactItemProps } from "@/components/ContactItem";
import Loading from "@/components/Loading";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getUsersAPI } from "@/services/userService";

const NewConversationModal = () => {
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<ContactItemProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const { users: fetchedUsers } = await getUsersAPI(token);
      // Map to ContactItemProps
      const mappedUsers: ContactItemProps[] = fetchedUsers.map((user) => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar || undefined,
        bio: user.bio || "Hey there! I'm using Pingly",
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
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

  const handleCreateGroup = () => {
    router.push("/(main)/createGroupModal" as any);
  };

  const handleContactPress = (contact: ContactItemProps) => {
    // TODO: Create or open direct conversation
    console.log("Starting chat with:", contact.name);
    router.back();
  };

  const renderContact = ({ item }: { item: ContactItemProps }) => (
    <ContactItem {...item} onPress={() => handleContactPress(item)} />
  );

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton color={colors.text} />
          <Typo size={20} fontWeight="700" color={colors.text}>
            New Conversation
          </Typo>
          <View style={styles.headerSpacer} />
        </View>

        {/* Create Group Button */}
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={handleCreateGroup}
          activeOpacity={0.8}
        >
          <View style={styles.createGroupIcon}>
            <Icons.UsersThreeIcon
              size={verticalScale(24)}
              color={colors.white}
              weight="fill"
            />
          </View>
          <View style={styles.createGroupText}>
            <Typo size={16} fontWeight="600" color={colors.text}>
              Create New Group
            </Typo>
            <Typo size={13} color={colors.neutral500}>
              Chat with multiple people
            </Typo>
          </View>
          <Icons.CaretRightIcon
            size={verticalScale(20)}
            color={colors.neutral400}
          />
        </TouchableOpacity>

        {/* Search Bar */}
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icons.XCircleIcon
                size={verticalScale(20)}
                color={colors.neutral400}
                weight="fill"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Typo size={14} fontWeight="600" color={colors.neutral500}>
            CONTACTS
          </Typo>
        </View>

        {/* Contact List */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loading />
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icons.UserIcon
              size={verticalScale(48)}
              color={colors.neutral300}
              weight="light"
            />
            <Typo size={16} color={colors.neutral500} style={styles.emptyText}>
              No contacts found
            </Typo>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contactList}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

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
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacingX._15,
    marginTop: spacingY._10,
    marginBottom: spacingY._15,
    padding: spacingX._15,
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  createGroupIcon: {
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: verticalScale(24),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  createGroupText: {
    flex: 1,
    marginLeft: spacingX._12,
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
  },
  searchInput: {
    flex: 1,
    marginLeft: spacingX._10,
    fontSize: verticalScale(14),
    color: colors.text,
  },
  sectionHeader: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
  },
  contactList: {
    paddingBottom: spacingY._20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._50,
  },
  emptyText: {
    marginTop: spacingY._10,
  },
});
