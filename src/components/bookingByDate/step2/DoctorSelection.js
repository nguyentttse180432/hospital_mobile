import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getDoctorsByDate } from "../../../services/appointmentService";

const DoctorSelection = ({
  selectedDepartment,
  selectedDoctor,
  setSelectedDoctor,
  currentDate,
  setStep,
}) => {
  console.log("Selected Department:", selectedDepartment);
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDepartment && currentDate) {
      const fetchDoctors = async () => {
        try {
          const [day, month, year] = currentDate.split("/").map(Number);
          const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;
          console.log("Fetching doctors for date:", dateString);
          const data = await getDoctorsByDate(
            selectedDepartment.id,
            dateString
          );
          console.log("Fetched Doctors:", data);
          setDoctors(data.value || []);
        } catch (error) {
          Alert.alert(
            "Lỗi",
            "Không thể tải danh sách bác sĩ. Vui lòng thử lại."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [selectedDepartment, currentDate]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2); // Chuyển sang xác nhận
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.doctorItem,
        selectedDoctor?.doctorId === item.doctorId && styles.selectedItem,
      ]}
      onPress={() => handleSelectDoctor(item)}
    >
      <Text style={styles.doctorText}>{item.doctorName}</Text>
      <Text style={styles.doctorInfo}>
        Phòng: {item.roomNumber}, Tầng: {item.floor}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Bác Sĩ</Text>
      {doctors.length > 0 ? (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.doctorId}
          renderItem={renderItem}
          extraData={selectedDoctor}
        />
      ) : (
        <Text style={styles.noDoctorsText}>
          Không có bác sĩ nào khả dụng cho ngày và khoa đã chọn.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  doctorItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selectedItem: {
    backgroundColor: "#e0f7fa",
    borderColor: "#007bff",
  },
  doctorText: {
    fontSize: 16,
    fontWeight: "600",
  },
  doctorInfo: {
    fontSize: 14,
    color: "#555",
  },
  noDoctorsText: {
    fontSize: 16,
    color: "#e65100",
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DoctorSelection;
