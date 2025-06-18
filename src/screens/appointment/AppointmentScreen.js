import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, SafeAreaView } from "react-native";
import Header from "../../components/common/Header";
import { timeSlots } from "../../data/appointmentData";

// Import các components đã tách
import ProfileSelection from "../../components/appointment/ProfileSelection";
import AppointmentSelection from "../../components/appointment/AppointmentSelection";
import MedicalPackageSelection from "../../components/appointment/MedicalPackageSelection";
import ServiceSelection from "../../components/appointment/ServiceSelection";
import DateSelection from "../../components/appointment/DateSelection";
import TimeSelection from "../../components/appointment/TimeSelection";
import AppointmentReview from "../../components/appointment/AppointmentReview";
import PaymentScreen from "../../components/appointment/PaymentScreen";
import AppointmentConfirmation from "../../components/appointment/AppointmentConfirmation";

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
  const [currentReason, setCurrentReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
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
        reason: currentReason,
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

      setStep(2.5);
    } else if (step === 2.5) {
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
      setStep(5);
      Alert.alert("Thành Công", "Đặt lịch khám thành công!", [
        { text: "OK", onPress: () => setStep(5) },
      ]);
    }
  };
  const handleBack = () => {
    // Handle back navigation with proper step transitions
    if (
      step === 2.1 ||
      step === 2.2 ||
      step === 2.3 ||
      step === 2.4 ||
      step === 2.5
    ) {
      setStep(2); // Return to main appointment selection
    } else if (step === 4) {
      setStep(2.5); // Go back to appointment review from payment
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
    setCurrentReason("");
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Chọn Hồ Sơ Bệnh Nhân";
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
      case 2.5:
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
      {" "}
      <Header
        title={getHeaderTitle()}
        onBack={handleBack}
        progressIcons={["person", "medical", "wallet", "document"]}
        activeStep={Math.floor(step) > 4 ? 3 : Math.floor(step) - 1}
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
            currentReason={currentReason}
            setCurrentReason={setCurrentReason}
            setStep={setStep}
            canProceed={canProceed}
          />
        )}
        {step === 2.1 && (
          <MedicalPackageSelection
            currentPackage={currentPackage}
            setCurrentPackage={setCurrentPackage}
            setStep={setStep}
          />
        )}
        {step === 2.2 && (
          <ServiceSelection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            setStep={setStep}
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
        )}{" "}
        {step === 2.5 && (
          <AppointmentReview
            appointments={appointments}
            currentPackage={currentPackage}
            selectedServices={selectedServices}
            currentDate={currentDate}
            currentTime={currentTime}
            currentReason={currentReason}
            handleNext={handleNext}
            selectedProfile={selectedProfile}
          />
        )}
        {step === 4 && (
          <PaymentScreen
            appointments={appointments}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleNext={handleNext}
            handleBack={handleBack}
            canProceed={canProceed}
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
