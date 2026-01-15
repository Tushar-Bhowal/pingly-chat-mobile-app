import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import ChatCard from "@/components/ChatCard";
import Avatar from "@/components/Avatar";
import Loading from "@/components/Loading";
import FilterChips, { FilterOption } from "@/components/FilterChips";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { ChatCardProps, ConversationProps } from "@/types";
import { getConversationsAPI } from "@/services/conversationService";
import { getSocket } from "@/socket/socket";

const Home = () => {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<ChatCardProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Convert conversation to ChatCardProps
  const mapConversationToChat = useCallback(
    (conv: ConversationProps): ChatCardProps => {
      // For direct chat, get the other participant
      const otherParticipant =
        conv.type === "direct"
          ? conv.participants.find((p) => p._id !== user?._id)
          : null;
      // For groups without messages, show creation message
      const getLastMessage = () => {
        if (conv.lastMessage?.content) {
          return conv.lastMessage.content;
        }
        if (conv.type === "group") {
          // Check if current user created the group
          const isCreator = conv.createdBy?._id === user?._id;
          if (isCreator) {
            return `You created group "${conv.name}"`;
          } else {
            return `You were added to this group`;
          }
        }
        return "";
      };

      return {
        id: conv._id,
        name:
          conv.type === "group"
            ? conv.name || "Group"
            : otherParticipant?.name || "Unknown",
        avatar:
          conv.type === "group"
            ? conv.avatar || undefined
            : otherParticipant?.avatar || undefined,
        lastMessage: getLastMessage(),
        messageType: conv.lastMessage?.type || "text",
        timestamp: conv.lastMessage?.createdAt
          ? new Date(conv.lastMessage.createdAt).getTime()
          : Date.now(),
        unreadCount: conv.unreadCount || 0,
        isGroup: conv.type === "group",
        memberCount:
          conv.type === "group" ? conv.participants.length : undefined,
        isRead: conv.lastMessage ? conv.lastMessage.isRead : false,
      };
    },
    [user?._id]
  );

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { conversations } = await getConversationsAPI(token);
      const mappedChats = conversations.map(mapConversationToChat);
      setChats(mappedChats);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, mapConversationToChat]);

  // Fetch on mount and when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // Listen for new conversations via socket
  useEffect(() => {
    const handleNewConversation = (data: {
      conversation: ConversationProps;
    }) => {
      console.log("New conversation received:", data.conversation._id);
      const newChat = mapConversationToChat(data.conversation);
      setChats((prev) => [newChat, ...prev]);
    };

    const socket = getSocket();
    socket?.on("conversationCreated", handleNewConversation);

    return () => {
      socket?.off("conversationCreated", handleNewConversation);
    };
  }, [mapConversationToChat]);

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

  const handleChatPress = (chat: ChatCardProps) => {
    router.push({
      pathname: "/(main)/conversation",
      params: {
        conversationId: chat.id,
        name: chat.name,
        avatar: chat.avatar || "",
        isGroup: chat.isGroup ? "true" : "false",
        participantCount: chat.memberCount ? String(chat.memberCount) : "2",
      },
    } as any);
  };

  const handleNewChat = () => {
    router.push({
      pathname: "/(main)/newConversationModal",
    });
  };

  const renderChatItem = ({ item }: { item: ChatCardProps }) => (
    <ChatCard {...item} onPress={() => handleChatPress(item)} />
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
