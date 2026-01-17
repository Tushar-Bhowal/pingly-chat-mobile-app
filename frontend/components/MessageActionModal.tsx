import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MessageProps } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale, scale } from "@/utils/styling";
import Typo from "./Typo";
import * as Icons from "phosphor-react-native";
import * as Clipboard from "expo-clipboard";

interface MessageActionModalProps {
  visible: boolean;
  message: MessageProps | null;
  onClose: () => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const REACTIONS = ["🔥", "🙌", "😭", "🙈", "🙏", "😤"];

export default function MessageActionModal({
  visible,
  message,
  onClose,
  onEdit,
  onDelete,
  onReact,
}: MessageActionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Reset state when message changes or modal opens
  useEffect(() => {
    if (message) {
      setEditText(message.content);
    }
    setIsEditing(false);
  }, [message, visible]);

  if (!message) return null;

  const handleCopy = async () => {
    if (message.content) {
      await Clipboard.setStringAsync(message.content);
    }
    onClose();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
    onClose();
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(message.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Message preview OR Edit input */}
          <View style={styles.messagePreview}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                placeholder="Edit message..."
                placeholderTextColor={colors.neutral400}
              />
            ) : (
              <Typo
                size={14}
                color={colors.white}
                textProps={{ numberOfLines: 4 }}
              >
                {message.content || "No content"}
              </Typo>
            )}
          </View>

          {/* Edit mode buttons */}
          {isEditing ? (
            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Typo size={14} color={colors.neutral400}>
                  Cancel
                </Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Typo size={14} fontWeight="600" color={colors.white}>
                  Save
                </Typo>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Emoji reactions */}
              <View style={styles.reactionsContainer}>
                <Typo
                  size={13}
                  fontWeight="600"
                  color={colors.neutral400}
                  style={styles.reactLabel}
                >
                  React
                </Typo>
                <View style={styles.reactionsRow}>
                  {REACTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionButton}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Typo size={24}>{emoji}</Typo>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCopy}
                >
                  <Typo size={15} color={colors.white}>
                    Copy
                  </Typo>
                  <Icons.CopyIcon
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                </TouchableOpacity>

                {message.isMe && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEditClick}
                  >
                    <Typo size={15} color={colors.white}>
                      Edit
                    </Typo>
                    <Icons.PencilSimpleIcon
                      size={verticalScale(20)}
                      color={colors.neutral400}
                    />
                  </TouchableOpacity>
                )}

                {message.isMe && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDelete}
                  >
                    <Typo size={15} color={colors.rose}>
                      Delete
                    </Typo>
                    <Icons.TrashIcon
                      size={verticalScale(20)}
                      color={colors.rose}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._30,
    paddingTop: spacingY._10,
  },
  handleBar: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: colors.neutral600,
    borderRadius: radius._3,
    alignSelf: "center",
    marginBottom: spacingY._15,
  },
  messagePreview: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._20,
    minHeight: verticalScale(50),
  },
  editInput: {
    color: colors.white,
    fontSize: verticalScale(14),
    padding: 0,
    minHeight: verticalScale(30),
    maxHeight: verticalScale(120),
  },
  editActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacingX._10,
    marginBottom: spacingY._10,
  },
  cancelButton: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._25,
    borderRadius: radius._8,
  },
  reactionsContainer: {
    marginBottom: spacingY._20,
  },
  reactLabel: {
    marginBottom: spacingY._10,
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reactionButton: {
    width: verticalScale(44),
    height: verticalScale(44),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
  },
  actionsContainer: {
    gap: spacingY._5,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacingY._15,
    paddingHorizontal: spacingX._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
  },
});
