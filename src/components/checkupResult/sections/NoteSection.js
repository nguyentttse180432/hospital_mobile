import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const NoteSection = ({ note }) => {
  if (!note) return null;

  return (
    <View style={styles.vitalSignNoteContainer}>
      <View style={styles.vitalSignNoteHeader}>
        <Icon name="document-text-outline" size={18} color="#666" />
        <Text style={styles.vitalSignNoteLabel}>Ghi chú</Text>
      </View>
      <Text style={styles.vitalSignNoteText}>{note}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  vitalSignNoteContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4299e1",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  vitalSignNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vitalSignNoteLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  vitalSignNoteText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    lineHeight: 20,
  },
});

export default NoteSection;
