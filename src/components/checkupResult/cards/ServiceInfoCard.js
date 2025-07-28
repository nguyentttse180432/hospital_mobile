import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "../../common/Card";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../../../constant/colors"; // Import colors from your constants

const ServiceInfoCard = ({ serviceResult }) => {
  return (
    <Card style={styles.serviceInfoCard}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Icon name="document-text-outline" size={24} color={colors.primaryBlue} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.serviceTitle}>{serviceResult.serviceName}</Text>
          <Text style={styles.serviceCode}>
            Mã dịch vụ: {serviceResult.serviceCode?.trim()}
          </Text>
        </View>
      </View>

      {serviceResult.serviceNote && (
        <View style={styles.infoRow}>
          <Icon
            name="information-circle-outline"
            size={18}
            color="#666"
            style={styles.rowIcon}
          />
          <Text style={styles.serviceNote}>{serviceResult.serviceNote}</Text>
        </View>
      )}

      {serviceResult.resultDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Mô tả kết quả:</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {serviceResult.resultDescription}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  serviceInfoCard: {
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(66, 153, 225, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  rowIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  serviceCode: {
    fontSize: 14,
    color: "#666",
  },
  serviceNote: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 16,
    paddingTop: 12,
  },
  descriptionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  descriptionBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryBlue,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
});

export default ServiceInfoCard;
