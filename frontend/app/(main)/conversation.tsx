import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Avatar from "@/components/Avatar";
import Typo from "@/components/Typo";
import BackButton from "@/components/BackButton";
import MessageBubble from "@/components/MessageBubble";
import MessageActionModal from "@/components/MessageActionModal";
import AttachmentMenu from "@/components/AttachmentMenu";
import { MessageProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale, scale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";

// Static dummy messages for UI testing
const DUMMY_MESSAGES: MessageProps[] = [
  {
    id: "sys1",
    sender: { id: "system", name: "System", avatar: null },
    content: "You created this group",
    type: "system",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "1",
    sender: { id: "me", name: "Me", avatar: null },
    content:
      "Hi, good to see you! We're starting work on a presentation for a new product today, right?",
    type: "text",
    isMe: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    isRead: true,
  },
  {
    id: "2",
    sender: {
      id: "other1",
      name: "Katy",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    content:
      "Yes, that's right. Let's discuss the main points and structure of the presentation",
    type: "text",
    isMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "3",
    sender: { id: "me", name: "Me", avatar: null },
    content: "",
    type: "audio",
    isMe: true,
    attachment: "audio.mp3",
    attachmentMetadata: { duration: 104 },
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    isRead: true,
  },
  {
    id: "4",
    sender: {
      id: "other1",
      name: "Katy",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    content:
      "Okay, then let's divide the presentation into a few main sections: introduction, product description, features and benefits, use cases, and conclusion.",
    type: "text",
    isMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "5",
    sender: { id: "me", name: "Me", avatar: null },
    content: "It's a deal",
    type: "text",
    isMe: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: true,
  },
  {
    id: "6",
    sender: { id: "me", name: "Me", avatar: null },
    content: "",
    type: "image",
    isMe: true,
    attachment:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: true,
  },
];

const Conversation = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    conversationId: string;
    name: string;
    avatar?: string;
    isGroup?: string;
    participantCount?: string;
  }>();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>(DUMMY_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<MessageProps | null>(
    null
  );
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const isGroup = params.isGroup === "true";
  const participantCount = params.participantCount
    ? parseInt(params.participantCount)
    : 0;

  const hasMessages = messages.length > 0;

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: MessageProps = {
      id: Date.now().toString(),
      sender: { id: "me", name: "Me", avatar: null },
      content: message.trim(),
      type: "text",
      isMe: true,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleLongPress = (msg: MessageProps) => {
    if (msg.type === "system") return;
    setSelectedMessage(msg);
    setShowActionModal(true);
  };

  const handleEdit = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
      )
    );
  };

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const renderMessage = ({ item }: { item: MessageProps }) => (
    <MessageBubble
      message={item}
      isGroup={isGroup}
      showAvatar={!item.isMe}
      onLongPress={handleLongPress}
    />
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icons.ChatCircleDotsIcon
          size={verticalScale(80)}
          color={colors.neutral300}
          weight="thin"
        />
      </View>
      <Typo size={18} fontWeight="600" color={colors.neutral400}>
        No messages yet
      </Typo>
      <Typo size={14} color={colors.neutral400} style={styles.emptySubtext}>
        Start the conversation by sending a message
      </Typo>
    </View>
  );

  return (
    <ScreenWrapper showPattern={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={verticalScale(0)}
      >
        <View style={styles.header}>
          <BackButton color={colors.white} />

          <TouchableOpacity style={styles.headerInfo} activeOpacity={0.7}>
            <Avatar uri={params.avatar || null} size={40} isGroup={isGroup} />
            <View style={styles.headerText}>
              <Typo
                size={16}
                fontWeight="700"
                color={colors.white}
                textProps={{ numberOfLines: 1 }}
              >
                {params.name || "Chat"}
              </Typo>
              {isGroup && participantCount > 0 && (
                <Typo size={12} color="white">
                  {participantCount} members
                </Typo>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <Icons.DotsThreeVerticalIcon
              size={verticalScale(24)}
              color={colors.white}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        {hasMessages ? (
          <FlatList
            data={[...messages].reverse()}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted
          />
        ) : (
          <EmptyState />
        )}

        {/* Attachment Menu */}
        <AttachmentMenu
          visible={showAttachmentMenu}
          onClose={() => setShowAttachmentMenu(false)}
          onSelectImage={() => {
            // TODO: Implement image picker
            console.log("Select image");
          }}
          onSelectVideo={() => {
            // TODO: Implement video picker
            console.log("Select video");
          }}
          onSelectDocument={() => {
            // TODO: Implement document picker
            console.log("Select document");
          }}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Icons.PlusCircleIcon
              size={verticalScale(26)}
              color={colors.primary}
              weight="fill"
            />
          </TouchableOpacity>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.neutral400}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButtonInside}>
              <Icons.SmileyIcon
                size={verticalScale(22)}
                color={colors.neutral400}
              />
            </TouchableOpacity>
          </View>

          {/* Camera - only show when not typing */}
          {!message.trim() && (
            <TouchableOpacity style={styles.iconButton}>
              <Icons.CameraIcon
                size={verticalScale(24)}
                color={colors.neutral400}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.sendButton}
            onPress={message.trim() ? handleSend : undefined}
          >
            {message.trim() ? (
              <Icons.PaperPlaneTiltIcon
                size={verticalScale(20)}
                color={colors.white}
                weight="fill"
              />
            ) : (
              <Icons.MicrophoneIcon
                size={verticalScale(20)}
                color={colors.white}
                weight="fill"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MessageActionModal
        visible={showActionModal}
        message={selectedMessage}
        onClose={() => setShowActionModal(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral800,
    paddingBottom: spacingY._10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacingX._7,
  },
  headerText: {
    marginLeft: spacingX._10,
    flex: 1,
  },
  headerButton: {
    padding: spacingX._7,
  },
  messagesList: {
    paddingVertical: spacingY._10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacingX._40,
  },
  emptyIconContainer: {
    marginBottom: spacingY._20,
    opacity: 0.8,
  },
  emptySubtext: {
    textAlign: "center",
    marginTop: spacingY._7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._10,
    gap: spacingX._7,
    borderTopWidth: 1,
    borderTopColor: colors.neutral800,
  },
  iconButton: {
    width: verticalScale(40),
    height: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: colors.neutral600,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    minHeight: verticalScale(44),
    maxHeight: verticalScale(120),
  },
  textInput: {
    flex: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
    maxHeight: verticalScale(100),
  },
  emojiButtonInside: {
    padding: spacingX._5,
    marginLeft: spacingX._7,
    justifyContent: "center",
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: verticalScale(20),
    width: verticalScale(40),
    height: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
});
