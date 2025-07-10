import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const DoneCheckup = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Get optional parameters if passed from previous screen
  const { checkupCode, patientName } = route.params || {};

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  const handleViewResults = () => {
    if (checkupCode) {
      navigation.navigate("CheckupResults", {
        checkupCode,
        patientName,
      });
    } else {
      // If no checkupCode provided, navigate to a general results screen
      navigation.navigate("CheckupResults");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.successTitle}>Khám thành công</Text>
        <Text style={styles.successMessage}>
          Cảm ơn bạn đã tin tưởng chúng tôi
        </Text>

        <Image
          source={require("../../assets/family.png")}
          style={styles.successImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.homeButton} onPress={handleViewResults}>
          <Text style={styles.homeButtonText}>Xem kết quả khám</Text>
        </TouchableOpacity>

        {/* Nút xem thuốc */}
        {checkupCode && (
          <TouchableOpacity
            style={[
              styles.homeButton,
              { backgroundColor: "#28a745", marginTop: 10 },
            ]}
            onPress={() =>
              navigation.navigate("PrescriptionScreen", { checkupCode })
            }
          >
            <Text style={[styles.homeButtonText, { color: "#fff" }]}>
              Xem thuốc
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.homeButton, styles.secondaryButton]}
          onPress={handleGoHome}
        >
          <Text style={[styles.homeButtonText, styles.secondaryButtonText]}>
            Về trang chủ
          </Text>
        </TouchableOpacity>

        {checkupCode && (
          <View style={styles.checkupInfo}>
            <Text style={styles.checkupInfoText}>
              Mã phiếu khám: {checkupCode}
            </Text>
            {patientName && (
              <Text style={styles.checkupInfoText}>
                Người khám: {patientName}
              </Text>
            )}
          </View>
        )}
      </View>
      {/* Modal xem thuốc */}
      {/* PrescriptionDetailModal đã được thay thế bằng PrescriptionScreen */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  successImage: {
    width: "80%",
    height: 250,
    marginBottom: 50,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#4CAF50",
  },
  checkupInfo: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    width: "100%",
    alignItems: "center",
  },
  checkupInfoText: {
    fontSize: 15,
    color: "#555",
    marginVertical: 3,
  },
});

export default DoneCheckup;
