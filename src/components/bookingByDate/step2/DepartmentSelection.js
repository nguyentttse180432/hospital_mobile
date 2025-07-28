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
import { getDepartments } from "../../../services/appointmentService"; // Giả sử API lấy danh sách khoa

const DepartmentSelection = ({
  selectedDepartment,
  setSelectedDepartment,
  setStep,
}) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        console.log("Fetched Departments:", data);
        
        setDepartments(data.value.items || []);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách khoa. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleSelectDepartment = (department) => {
    setSelectedDepartment(department);
    setStep(2.4); // Chuyển sang chọn bác sĩ
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.departmentItem,
        selectedDepartment?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => handleSelectDepartment(item)}
    >
      <Text style={styles.departmentText}>{item.name}</Text>
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
      <Text style={styles.title}>Chọn Khoa</Text>
      <FlatList
        data={departments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={selectedDepartment}
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
  departmentItem: {
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
  departmentText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DepartmentSelection;
