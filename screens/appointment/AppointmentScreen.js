import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
import InputField from "../../components/InputFieldIcon";
import ViewField from "../../components/ViewField";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  specialties,
  doctors,
  timeSlots,
  existingProfiles,
} from "../../data/appointmentData";

const AppointmentScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [patientProfile, setPatientProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({
    fullName: "",
    gender: "",
    phone: "",
    email: "",
    idNumber: "",
    dob: "",
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleNext = () => {
    if (step === 1 && !patientProfile) {
      if (
        !newProfile.fullName ||
        !newProfile.gender ||
        !newProfile.phone ||
        !newProfile.dob
      ) {
        return Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc.");
      }
      setPatientProfile(newProfile);
    }
    if (step === 2) {
      if (!selectedSpecialty)
        return Alert.alert("Lỗi", "Vui lòng chọn chuyên khoa.");
      if (!selectedDoctor) return Alert.alert("Lỗi", "Vui lòng chọn bác sĩ.");
      if (!selectedDate) return Alert.alert("Lỗi", "Vui lòng chọn ngày khám.");
      if (!selectedTime) return Alert.alert("Lỗi", "Vui lòng chọn giờ khám.");
    }
    if (step === 4 && !paymentMethod)
      return Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
    if (step < 5) setStep(step + 1);
    else {
      Alert.alert("Thành Công", "Đặt lịch khám thành công!", [
        { text: "OK", onPress: () => setStep(5) },
      ]);
    }
  };

  const handleBack = () => (step > 1 ? setStep(step - 1) : navigation.goBack());

  const canProceed = () => {
    if (step === 1) {
      return (
        patientProfile ||
        (newProfile.fullName &&
          newProfile.gender &&
          newProfile.phone &&
          newProfile.dob)
      );
    }
    if (step === 2) {
      return (
        selectedSpecialty && selectedDoctor && selectedDate && selectedTime
      );
    }
    if (step === 4) {
      return paymentMethod;
    }
    return true;
  };

  // Step Components
  const renderStep1 = () => (
    <ScrollView style={styles.step} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn hoặc Tạo Hồ Sơ Bệnh Nhân</Text>

      {existingProfiles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Hồ sơ hiện có</Text>
          {existingProfiles.map((item) => (
            <Card
              key={item.id}
              onPress={() => {
                setPatientProfile(item);
                setNewProfile({
                  fullName: "",
                  gender: "",
                  phone: "",
                  email: "",
                  idNumber: "",
                  dob: "",
                });
              }}
              selected={patientProfile?.id === item.id}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.fullName}</Text>
                  <Text style={styles.cardDetail}>SĐT: {item.phone}</Text>
                  <Text style={styles.cardDetail}>
                    Giới tính: {item.gender}
                  </Text>
                </View>
                {patientProfile?.id === item.id && (
                  <Icon name="checkmark-circle" size={24} color="#2ecc71" />
                )}
              </View>
            </Card>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>Tạo hồ sơ mới</Text>
      <InputField
        placeholder="Họ tên *"
        value={newProfile.fullName}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, fullName: text });
          setPatientProfile(null);
        }}
        icon="person"
      />
      <InputField
        placeholder="Giới tính *"
        value={newProfile.gender}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, gender: text });
          setPatientProfile(null);
        }}
        icon="transgender"
      />
      <InputField
        placeholder="Số điện thoại *"
        value={newProfile.phone}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, phone: text });
          setPatientProfile(null);
        }}
        icon="call"
      />
      <InputField
        placeholder="Email"
        value={newProfile.email}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, email: text });
          setPatientProfile(null);
        }}
        icon="mail"
      />
      <InputField
        placeholder="CCCD/CMND/Passport"
        value={newProfile.idNumber}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, idNumber: text });
          setPatientProfile(null);
        }}
        icon="card"
      />
      <InputField
        placeholder="Ngày sinh *"
        value={newProfile.dob}
        onChangeText={(text) => {
          setNewProfile({ ...newProfile, dob: text });
          setPatientProfile(null);
        }}
        icon="calendar"
      />
      <Button
        title="Tiếp Tục"
        onPress={handleNext}
        disabled={!canProceed()}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.step} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn Thông Tin Khám</Text>
      <ViewField
        label="Chuyên khoa"
        value={selectedSpecialty?.name}
        icon="medical"
        onPress={() => setStep(2.1)}
      />
      <ViewField
        label="Bác sĩ"
        value={selectedDoctor?.name}
        icon="person"
        onPress={() => setStep(2.2)}
        disabled={!selectedSpecialty}
      />
      <ViewField
        label="Ngày khám"
        value={selectedDate}
        icon="calendar"
        onPress={() => setStep(2.3)}
        disabled={!selectedDoctor}
      />
      <ViewField
        label="Giờ khám"
        value={selectedTime?.time}
        icon="time"
        onPress={() => setStep(2.4)}
        disabled={!selectedDate}
      />
      <Button
        title="Tiếp Tục"
        onPress={handleNext}
        disabled={!canProceed()}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );

  const renderStep2_1 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Chọn Chuyên Khoa</Text>
      <FlatList
        data={specialties}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card
            onPress={() => {
              setSelectedSpecialty(item);
              setSelectedDoctor(null);
              setSelectedDate(null);
              setSelectedTime(null);
              setStep(2);
            }}
            selected={selectedSpecialty?.id === item.id}
          >
            <View style={styles.cardContent}>
              <Icon name="medical" size={24} color="#1e88e5" />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardFee}>{item.fee}</Text>
              </View>
              {selectedSpecialty?.id === item.id && (
                <Icon name="checkmark-circle" size={24} color="#2ecc71" />
              )}
            </View>
          </Card>
        )}
      />
      <Button
        title="Xác Nhận"
        onPress={() => setStep(2)}
        disabled={!selectedSpecialty}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  const renderStep2_2 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Chọn Bác Sĩ</Text>
      <FlatList
        data={doctors[selectedSpecialty?.name] || []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card
            onPress={() => {
              setSelectedDoctor(item);
              setSelectedDate(null);
              setSelectedTime(null);
              setStep(2);
            }}
            selected={selectedDoctor?.id === item.id}
          >
            <View style={styles.cardContent}>
              <Icon name="person" size={24} color="#1e88e5" />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDetail}>{item.room}</Text>
              </View>
              {selectedDoctor?.id === item.id && (
                <Icon name="checkmark-circle" size={24} color="#2ecc71" />
              )}
            </View>
          </Card>
        )}
      />
      <Button
        title="Xác Nhận"
        onPress={() => setStep(2)}
        disabled={!selectedDoctor}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  const renderStep2_3 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Chọn Ngày Khám</Text>
      <View style={styles.calendar}>
        <Text style={styles.month}>Tháng 05 - 2025</Text>
        <View style={styles.weekDays}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.days}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isToday = day === 22; // Current date: May 22, 2025
            const isSelected = selectedDate === "29/05/2025" && day === 29;
            const isAvailable = day === 29; // Only day 29 has appointments
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.day,
                  isSelected && styles.selectedDay,
                  isToday && styles.todayDay,
                  !isAvailable && styles.unavailableDay,
                ]}
                onPress={() => {
                  if (isAvailable) {
                    setSelectedDate("29/05/2025");
                    setSelectedTime(null);
                    setStep(2);
                  }
                }}
                disabled={!isAvailable}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayDayText,
                    !isAvailable && styles.unavailableDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Button
        title="Xác Nhận"
        onPress={() => setStep(2)}
        disabled={!selectedDate}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  const renderStep2_4 = () => {
    // Define all possible time slots (example range, adjust as needed)
    const allTimeSlots = [
      { id: "1", time: "06:00 - 07:00" },
      { id: "2", time: "07:00 - 08:00" },
      { id: "3", time: "08:00 - 09:00" },
      { id: "4", time: "09:00 - 10:00" },
      { id: "5", time: "10:00 - 11:00" },
      { id: "6", time: "11:00 - 12:00" },
      { id: "7", time: "13:30 - 14:30" },
      { id: "8", time: "14:30 - 15:30" },
      { id: "9", time: "15:30 - 16:30" },
    ];

    // Get available time slots from the data
    const availableTimeSlots =
      timeSlots[selectedSpecialty?.name]?.[selectedDate]?.[
        selectedDoctor?.name
      ] || [];

    // Check if a time slot is available
    const isTimeSlotAvailable = (time) =>
      availableTimeSlots.some((slot) => slot.time === time);

    return (
      <View style={styles.step}>
        <Text style={styles.stepTitle}>Chọn Giờ Khám</Text>
        <FlatList
          data={allTimeSlots}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.timeSlotRow}
          renderItem={({ item }) => (
            <Card
              onPress={() => {
                if (isTimeSlotAvailable(item.time)) {
                  setSelectedTime(
                    availableTimeSlots.find((slot) => slot.time === item.time)
                  );
                  setStep(2);
                }
              }}
              selected={selectedTime?.time === item.time}
              disabled={!isTimeSlotAvailable(item.time)}
              style={styles.timeSlotCard}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime?.time === item.time && styles.selectedTimeText,
                  !isTimeSlotAvailable(item.time) && styles.unavailableDayText,
                ]}
              >
                {item.time}
              </Text>
              {selectedTime?.time === item.time && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color="#2ecc71"
                  style={styles.checkIcon}
                />
              )}
            </Card>
          )}
        />
        <Button
          title="Xác Nhận"
          onPress={() => setStep(2)}
          disabled={!selectedTime}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  };

  const renderStep3 = () => (
    <ScrollView style={styles.step} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Xác Nhận Thông Tin</Text>

      <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
      <InputField
        placeholder="Họ và tên"
        value={patientProfile?.fullName}
        editable={false}
        icon="person"
      />
      <InputField
        placeholder="Giới tính"
        value={patientProfile?.gender}
        editable={false}
        icon="transgender"
      />
      <InputField
        placeholder="Số điện thoại"
        value={patientProfile?.phone}
        editable={false}
        icon="call"
      />
      <InputField
        placeholder="Địa chỉ"
        value={patientProfile?.address || "Không có"}
        editable={false}
        icon="location"
        multiline={true}
      />

      <Text style={styles.sectionTitle}>Thông tin khám bệnh</Text>
      <View style={styles.appointmentSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Chuyên khoa:</Text>
          <Text style={styles.summaryValue}>{selectedSpecialty?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Bác sĩ:</Text>
          <Text style={styles.summaryValue}>{selectedDoctor?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ngày khám:</Text>
          <Text style={styles.summaryValue}>{selectedDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Giờ khám:</Text>
          <Text style={styles.summaryValue}>{selectedTime?.time}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phòng khám:</Text>
          <Text style={styles.summaryValue}>{selectedTime?.room}</Text>
        </View>
        <View style={[styles.summaryRow, styles.feeRow]}>
          <Text style={styles.summaryLabel}>Phí khám:</Text>
          <Text style={styles.feeValue}>{selectedSpecialty?.fee}</Text>
        </View>
      </View>

      <Button title="Tiếp Tục" onPress={handleNext} style={{ marginTop: 16 }} />
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.step} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Thanh Toán</Text>

      <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === "MoMo" && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod("MoMo")}
      >
        <Icon name="wallet" size={24} color="#d81b60" />
        <Text style={styles.paymentOptionText}>Ví điện tử MoMo</Text>
        {paymentMethod === "MoMo" && (
          <Icon name="checkmark-circle" size={24} color="#2ecc71" />
        )}
      </TouchableOpacity>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.totalAmount}>{selectedSpecialty?.fee}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Quay Lại"
          onPress={handleBack}
          secondary
          style={styles.halfButton}
        />
        <Button
          title="Thanh Toán"
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.halfButton}
        />
      </View>
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.step} showsVerticalScrollIndicator={false}>
      <View style={styles.successHeader}>
        <Icon name="checkmark-circle" size={60} color="#2ecc71" />
        <Text style={styles.successTitle}>Đặt Lịch Thành Công!</Text>
        <Text style={styles.successSubtitle}>Phiếu khám bệnh của bạn</Text>
      </View>

      <View style={styles.ticketContainer}>
        <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Họ và tên: {patientProfile?.fullName}
          </Text>
          <Text style={styles.infoText}>
            Giới tính: {patientProfile?.gender}
          </Text>
          <Text style={styles.infoText}>
            Số điện thoại: {patientProfile?.phone}
          </Text>
          <Text style={styles.infoText}>
            Địa chỉ: {patientProfile?.address || "Không có"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết đặt khám</Text>
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Chuyên khoa:</Text>
            <Text style={styles.detailValue}>{selectedSpecialty?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bác sĩ:</Text>
            <Text style={styles.detailValue}>{selectedDoctor?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày khám:</Text>
            <Text style={styles.detailValue}>{selectedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giờ khám:</Text>
            <Text style={styles.detailValue}>{selectedTime?.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phòng khám:</Text>
            <Text style={styles.detailValue}>{selectedTime?.room}</Text>
          </View>
          <View style={[styles.detailRow, styles.feeRow]}>
            <Text style={styles.detailLabel}>Phí khám:</Text>
            <Text style={styles.feeValue}>{selectedSpecialty?.fee}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Thêm Chuyên Khoa"
          onPress={() => setStep(2)}
          secondary
          style={styles.halfButton}
        />
        <Button
          title="Hoàn Tất"
          onPress={() => navigation.navigate("Home")}
          style={styles.halfButton}
        />
      </View>
    </ScrollView>
  );

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Chọn Hồ Sơ Bệnh Nhân";
      case 2:
        return "Chọn Thông Tin Khám";
      case 2.1:
        return "Chọn Chuyên Khoa";
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
        return "Phiếu Khám Bệnh";
      default:
        return "Đặt Lịch Khám";
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={getHeaderTitle()}
        onBack={handleBack}
        progressIcons={["person", "medical", "calendar", "wallet", "document"]}
        activeStep={Math.floor(step) - 1}
      />
      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 2.1 && renderStep2_1()}
        {step === 2.2 && renderStep2_2()}
        {step === 2.3 && renderStep2_3()}
        {step === 2.4 && renderStep2_4()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  content: {
    flex: 1,
  },
  step: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardText: {
    flex: 1,
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardDetail: {
    fontSize: 12,
    color: "#666",
  },
  cardFee: {
    fontSize: 14,
    color: "#27ae60",
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  month: {
    fontSize: 16,
    color: "#1e88e5",
    textAlign: "center",
    marginBottom: 8,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    color: "#666",
    width: 40,
    textAlign: "center",
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  selectedDay: {
    backgroundColor: "#1e88e5",
    borderRadius: 20,
  },
  todayDay: {
    backgroundColor: "#e0f7fa",
    borderRadius: 20,
  },
  unavailableDay: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
  },
  todayDayText: {
    color: "#1e88e5",
  },
  unavailableDayText: {
    color: "#ccc",
  },
  timeSlotRow: {
    justifyContent: "space-between",
  },
  timeSlotCard: {
    width: "48%",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#333",
  },
  selectedTimeText: {
    color: "#1e88e5",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  appointmentSummary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  feeRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  feeValue: {
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "600",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  selectedPaymentOption: {
    borderColor: "#1e88e5",
    borderWidth: 2,
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  halfButton: {
    width: "48%",
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  ticketContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
});

export default AppointmentScreen;
