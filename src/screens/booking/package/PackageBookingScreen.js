import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Header from "../../../components/common/Header";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { timeSlots } from "../../../data/appointmentData";
import {
  createAppointment,
  formatAppointmentData,
  getAppointmentByCode,
} from "../../../services/appointmentService";

import ProfileSelection from "../../../components/appointment/step1/ProfileSelection";
import AppointmentSelection from "../../../components/appointment/step2/AppointmentSelection";
import MedicalPackageSelection from "../../../components/appointment/step2/MedicalPackageSelection";
import ServiceSelection from "../../../components/appointment/step2/ServiceSelection";
import DateSelection from "../../../components/appointment/step2/DateSelection";
import TimeSelection from "../../../components/appointment/step2/TimeSelection";
import AppointmentReview from "../../../components/appointment/step3/AppointmentReview";
import PaymentScreen from "../../../components/appointment/step4/PaymentScreen";
import AppointmentConfirmation from "../../../components/appointment/step5/AppointmentConfirmation";

const PackageBookingScreen = ({ navigation, route }) => {
  const {
    selectedProfile: initialProfile,
    currentPackage: initialPackage,
    initialStep,
  } = route.params || {};

  const [step, setStep] = useState(initialStep || 1);
  const [selectedProfile, setSelectedProfile] = useState(
    initialProfile || null
  );
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
  const [appointment, setAppointment] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(initialPackage || null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentCode, setAppointmentCode] = useState(null);
  const [appointmentQueue, setAppointmentQueue] = useState(null);
  const [appointmentQueueUrl, setAppointmentQueueUrl] = useState(null);

  // Initialize step based on pre-selected profile and package
  useEffect(() => {
    if (initialProfile && initialPackage && initialStep === 2.2) {
      setStep(2.2); // Skip to Service Selection
      setSelectedProfile(initialProfile);
      setCurrentPackage(initialPackage);
    }
  }, [initialProfile, initialPackage, initialStep]);

  const calculateTotalAmount = () => {
    let total = 0;
    if (currentPackage) {
      total += currentPackage.price || 0;
    }
    if (selectedServices && selectedServices.length > 0) {
      total += selectedServices.reduce(
        (sum, service) => sum + (service.price || 0),
        0
      );
    }
    return total;
  };

  const handlePayment = async () => {
    if (
      !selectedProfile ||
      (!currentPackage && selectedServices.length === 0)
    ) {
      return Alert.alert("Lỗi", "Thông tin lịch khám không đầy đủ");
    }
    if (!currentDate) {
      return Alert.alert("Lỗi", "Vui lòng chọn ngày khám.");
    }
    if (!currentTime) {
      return Alert.alert("Lỗi", "Vui lòng chọn giờ khám.");
    }
    if (!paymentMethod) {
      return Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
    }

    setIsSubmitting(true);
    try {
      const [day, month, year] = currentDate.split("/");
      const [startTime] = currentTime.time.split(" - ");
      const [hours, minutes] = startTime.split(":");
      const appointmentDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const appointmentData = formatAppointmentData(
        selectedProfile.id,
        appointmentDate,
        currentPackage,
        selectedServices
      );

      const response = await createAppointment(appointmentData);
      let code = null;

      if (
        response &&
        response.isSuccess &&
        response.value &&
        response.value.code
      ) {
        code = response.value.code;
      } else if (
        response &&
        response.data &&
        response.data.value &&
        response.data.value.code
      ) {
        code = response.data.value.code;
      }

      if (!code) {
        throw new Error("Không thể lấy mã appointment từ server");
      }

      console.log("Fetching appointment details with code:", code);
      const appointmentDetails = await getAppointmentByCode(code);

      const createResponseData = response.isSuccess
        ? response.value
        : response.data.value;
      setAppointmentCode(code);
      setAppointmentQueue(createResponseData.numericalOrder);
      setAppointmentQueueUrl(createResponseData.queueUrl);

      if (
        appointmentDetails &&
        appointmentDetails.isSuccess &&
        appointmentDetails.value
      ) {
        setAppointment(appointmentDetails.value);
        console.log("Appointment details loaded:", appointmentDetails.value);
      } else {
        console.warn(
          "getAppointmentByCode failed, using createAppointment response"
        );
        setAppointment(createResponseData);
      }

      if (paymentMethod === "Cash") {
        setStep(5);
        return code;
      }

      if (paymentMethod === "VNPay") {
        return code;
      }
    } catch (error) {
      console.error("Appointment creation error:", error);
      if (
        error.response?.data?.detail ===
        "This patient had enough booking in one day."
      ) {
        Alert.alert(
          "Không thể đặt lịch",
          "Bạn đã đặt lịch khám trong ngày này rồi. Mỗi người chỉ được đặt một lịch khám trong một ngày."
        );
      } else if (error.message === "Không thể lấy mã appointment từ server") {
        Alert.alert(
          "Lỗi",
          "Tạo lịch khám thành công nhưng không thể lấy mã xác nhận. Vui lòng kiểm tra lại trong lịch sử đặt khám."
        );
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể đặt lịch khám. Vui lòng thử lại sau." +
            (error.response?.data?.message || error.response?.data?.detail
              ? `\n\nLỗi: ${
                  error.response.data.message || error.response.data.detail
                }`
              : "")
        );
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
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

      if (hasValidNewProfile && !selectedProfile) {
        setSelectedProfile(newProfile);
      }

      setStep(currentPackage ? 2.2 : 2); // Skip to Service Selection if package is pre-selected
    } else if (step === 2) {
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
    } else if (step === 2.1) {
      if (!currentPackage) {
        return Alert.alert("Lỗi", "Vui lòng chọn gói khám.");
      }
      setStep(2.2);
    } else if (step === 2.2) {
      setStep(2.3);
    } else if (step === 2.3) {
      if (!currentDate) {
        return Alert.alert("Lỗi", "Vui lòng chọn ngày khám.");
      }
      setStep(2.4);
    } else if (step === 2.4) {
      if (!currentTime) {
        return Alert.alert("Lỗi", "Vui lòng chọn giờ khám.");
      }
      setStep(3);
    } else if (step === 3) {
      if (
        (!currentPackage && selectedServices.length === 0) ||
        !currentDate ||
        !currentTime
      ) {
        return Alert.alert("Lỗi", "Thông tin lịch khám chưa hoàn chỉnh.");
      }
      setStep(4);
    } else if (step === 4) {
      if (!paymentMethod) {
        return Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
      }
    }
  };

  const handleBack = () => {
    if (step === 2.1) {
      setStep(2);
    } else if (step === 2.2) {
      setStep(currentPackage ? 2 : 2.1); // Go back to AppointmentSelection or PackageSelection
    } else if (step === 2.3) {
      setStep(2.2);
    } else if (step === 2.4) {
      setStep(2.3);
    } else if (step === 3) {
      setStep(currentPackage ? 2.4 : 2); // Go back to TimeSelection or AppointmentSelection
    } else if (step === 4) {
      setStep(3);
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = () => {
    if (step === 1) {
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
    if (step === 2.1) {
      return !!currentPackage;
    }
    if (step === 2.3) {
      return !!currentDate;
    }
    if (step === 2.4) {
      return !!currentTime;
    }
    if (step === 4) {
      return !!paymentMethod;
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
    setAppointment(null);
    setCurrentPackage(null);
    setSelectedServices([]);
    setCurrentDate(null);
    setCurrentTime(null);
    setAppointmentCode(null);
    setAppointmentQueue(null);
    setAppointmentQueueUrl(null);
  };

  const getActiveStep = () => {
    if (step === 1) return 0;
    if (
      step === 2 ||
      step === 2.1 ||
      step === 2.2 ||
      step === 2.3 ||
      step === 2.4
    )
      return 1;
    if (step === 3) return 2;
    if (step === 4) return 3;
    if (step === 5) return 4;
    return 0;
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Chọn Hồ Sơ Người Khám";
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
    <ScreenContainer hasBottomTabs={true}>
      <View style={styles.container}>
        <Header
          title={getHeaderTitle()}
          onBack={handleBack}
          progressIcons={[
            "person",
            "medical",
            "clipboard",
            "wallet",
            "document",
          ]}
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
              appointment={appointment}
              currentPackage={currentPackage}
              selectedServices={selectedServices}
              currentDate={currentDate}
              currentTime={currentTime}
              handleNext={handleNext}
              selectedProfile={selectedProfile}
            />
          )}
          {step === 4 && (
            <PaymentScreen
              appointment={appointment}
              appointmentCode={appointmentCode}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handleBack={handleBack}
              canProceed={canProceed}
              totalAmount={calculateTotalAmount()}
              isSubmitting={isSubmitting}
              handlePayment={handlePayment}
              setStep={setStep}
              setAppointment={setAppointment}
            />
          )}
          {step === 5 && (
            <AppointmentConfirmation
              appointment={appointment}
              patientProfile={selectedProfile}
              navigation={navigation}
              resetAppointment={resetAppointment}
              appointmentCode={appointmentCode}
              appointmentQueue={appointmentQueue}
              appointmentQueueUrl={appointmentQueueUrl}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
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

export default PackageBookingScreen;
