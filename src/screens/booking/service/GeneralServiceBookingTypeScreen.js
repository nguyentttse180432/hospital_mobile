import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ScreenContainer from "../../../components/common/ScreenContainer";
import colors from "../../../constant/colors";
import { getCommonServices } from "../../../services/serviceService";

const GeneralServiceBookingTypeScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const response = await getCommonServices();
      if (response.isSuccess === false) {
        setError(response.error.message);
      } else {
        setServices(response);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleServiceSelect = (service) => {
    // Chuyển sang ServiceBookingTypeScreen, truyền thông tin dịch vụ
    navigation.navigate("ServiceBookingTypeScreen", {
      selectedService: service,
      servicePrice: service.price,
    });
  };

  const BookingOption = ({
    icon,
    title,
    description,
    price,
    onPress,
    iconColor = colors.primaryBlue,
  }) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={styles.optionContent}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}
        >
          <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
        </View>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
        <Text style={styles.priceText}>
          {price ? `${price.toLocaleString("vi-VN")} VNĐ` : "Miễn phí"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer
      title="Chọn loại dịch vụ khám"
      onBack={() => navigation.goBack()}
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="info" size={20} color={colors.primaryBlue} />
        <Text style={styles.infoText}>
          Vui lòng chọn loại dịch vụ khám mong muốn
        </Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color={colors.errorRed} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Service Options */}
          {services.map((service) => (
            <BookingOption
              key={service.serviceId}
              icon={service.name === "Khám VIP" ? "⭐" : "🩺"}
              title={service.name.toUpperCase()}
              description={service.description}
              price={service.price}
              onPress={() => handleServiceSelect(service)}
              iconColor={
                service.name === "Khám VIP" ? colors.gold : colors.primaryBlue
              }
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  infoBanner: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionContent: {
    padding: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryBlue,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.errorRed,
    textAlign: "center",
    marginTop: 8,
  },
});

export default GeneralServiceBookingTypeScreen;
