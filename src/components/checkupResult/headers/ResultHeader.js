import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ResultHeader = ({ title, onBack }) => {
  return (
    <View style={styles.customHeader}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={onBack}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Icon name="chevron-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Blue wave design at bottom of header */}
      <View style={styles.waveSpacer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: "#4299e1",
    flexDirection: "column",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  waveSpacer: {
    height: 15,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerBackButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
});

export default ResultHeader;
