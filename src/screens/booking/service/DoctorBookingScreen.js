import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Header from "../../../components/common/Header";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { timeSlots } from "../../../data/appointmentData";
import { bookAppointment } from "../../../services/appointmentService";
import ProfileSelection from "../../../components/appointment/step1/ProfileSelection";
import DoctorAppointmentSelection from "../../../components/booking/step2/DoctorAppointmentSelection";
import DepartmentSelection from "../../../components/booking/step2/DepartmentSelection";
import DoctorSelection from "../../../components/booking/step2/DoctorSelection";
import DateSelection from "../../../components/booking/step2/DateSelection";
import TimeSelection from "../../../components/booking/step2/TimeSelection";
import AppointmentReview from "../../../components/booking/step3/AppointmentReview";
import PaymentScreen from "../../../components/booking/step4/PaymentScreen";
import AppointmentConfirmation from "../../../components/booking/step5/AppointmentConfirmation";

const DoctorBookingScreen = ({ navigation, route }) => {
  const {
    selectedProfile: initialProfile,
    initialStep,
    selectedService,
    servicePrice,
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
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentCode, setAppointmentCode] = useState(null);
  const [appointmentQueue, setAppointmentQueue] = useState(null);
  const [appointmentQueueUrl, setAppointmentQueueUrl] = useState(null);
  // Fix: Define appointment for step 5 rendering
  const appointment = appointmentCode ? {
    code: appointmentCode,
    numericalOrder: appointmentQueue,
    queueUrl: appointmentQueueUrl,
  } : null;

  // Initialize step based on pre-selected profile
  useEffect(() => {
    if (initialProfile && initialStep === 2) {
      setStep(2);
      setSelectedProfile(initialProfile);
    }
  }, [initialProfile, initialStep]);

  // Fetch schedules when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && currentDate && (step === 2 || step === 2.4)) {
      // Placeholder: Implement getDoctorSchedule API in services
      // getDoctorSchedule(selectedDoctor.doctorId, currentDate).then(setSchedules).catch(console.error);
      setSchedules([]); // Placeholder, replace with actual API call
    }
  }, [selectedDoctor, currentDate, step]);

  const formatAppointmentData = (profile, date, doctorId, symptom, service) => {
    const [firstName, ...lastNameParts] = profile.fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "Unknown";

    return {
      patientId: profile.id,
      bookType: "App",
      bookingDate: date.toISOString(),
      currentMedication: "",
      medicalHistory: "",
      allergyDetails: "",
      symptom: symptom || "",
      smokingStatus: "No",
      patientInfomation: {
        firstName: firstName || "Unknown",
        lastName: lastName,
        dateOfBirth: profile.dob
          ? new Date(profile.dob).toISOString()
          : new Date().toISOString(),
        gender: profile.gender || "Male",
        phoneNumber: profile.phone || "",
        email: profile.email || "",
        address: {
          street: profile.address || "",
          ward: "",
          district: "",
          province: "",
          street_2: "",
          ward_2: "",
          district_2: "",
          province_2: "",
        },
        identityNumber: profile.idNumber || "",
        healthInsuranceCode: profile.bhyt || "",
      },
      doctorId: doctorId,
      serviceTypeId: service?.serviceTypeId || "",
      serviceId: service?.serviceId || "",
    };
  };

  const handlePayment = async () => {
    if (!selectedProfile || !selectedDoctor || !currentDate || !currentTime) {
      Alert.alert("Lỗi", "Thông tin lịch khám không đầy đủ");
      return null;
    }
    if (!paymentMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
      return null;
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
        selectedProfile,
        appointmentDate,
        selectedDoctor.doctorId,
        symptom,
        selectedService
      );

      const response = await bookAppointment(appointmentData);
      console.log("Appointment creation response:", response);

      let code = null;

      if (response?.isSuccess && response?.value?.code) {
        code = response.value.code;
      } else if (response?.data?.value?.code) {
        code = response.data.value.code;
      }

      if (!code) {
        throw new Error("Không thể lấy mã appointment từ server");
      }

      const createResponseData = response.isSuccess
        ? response.value
        : response.data.value;
      setAppointmentCode(code);
      setAppointmentQueue(createResponseData.numericalOrder);
      setAppointmentQueueUrl(createResponseData.queueUrl);

      if (paymentMethod === "Cash") {
        setStep(5);
        return code;
      }
      return code;
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
      setStep(2);
    } else if (step === 2) {
      if (
        !selectedDepartment ||
        !selectedDoctor ||
        !currentDate ||
        !currentTime
      ) {
        return Alert.alert(
          "Lỗi",
          "Vui lòng hoàn tất chọn khoa, bác sĩ, ngày và giờ khám."
        );
      }
      setStep(3);
    } else if (step === 2.1) {
      if (!selectedDepartment) {
        return Alert.alert("Lỗi", "Vui lòng chọn khoa.");
      }
      setStep(2);
    } else if (step === 2.2) {
      if (!selectedDoctor) {
        return Alert.alert("Lỗi", "Vui lòng chọn bác sĩ.");
      }
      setStep(2);
    } else if (step === 2.3) {
      if (!currentDate) {
        return Alert.alert("Lỗi", "Vui lòng chọn ngày khám.");
      }
      setStep(2);
    } else if (step === 2.4) {
      if (!currentTime) {
        return Alert.alert("Lỗi", "Vui lòng chọn giờ khám.");
      }
      setStep(2);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handlePayment();
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 2.1 || step === 2.2 || step === 2.3 || step === 2.4)
      setStep(2);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
    else if (step > 1) setStep(step - 1);
    else navigation.goBack();
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
        !!selectedDepartment &&
        !!selectedDoctor &&
        !!currentDate &&
        !!currentTime
      );
    }
    if (step === 2.1) return !!selectedDepartment;
    if (step === 2.2) return !!selectedDoctor;
    if (step === 2.3) return !!currentDate;
    if (step === 2.4) return !!currentTime;
    if (step === 4) return !!paymentMethod;
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
    setSelectedDepartment(null);
    setDoctors([]);
    setSelectedDoctor(null);
    setSchedules([]);
    setCurrentDate(null);
    setCurrentTime(null);
    setSymptom("");
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
        return "Chọn Khoa";
      case 2.2:
        return "Chọn Bác Sĩ";
      case 2.3:
        return "Chọn Ngày Khám";
      case 2.4:
        return "Chọn Giờ Khám";
      case 3:
        return "Xác Nhận Thông Tin";
      case 4:
        return "Thanh Toán";
      case 5:
        return "Xác Nhận Đặt Lịch";
      default:
        return "Đặt Lịch Khám Bác Sĩ";
    }
  };

  return (
    <ScreenContainer style={styles.container} scrollable={false}>
      <View style={styles.container}>
        <Header
          title={getHeaderTitle()}
          onBack={handleBack}
          progressIcons={["person", "medkit", "pulse", "calendar", "wallet"]}
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
            <DoctorAppointmentSelection
              selectedDepartment={selectedDepartment}
              selectedDoctor={selectedDoctor}
              currentDate={currentDate}
              currentTime={currentTime}
              setStep={setStep}
              canProceed={canProceed}
              setSelectedDepartment={setSelectedDepartment}
              setSelectedDoctor={setSelectedDoctor}
              setCurrentDate={setCurrentDate}
              setCurrentTime={setCurrentTime}
              symptom={symptom}
              setSymptom={setSymptom}
            />
          )}
          {step === 2.1 && (
            <DepartmentSelection
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              setStep={setStep}
              canProceed={canProceed}
            />
          )}
          {step === 2.2 && (
            <DoctorSelection
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor}
              doctors={doctors}
              setDoctors={setDoctors}
              selectedDepartment={selectedDepartment}
              setStep={setStep}
              canProceed={canProceed}
            />
          )}
          {step === 2.3 && (
            <DateSelection
              selectedDoctor={selectedDoctor}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              setCurrentTime={setCurrentTime}
              setStep={setStep}
            />
          )}
          {step === 2.4 && (
            <TimeSelection
              selectedDoctor={selectedDoctor}
              currentDate={currentDate}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              setStep={setStep}
              timeSlots={timeSlots}
              schedules={schedules}
            />
          )}
          {step === 3 && (
            <AppointmentReview
              price={selectedService?.price || 0}
              serviceType={selectedService?.name}
              selectedDoctor={selectedDoctor}
              selectedDepartment={selectedDepartment}
              currentDate={currentDate}
              currentTime={currentTime}
              symptom={symptom}
              handleNext={handleNext}
              selectedProfile={selectedProfile}
              selectedService={selectedService}
            />
          )}
          {step === 4 && (
            <PaymentScreen
              appointmentCode={appointmentCode}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handleBack={handleBack}
              canProceed={canProceed}
              isSubmitting={isSubmitting}
              handlePayment={handlePayment}
              setStep={setStep}
              totalAmount={servicePrice || selectedService?.price || 0}
            />
          )}
          {step === 5 && appointment && (
            <AppointmentConfirmation
              currentDate={currentDate}
              currentTime={currentTime}
              patientProfile={selectedProfile}
              selectedDepartment={selectedDepartment}
              selectedDoctor={selectedDoctor}
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

export default DoctorBookingScreen;
