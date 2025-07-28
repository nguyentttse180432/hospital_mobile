import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getDoctorsByDepartment } from "../../../services/appointmentService"; // Giả sử API từ service

const DoctorSelection = ({
  selectedDoctor,
  setSelectedDoctor,
  doctors,
  setDoctors,
  selectedDepartment,
  setStep,
  canProceed,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchDoctors = async () => {
        try {
          const data = await getDoctorsByDepartment(selectedDepartment.id);
          console.log(selectedDepartment.id);
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
  }, [selectedDepartment]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2.3); // Chuyển sang bước chọn ngày
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.doctorItem,
        selectedDoctor?.doctorId === item.doctorId && styles.selectedItem,
      ]}
      onPress={() => handleSelectDoctor(item)}
    >
      <Text style={styles.doctorText}>{item.fullName}</Text>
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
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.doctorId}
        renderItem={renderItem}
        extraData={selectedDoctor}
      />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DoctorSelection;
