import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import ChatCard from "@/components/ChatCard";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { ChatCardProps } from "@/types";

// Static chat data for now
const STATIC_CHATS: ChatCardProps[] = [
  {
    id: "1",
    name: "Alan George",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "That sounds like a great...",
    time: "12.23 PM",
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "2",
    name: "Jasmine Fernandez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "ohh! that's nice.",
    time: "12.23 PM",
    isRead: true,
    isOnline: false,
  },
  {
    id: "3",
    name: "Joseph Alex",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    lastMessage: "Good morning Joseph!",
    time: "12.23 PM",
    isRead: true,
    isOnline: true,
  },
  {
    id: "4",
    name: "Milan Christopher",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    lastMessage: "Wonderful!",
    time: "12.23 PM",
    isRead: true,
    isOnline: false,
  },
  {
    id: "5",
    name: "Princy Xavier",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    lastMessage: "Great.",
    time: "12.23 PM",
    unreadCount: 2,
    isOnline: true,
  },
];

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleProfilePress = () => {
    router.push("/(main)/profileModal" as any);
  };

  const handleChatPress = (chatId: string) => {
    // Navigate to chat screen (to be implemented)
    console.log("Opening chat:", chatId);
  };

  const renderChatItem = ({ item }: { item: ChatCardProps }) => (
    <ChatCard {...item} onPress={() => handleChatPress(item.id)} />
  );

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Typo
            color={colors.neutral200}
            size={15}
            textProps={{ numberOfLines: 1 }}
            fontWeight="600"
          >
            Hello,{" "}
            <Typo size={18} color={colors.white} fontWeight={"800"}>
              {user?.name || "User"}
            </Typo>
          </Typo>

          {/* Profile Icon */}
          <TouchableOpacity onPress={handleProfilePress}>
            <Avatar uri={user?.avatar || null} size={35} />
          </TouchableOpacity>
        </View>

        {/* Chats Section */}
        <View style={styles.chatsSection}>
          {/* Chats Header */}
          <View style={styles.chatsHeader}>
            <Typo size={24} fontWeight="700" color={colors.text}>
              Chats
            </Typo>
            <TouchableOpacity>
              <Icons.PlusCircleIcon
                size={verticalScale(28)}
                color={colors.primary}
                weight="fill"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icons.MagnifyingGlassIcon
              size={verticalScale(20)}
              color={colors.neutral400}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor={colors.neutral400}
            />
          </View>

          {/* Chat List */}
          <FlatList
            data={STATIC_CHATS}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatList}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  chatsSection: {
    flex: 1,
    backgroundColor: colors.chatBox,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    paddingTop: spacingY._20,
  },
  chatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    marginHorizontal: spacingX._20,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
    marginBottom: spacingY._10,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacingX._10,
    fontSize: verticalScale(14),
    color: colors.text,
  },
  chatList: {
    paddingBottom: spacingY._20,
  },
});
