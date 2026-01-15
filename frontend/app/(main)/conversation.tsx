import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Avatar from "@/components/Avatar";
import Typo from "@/components/Typo";
import BackButton from "@/components/BackButton";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";

const Conversation = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    conversationId: string;
    name: string;
    avatar?: string;
    isGroup?: string;
    participantCount?: string;
  }>();

  const isGroup = params.isGroup === "true";
  const participantCount = params.participantCount
    ? parseInt(params.participantCount)
    : 0;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton color={colors.text} />

          <TouchableOpacity style={styles.headerInfo} activeOpacity={0.7}>
            <Avatar uri={params.avatar || null} size={40} isGroup={isGroup} />
            <View style={styles.headerText}>
              <Typo
                size={16}
                fontWeight="700"
                color={colors.text}
                textProps={{ numberOfLines: 1 }}
              >
                {params.name || "Chat"}
              </Typo>
              {isGroup && participantCount > 0 && (
                <Typo size={12} color={colors.neutral500}>
                  {participantCount} members
                </Typo>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icons.PhoneIcon size={verticalScale(22)} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icons.DotsThreeVerticalIcon
                size={verticalScale(22)}
                color={colors.text}
                weight="bold"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages area - placeholder */}
        <View style={styles.messagesContainer}>
          <Typo size={14} color={colors.neutral400} style={styles.placeholder}>
            No messages yet. Start the conversation!
          </Typo>
        </View>

        {/* Input area - placeholder */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icons.PlusIcon
              size={verticalScale(24)}
              color={colors.neutral500}
            />
          </TouchableOpacity>
          <View style={styles.textInputPlaceholder}>
            <Typo size={14} color={colors.neutral400}>
              Type a message...
            </Typo>
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Icons.PaperPlaneTiltIcon
              size={verticalScale(22)}
              color={colors.white}
              weight="fill"
            />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: spacingY._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacingX._10,
  },
  headerText: {
    marginLeft: spacingX._10,
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacingX._5,
  },
  headerButton: {
    padding: spacingX._7,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    gap: spacingX._10,
  },
  attachButton: {
    padding: spacingX._7,
  },
  textInputPlaceholder: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: verticalScale(20),
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: verticalScale(20),
    padding: spacingX._10,
  },
});
