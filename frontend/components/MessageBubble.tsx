import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import React from "react";
import { MessageProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import Avatar from "./Avatar";
import * as Icons from "phosphor-react-native";

interface MessageBubbleProps {
  message: MessageProps;
  isGroup?: boolean;
  showAvatar?: boolean;
  onLongPress?: (message: MessageProps) => void;
  isEditing?: boolean;
  editText?: string;
  onChangeEditText?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

export default function MessageBubble({
  message,
  isGroup = false,
  showAvatar = true,
  onLongPress,
  isEditing = false,
  editText = "",
  onChangeEditText,
  onSaveEdit,
  onCancelEdit,
}: MessageBubbleProps) {
  const isMe = message.isMe;
  const isSystem = message.type === "system";

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // System message (centered, no bubble)
  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Typo size={12} color={colors.neutral400}>
            {message.content}
          </Typo>
        </View>
      </View>
    );
  }

  // Render message content based on type
  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <TouchableOpacity activeOpacity={0.9}>
            <Image
              source={{ uri: message.attachment || "" }}
              style={styles.imageContent}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );

      case "video":
        return (
          <TouchableOpacity activeOpacity={0.9} style={styles.videoContainer}>
            <Image
              source={{
                uri:
                  message.attachmentMetadata?.thumbnail ||
                  message.attachment ||
                  "",
              }}
              style={styles.imageContent}
              resizeMode="cover"
            />
            <View style={styles.playButton}>
              <Icons.PlayIcon
                size={verticalScale(24)}
                color={colors.white}
                weight="fill"
              />
            </View>
          </TouchableOpacity>
        );

      case "audio":
        return (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              style={[styles.audioPlayButton, isMe && styles.audioPlayButtonMe]}
            >
              <Icons.PlayIcon
                size={verticalScale(18)}
                color={isMe ? colors.primary : colors.neutral800}
                weight="fill"
              />
            </TouchableOpacity>
            <View style={styles.audioWaveform}>
              {/* Simulated waveform bars */}
              {[...Array(18)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: verticalScale(5 + Math.random() * 14),
                      backgroundColor: isMe
                        ? colors.primary
                        : colors.neutral700,
                    },
                  ]}
                />
              ))}
            </View>
            <Typo
              size={11}
              color={isMe ? colors.neutral600 : colors.neutral500}
              style={styles.audioDuration}
            >
              {message.attachmentMetadata?.duration
                ? `${Math.floor(message.attachmentMetadata.duration / 60)}:${String(
                    message.attachmentMetadata.duration % 60
                  ).padStart(2, "0")}`
                : "0:00"}
            </Typo>
          </View>
        );

      case "file":
        return (
          <TouchableOpacity style={styles.fileContainer} activeOpacity={0.7}>
            <Icons.FileIcon
              size={verticalScale(28)}
              color={isMe ? colors.primary : colors.neutral700}
            />
            <View style={styles.fileInfo}>
              <Typo
                size={13}
                fontWeight="600"
                color={colors.neutral800}
                textProps={{ numberOfLines: 1 }}
              >
                {message.attachmentMetadata?.fileName || "File"}
              </Typo>
              <Typo size={11} color={colors.neutral500}>
                {message.attachmentMetadata?.fileSize
                  ? `${(message.attachmentMetadata.fileSize / 1024).toFixed(1)} KB`
                  : ""}
              </Typo>
            </View>
          </TouchableOpacity>
        );

      default: // text
        if (isEditing && isMe) {
          return (
            <View style={styles.editingContainer}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={onChangeEditText}
                multiline
                autoFocus
                placeholder="Edit message..."
                placeholderTextColor={colors.neutral400}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  onPress={onCancelEdit}
                  style={styles.cancelBtn}
                >
                  <Icons.XIcon
                    size={verticalScale(18)}
                    color={colors.neutral400}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSaveEdit} style={styles.saveBtn}>
                  <Icons.CheckIcon
                    size={verticalScale(18)}
                    color={colors.white}
                    weight="bold"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }
        return (
          <Typo
            size={14}
            color={isMe ? colors.neutral800 : colors.white}
            style={styles.textContent}
          >
            {message.content}
          </Typo>
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.containerRight : styles.containerLeft,
      ]}
    >
      {/* Avatar for group (left side, only for others) */}
      {isGroup && !isMe && showAvatar && (
        <Avatar uri={message.sender.avatar} size={36} />
      )}

      {/* Message bubble */}
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={500}
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          message.type === "image" || message.type === "video"
            ? styles.mediaBubble
            : null,
        ]}
      >
        {/* Sender name inside bubble for group chats (for others only) */}
        {isGroup && !isMe && (
          <Typo
            size={12}
            fontWeight="600"
            color={colors.primary}
            style={styles.senderName}
          >
            {message.sender.name}
          </Typo>
        )}

        {/* "You" label for sender in group */}
        {isGroup && isMe && (
          <Typo
            size={12}
            fontWeight="600"
            color={colors.primaryDark}
            style={styles.senderName}
          >
            You
          </Typo>
        )}

        {renderContent()}

        {/* Time and status */}
        <View style={styles.metadata}>
          <Typo size={10} color={colors.neutral500}>
            {formatTime(message.createdAt)}
          </Typo>
          {isMe && (
            <View style={styles.status}>
              {message.isRead ? (
                <Icons.ChecksIcon
                  size={verticalScale(14)}
                  color={colors.primary}
                  weight="bold"
                />
              ) : (
                <Icons.CheckIcon
                  size={verticalScale(14)}
                  color={colors.neutral500}
                  weight="bold"
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Avatar for sender on right side */}
      {isMe && isGroup && showAvatar && (
        <Avatar uri={message.sender.avatar} size={36} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: spacingY._7,
    paddingHorizontal: spacingX._15,
    gap: spacingX._10,
    alignItems: "flex-end",
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  containerRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "72%",
    borderRadius: radius._15,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    minWidth: scale(80),
  },
  bubbleMe: {
    backgroundColor: colors.myBubble,
    borderBottomRightRadius: radius._6,
  },
  bubbleOther: {
    backgroundColor: colors.neutral700,
    borderBottomLeftRadius: radius._6,
  },
  mediaBubble: {
    padding: spacingX._5,
    overflow: "hidden",
  },
  senderName: {
    marginBottom: spacingY._5,
  },
  textContent: {
    lineHeight: verticalScale(20),
  },
  imageContent: {
    width: scale(180),
    height: verticalScale(140),
    borderRadius: radius._10,
  },
  videoContainer: {
    position: "relative",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -18 }, { translateY: -18 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 36,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    minWidth: scale(160),
  },
  audioPlayButton: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: verticalScale(16),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  audioPlayButtonMe: {
    backgroundColor: colors.white,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: verticalScale(22),
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  audioDuration: {
    minWidth: scale(32),
    textAlign: "right",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    minWidth: scale(140),
  },
  fileInfo: {
    flex: 1,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacingY._5,
    gap: spacingX._3,
  },
  status: {
    marginLeft: spacingX._3,
  },
  // System message
  systemContainer: {
    alignItems: "center",
    marginVertical: spacingY._15,
    paddingHorizontal: spacingX._20,
  },
  systemBubble: {
    backgroundColor: colors.neutral200,
    borderRadius: radius._15,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
  },
  // Inline editing styles
  editingContainer: {
    width: "100%",
  },
  editInput: {
    color: colors.neutral800,
    fontSize: verticalScale(14),
    padding: 0,
    minHeight: verticalScale(20),
    maxHeight: verticalScale(100),
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacingY._7,
    gap: spacingX._7,
  },
  cancelBtn: {
    padding: spacingX._5,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: spacingX._5,
    borderRadius: radius._6,
  },
});
