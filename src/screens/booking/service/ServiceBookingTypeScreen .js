import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ScreenContainer from "../../../components/common/ScreenContainer";
import colors from "../../../constant/colors";

const ServiceBookingTypeScreen = ({ navigation, route }) => {
  // Lấy thông tin dịch vụ và giá từ route.params
  const { selectedService, servicePrice } = route?.params || {};
  console.log("Selected Service:", selectedService);
  console.log("Service Price:", servicePrice);

  const handleServiceBookingSelect = (type) => {
    switch (type) {
      case "doctor":
        navigation.navigate("BookByDoctor", {
          selectedService,
          servicePrice,
        });
        break;
      case "date":
        navigation.navigate("BookByDate", {
          selectedService,
          servicePrice,
        });
        break;
      default:
        break;
    }
  };

  const BookingOption = ({
    icon,
    title,
    description,
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
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer
      hasBottomTabs={true}
      title="Chọn hình thức đặt lịch"
      leftComponent={
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      }
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="info" size={20} color={colors.primaryBlue} />
        <Text style={styles.infoText}>
          Vui lòng chọn hình thức đặt lịch mong muốn
        </Text>
      </View>

      <View style={styles.content}>
        {/* Service Booking Options */}
        <BookingOption
          icon="👨‍⚕️"
          title="THEO BÁC SĨ"
          description="Bạn chọn bác sĩ mong muốn, đi khám vào ngày làm việc của họ"
          onPress={() => handleServiceBookingSelect("doctor")}
          iconColor={colors.primaryBlue}
        />

        <BookingOption
          icon="📅"
          title="THEO NGÀY"
          description="Bạn chọn ngày mong muốn, lựa chọn bác sĩ làm việc vào ngày đó"
          onPress={() => handleServiceBookingSelect("date")}
          iconColor={colors.primaryBlue}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  continueButton: {
    backgroundColor: "#888",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default ServiceBookingTypeScreen;
