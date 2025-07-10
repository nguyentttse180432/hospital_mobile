import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const EmptyResultState = () => {
  return (
    <View style={styles.emptyResultContainer}>
      <View style={styles.iconContainer}>
        <Icon name="document-text-outline" size={40} color="#c5cae9" />
      </View>
      <Text style={styles.emptyResultText}>Chưa có kết quả chi tiết</Text>
      <Text style={styles.emptyResultSubtext}>
        Kết quả sẽ được cập nhật sau khi hoàn thành
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyResultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginVertical: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyResultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginTop: 12,
    textAlign: "center",
  },
  emptyResultSubtext: {
    fontSize: 14,
    color: "#757575",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default EmptyResultState;
