import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
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
  showAvatar?: boolean; // For group chats, show avatar for other users
}

export default function MessageBubble({
  message,
  isGroup = false,
  showAvatar = true,
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
          <Typo size={12} color={colors.neutral500} style={styles.systemText}>
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
            <TouchableOpacity style={styles.audioPlayButton}>
              <Icons.PlayIcon
                size={verticalScale(20)}
                color={isMe ? colors.white : colors.primary}
                weight="fill"
              />
            </TouchableOpacity>
            <View style={styles.audioWaveform}>
              {/* Simulated waveform bars */}
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: verticalScale(4 + Math.random() * 16),
                      backgroundColor: isMe ? colors.white : colors.primary,
                      opacity: 0.6 + Math.random() * 0.4,
                    },
                  ]}
                />
              ))}
            </View>
            <Typo
              size={11}
              color={isMe ? colors.white : colors.neutral500}
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
              size={verticalScale(32)}
              color={isMe ? colors.white : colors.primary}
            />
            <View style={styles.fileInfo}>
              <Typo
                size={13}
                fontWeight="600"
                color={isMe ? colors.white : colors.text}
                textProps={{ numberOfLines: 1 }}
              >
                {message.attachmentMetadata?.fileName || "File"}
              </Typo>
              <Typo
                size={11}
                color={isMe ? "rgba(255,255,255,0.7)" : colors.neutral500}
              >
                {message.attachmentMetadata?.fileSize
                  ? `${(message.attachmentMetadata.fileSize / 1024).toFixed(1)} KB`
                  : ""}
              </Typo>
            </View>
          </TouchableOpacity>
        );

      default: // text
        return (
          <Typo
            size={14}
            color={isMe ? colors.white : colors.text}
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
        <Avatar uri={message.sender.avatar} size={32} />
      )}

      <View style={styles.bubbleWrapper}>
        {/* Sender name for group chats */}
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

        {/* Message bubble */}
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            message.type === "image" || message.type === "video"
              ? styles.mediaBubble
              : null,
          ]}
        >
          {renderContent()}

          {/* Time and status */}
          <View style={styles.metadata}>
            <Typo
              size={10}
              color={isMe ? "rgba(255,255,255,0.7)" : colors.neutral400}
            >
              {formatTime(message.createdAt)}
            </Typo>
            {isMe && (
              <View style={styles.status}>
                {message.isRead ? (
                  <Icons.ChecksIcon
                    size={verticalScale(14)}
                    color="rgba(255,255,255,0.8)"
                    weight="bold"
                  />
                ) : (
                  <Icons.CheckIcon
                    size={verticalScale(14)}
                    color="rgba(255,255,255,0.7)"
                    weight="bold"
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: spacingY._3,
    paddingHorizontal: spacingX._15,
    gap: spacingX._7,
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  containerRight: {
    justifyContent: "flex-end",
  },
  bubbleWrapper: {
    maxWidth: "75%",
  },
  senderName: {
    marginBottom: spacingY._3,
    marginLeft: spacingX._10,
  },
  bubble: {
    borderRadius: radius._15,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    minWidth: scale(60),
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius._5,
  },
  bubbleOther: {
    backgroundColor: colors.neutral100,
    borderBottomLeftRadius: radius._5,
  },
  mediaBubble: {
    padding: spacingX._3,
    overflow: "hidden",
  },
  textContent: {
    lineHeight: verticalScale(20),
  },
  imageContent: {
    width: scale(200),
    height: verticalScale(150),
    borderRadius: radius._12,
  },
  videoContainer: {
    position: "relative",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    minWidth: scale(180),
  },
  audioPlayButton: {
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: verticalScale(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  audioWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: verticalScale(24),
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  audioDuration: {
    minWidth: scale(35),
    textAlign: "right",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    minWidth: scale(150),
  },
  fileInfo: {
    flex: 1,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacingY._3,
    gap: spacingX._3,
  },
  status: {
    marginLeft: spacingX._3,
  },
  // System message
  systemContainer: {
    alignItems: "center",
    marginVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
  },
  systemBubble: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
  },
  systemText: {
    textAlign: "center",
  },
});
