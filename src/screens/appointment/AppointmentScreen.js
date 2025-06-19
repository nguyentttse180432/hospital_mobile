import { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/common/Header";
import { timeSlots } from "../../data/appointmentData";
import {
  createAppointment,
  formatAppointmentData,
} from "../../services/appointmentService";

// Import các components đã tách
import ProfileSelection from "../../components/appointment/step1/ProfileSelection";
import AppointmentSelection from "../../components/appointment/step2/AppointmentSelection";
import MedicalPackageSelection from "../../components/appointment/step2/MedicalPackageSelection";
import ServiceSelection from "../../components/appointment/step2/ServiceSelection";
import DateSelection from "../../components/appointment/step2/DateSelection";
import TimeSelection from "../../components/appointment/step2/TimeSelection";
import AppointmentReview from "../../components/appointment/step3/AppointmentReview";
import PaymentScreen from "../../components/appointment/step4/PaymentScreen";
import AppointmentConfirmation from "../../components/appointment/step5/AppointmentConfirmation";

const AppointmentScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({
    fullName: "",
    gender: "",
    phone: "",
    address: "",
    bhyt: "",
    email: "",
    idNumber: "",
    dob: "",
  });
  const [appointments, setAppointments] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính tổng tiền thanh toán
  const calculateTotalAmount = () => {
    let total = 0;

    // Tính giá của gói khám
    if (currentPackage) {
      total += currentPackage.price || 0;
    }

    // Tính giá của các dịch vụ
    if (selectedServices && selectedServices.length > 0) {
      total += selectedServices.reduce(
        (sum, service) => sum + (service.price || 0),
        0
      );
    }

    return total;
  };

  // Format the date and time for the API
  const formatDateTimeForApi = () => {
    if (!currentDate || !currentTime) return null;

    try {
      // Parse the date (DD/MM/YYYY) and time
      const [day, month, year] = currentDate.split("/");
      const [startTime] = currentTime.time.split(" - ");
      const [hours, minutes] = startTime.split(":");

      // Create Date object
      const appointmentDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed in JavaScript
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      return appointmentDate;
    } catch (error) {
      console.error("Date/time parsing error:", error);
      return null;
    }
  };

  // Submit appointment to API
  const submitAppointment = async () => {
    if (
      !selectedProfile ||
      (!currentPackage && selectedServices.length === 0)
    ) {
      return Alert.alert("Lỗi", "Thông tin lịch khám không đầy đủ");
    }

    setIsSubmitting(true);

    try {
      // Format the appointment datetime
      const appointmentDateTime = formatDateTimeForApi();
      if (!appointmentDateTime) {
        throw new Error("Invalid date or time format");
      }

      // Format appointment data for API
      const appointmentData = formatAppointmentData(
        selectedProfile.id,
        appointmentDateTime,
        currentPackage,
        selectedServices
      );

      // Send to API
      await createAppointment(appointmentData);

      // Show success message and go to confirmation step
      Alert.alert("Thành Công", "Đặt lịch khám thành công!", [
        { text: "OK", onPress: () => setStep(5) },
      ]);
    } catch (error) {
      console.error("Appointment creation error:", error);
      Alert.alert(
        "Lỗi",
        "Không thể đặt lịch khám. Vui lòng thử lại sau." +
          (error.response?.data?.message
            ? `\n\nLỗi: ${error.response.data.message}`
            : "")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveCurrentAppointment = () => {
    if (
      (currentPackage || selectedServices.length > 0) &&
      currentDate &&
      currentTime
    ) {
      const newAppointment = {
        package: currentPackage,
        services: selectedServices,
        date: currentDate,
        time: currentTime,
      };
      // Thay thế mảng appointments bằng một phần tử duy nhất
      setAppointments([newAppointment]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Kiểm tra xem đã chọn profile có sẵn hoặc đã điền đủ thông tin profile mới
      const hasValidNewProfile =
        newProfile.fullName.trim() &&
        newProfile.gender.trim() &&
        newProfile.phone.trim() &&
        newProfile.dob.trim();

      if (!selectedProfile && !hasValidNewProfile) {
        return Alert.alert(
          "Lỗi",
          "Vui lòng chọn hồ sơ có sẵn hoặc điền đầy đủ thông tin hồ sơ mới."
        );
      }

      // Nếu có profile mới được điền, sử dụng nó
      if (hasValidNewProfile && !selectedProfile) {
        setSelectedProfile(newProfile);
      }

      setStep(2);
    } else if (step === 2) {
      // Kiểm tra đã chọn gói khám hoặc ít nhất một dịch vụ
      if (!currentPackage && selectedServices.length === 0) {
        return Alert.alert(
          "Lỗi",
          "Vui lòng chọn gói khám hoặc ít nhất một dịch vụ."
        );
      }

      if (!currentDate) {
        return Alert.alert("Lỗi", "Vui lòng chọn ngày khám.");
      }

      if (!currentTime) {
        return Alert.alert("Lỗi", "Vui lòng chọn giờ khám.");
      }
      setStep(3);
    } else if (step === 3) {
      // Save the current appointment and move directly to payment step
      if (
        (!currentPackage && selectedServices.length === 0) ||
        !currentDate ||
        !currentTime
      ) {
        return Alert.alert("Lỗi", "Thông tin lịch khám chưa hoàn chỉnh.");
      }
      saveCurrentAppointment();
      setStep(4);
    } else if (step === 4) {
      if (!paymentMethod)
        return Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");

      // Submit appointment to API
      submitAppointment();
    }
  };
  const handleBack = () => {
    // Handle back navigation with proper step transitions
    if (
      step === 2.1 ||
      step === 2.2 ||
      step === 2.3 ||
      step === 2.4 ||
      step === 3
    ) {
      setStep(2); // Return to main appointment selection
    } else if (step === 4) {
      setStep(3); // Go back to appointment review from payment
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = () => {
    if (step === 1) {
      // Có thể tiếp tục nếu đã chọn profile có sẵn hoặc đã điền đủ thông tin profile mới
      const hasValidNewProfile =
        newProfile.fullName.trim() &&
        newProfile.gender.trim() &&
        newProfile.phone.trim() &&
        newProfile.dob.trim();

      return selectedProfile || hasValidNewProfile;
    }
    if (step === 2) {
      return (
        (currentPackage || selectedServices.length > 0) &&
        currentDate &&
        currentTime
      );
    }
    if (step === 4) {
      return paymentMethod;
    }
    return true;
  };

  const resetAppointment = () => {
    setStep(1);
    setSelectedProfile(null);
    setNewProfile({
      fullName: "",
      gender: "",
      phone: "",
      address: "",
      bhyt: "",
      email: "",
      idNumber: "",
      dob: "",
    });
    setAppointments([]);
    setCurrentPackage(null);
    setSelectedServices([]);
    setCurrentDate(null);
    setCurrentTime(null);
  };
  const getActiveStep = () => {
    // Map the step values to the correct icon index (0-4)
    if (step === 1) return 0; // Hồ sơ khách hàng (Person)
    if (
      step === 2 ||
      step === 2.1 ||
      step === 2.2 ||
      step === 2.3 ||
      step === 2.4
    )
      return 1; // Thông tin khám (Medical)
    if (step === 3) return 2; // Xác nhận thông tin (Clipboard)
    if (step === 4) return 3; // Thanh toán (Wallet)
    if (step === 5) return 4; // Phiếu khám bệnh (Document)
    return 0; // Mặc định là bước đầu tiên
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Chọn Hồ Sơ Khách Hàng";
      case 2:
        return "Chọn Thông Tin Khám";
      case 2.1:
        return "Chọn Gói Khám";
      case 2.2:
        return "Chọn Dịch Vụ";
      case 2.3:
        return "Chọn Ngày Khám";
      case 2.4:
        return "Chọn Giờ Khám";
      case 3:
        return "Xác Nhận Thông Tin";
      case 4:
        return "Thanh Toán";
      case 5:
        return "Phiếu Khám Bệnh";
      default:
        return "Đặt Lịch Khám";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={getHeaderTitle()}
        onBack={handleBack}
        progressIcons={["person", "medical", "clipboard", "wallet", "document"]}
        activeStep={getActiveStep()}
      />
      <View style={styles.content}>
        {step === 1 && (
          <ProfileSelection
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
            newProfile={newProfile}
            setNewProfile={setNewProfile}
            canProceed={canProceed}
            handleNext={handleNext}
          />
        )}
        {step === 2 && (
          <AppointmentSelection
            currentPackage={currentPackage}
            selectedServices={selectedServices}
            currentDate={currentDate}
            currentTime={currentTime}
            setStep={setStep}
            canProceed={canProceed}
          />
        )}
        {step === 2.1 && (
          <MedicalPackageSelection
            currentPackage={currentPackage}
            setCurrentPackage={setCurrentPackage}
            setStep={setStep}
            selectedProfile={selectedProfile}
          />
        )}
        {step === 2.2 && (
          <ServiceSelection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            setStep={setStep}
            currentPackage={currentPackage}
          />
        )}
        {step === 2.3 && (
          <DateSelection
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            setCurrentTime={setCurrentTime}
            setStep={setStep}
          />
        )}
        {step === 2.4 && (
          <TimeSelection
            currentDate={currentDate}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            setStep={setStep}
            timeSlots={timeSlots}
          />
        )}
        {step === 3 && (
          <AppointmentReview
            appointments={appointments}
            currentPackage={currentPackage}
            selectedServices={selectedServices}
            currentDate={currentDate}
            currentTime={currentTime}
            handleNext={handleNext}
            selectedProfile={selectedProfile}
          />
        )}{" "}
        {step === 4 && (
          <PaymentScreen
            appointments={appointments}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleNext={handleNext}
            handleBack={handleBack}
            canProceed={canProceed}
            totalAmount={calculateTotalAmount()}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 5 && (
          <AppointmentConfirmation
            appointments={appointments}
            patientProfile={selectedProfile}
            navigation={navigation}
            resetAppointment={resetAppointment}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  content: {
    flex: 1,
  },
});

export default AppointmentScreen;
