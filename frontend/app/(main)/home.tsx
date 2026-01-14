import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import ChatCard from "@/components/ChatCard";
import Avatar from "@/components/Avatar";
import Loading from "@/components/Loading";
import FilterChips, { FilterOption } from "@/components/FilterChips";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { ChatCardProps } from "@/types";

// Static chat data for now (with timestamps for sorting)
const STATIC_CHATS: ChatCardProps[] = [
  {
    id: "1",
    name: "Alan George",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "That sounds like a great...",
    messageType: "text",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago (Today)
    unreadCount: 1,
    isGroup: false,
  },
  {
    id: "2",
    name: "Project Team",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    lastMessage: "", // Will show "📷 Photo"
    messageType: "image",
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago (Today)
    unreadCount: 5,
    isGroup: true,
    memberCount: 8,
  },
  {
    id: "3",
    name: "Jasmine Fernandez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "", // Will show "🎥 Video"
    messageType: "video",
    timestamp: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago (Yesterday)
    isRead: true,
    isGroup: false,
  },
  {
    id: "4",
    name: "Design Squad",
    avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
    lastMessage: "Lisa: Check out the new mockups!",
    messageType: "text",
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago (Day name)
    isRead: true,
    isGroup: true,
    memberCount: 5,
  },
  {
    id: "5",
    name: "Princy Xavier",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    lastMessage: "", // Will show "🎵 Audio"
    messageType: "audio",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago (Date)
    unreadCount: 2,
    isGroup: false,
  },
];

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<ChatCardProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setChats(STATIC_CHATS);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate unread count for badge
  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats]
  );

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    let result = [...chats];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (chat) =>
          chat.name.toLowerCase().includes(query) ||
          chat.lastMessage.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    switch (activeFilter) {
      case "unread":
        result = result.filter((chat) => (chat.unreadCount || 0) > 0);
        break;
      case "groups":
        result = result.filter((chat) => chat.isGroup);
        break;
      default:
        break;
    }

    // Sort by timestamp (most recent first)
    result.sort((a, b) => b.timestamp - a.timestamp);

    return result;
  }, [chats, activeFilter, searchQuery]);

  const handleProfilePress = () => {
    router.push("/(main)/profileModal" as any);
  };

  const handleChatPress = (chatId: string) => {
    // Navigate to chat screen (to be implemented)
    console.log("Opening chat:", chatId);
  };

  const handleNewChat = () => {
    router.push({
      pathname: "/(main)/newConversationModal",
    });
  };

  const renderChatItem = ({ item }: { item: ChatCardProps }) => (
    <ChatCard {...item} onPress={() => handleChatPress(item.id)} />
  );

  // Determine empty state type
  const getEmptyStateType = () => {
    if (activeFilter === "unread") return "no-unread";
    if (activeFilter === "groups") return "no-groups";
    return "no-chats";
  };

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
            <TouchableOpacity onPress={handleNewChat}>
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
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <FilterChips
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            unreadCount={totalUnread}
          />

          {/* Chat List / Loading / Empty */}
          {isLoading ? (
            <View style={{ flex: 1 }}>
              <Loading />
            </View>
          ) : filteredChats.length === 0 ? (
            <View style={{ flex: 1 }}>
              <EmptyState type={getEmptyStateType()} onAction={handleNewChat} />
            </View>
          ) : (
            <FlatList
              data={filteredChats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatList}
            />
          )}
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
    marginBottom: spacingY._5,
    borderWidth: 1,
    borderColor: colors.neutral300,
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
