import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ScreenContainer from "../../components/common/ScreenContainer";
import colors from "../../constant/colors";

const MainBookingTypeScreen = ({ navigation }) => {
  const handleBookingTypeSelect = (type) => {
    if (type === "package") {
      navigation.navigate("BookAppointmentScreen");
    } else if (type === "service") {
      navigation.navigate("GeneralServiceBookingTypeScreen");
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
      title="Chọn hình thức đặt lịch"
      onBack={() => navigation.goBack()}
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="info" size={20} color={colors.primaryBlue} />
        <Text style={styles.infoText}>
          Vui lòng chọn hình thức đặt lịch mong muốn
        </Text>
      </View>

      <View style={styles.content}>
        {/* Booking Options */}
        <BookingOption
          icon="❤️"
          title="ĐẶT KHÁM THEO GÓI KHÁM"
          description="Bạn chọn gói khám sức khỏe phù hợp với nhu cầu của mình"
          onPress={() => handleBookingTypeSelect("package")}
          iconColor={colors.orange}
        />

        <BookingOption
          icon="🏥"
          title="ĐẶT KHÁM THEO DỊCH VỤ"
          description="Bạn chọn dịch vụ y tế cụ thể mà bạn cần sử dụng"
          onPress={() => handleBookingTypeSelect("service")}
          iconColor={colors.primaryBlue}
        />
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
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

export default MainBookingTypeScreen;
