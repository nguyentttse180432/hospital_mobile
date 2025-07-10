import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const LoadingState = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#4299e1" />
        <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        <Text style={styles.loadingSubText}>Vui lòng chờ trong giây lát</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "600",
    color: "#424242",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#757575",
  },
});

export default LoadingState;
