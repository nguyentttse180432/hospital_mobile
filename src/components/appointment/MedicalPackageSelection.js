import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { getMedicalPackages } from "../../services/medicalPackageService";
import Icon from "react-native-vector-icons/Ionicons";

const MedicalPackageSelection = ({
  currentPackage,
  setCurrentPackage,
  setStep,
}) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicalPackages();
  }, []);

  const fetchMedicalPackages = async () => {
    try {
      setLoading(true);
      const data = await getMedicalPackages();
      setPackages(data); // Ensure we handle the data structure correctly
      setError(null);
    } catch (err) {
      setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSelectPackage = (pkg) => {
    setCurrentPackage(pkg);
    setStep(2); // Return to main appointment selection screen instead of going directly to date selection
  };

  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        currentPackage?.id === item.id && styles.selectedPackageItem,
      ]}
      onPress={() => handleSelectPackage(item)}
    >
      <View style={styles.packageImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.packageImage} />
        ) : (
          <View style={styles.packageImagePlaceholder}>
            <Icon name="medkit" size={30} color="#0071CE" />
          </View>
        )}
      </View>
      <View style={styles.packageDetails}>
        <Text style={styles.packageName}>{item.name}</Text>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.packagePrice}>
          {item.price.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
      {currentPackage?.id === item.id && (
        <View style={styles.checkmark}>
          <Icon name="checkmark-circle" size={24} color="#0071CE" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0071CE" />
        <Text style={styles.loadingText}>Đang tải gói khám...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" size={40} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMedicalPackages}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Gói Khám</Text>
      <Text style={styles.subtitle}>
        Chọn một gói khám phù hợp với nhu cầu của bạn
      </Text>
      <FlatList
        data={packages}
        renderItem={renderPackageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.packagesList}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => setStep(2)} // Return to main appointment screen
      >
        <Text style={styles.skipButtonText}>
          Bỏ qua, tôi muốn chọn dịch vụ riêng lẻ
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  packagesList: {
    paddingBottom: 16,
  },
  packageItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedPackageItem: {
    borderWidth: 2,
    borderColor: "#0071CE",
  },
  packageImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 16,
  },
  packageImage: {
    width: "100%",
    height: "100%",
  },
  packageImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f0f9",
    justifyContent: "center",
    alignItems: "center",
  },
  packageDetails: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0071CE",
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0071CE",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  skipButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#0071CE",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default MedicalPackageSelection;
