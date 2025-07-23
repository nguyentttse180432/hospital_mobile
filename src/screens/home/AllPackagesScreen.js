import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMedicalPackages } from "../../services/medicalPackageService";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import { getPatients } from "../../services/patientService";

const AllPackagesScreen = () => {
  const navigation = useNavigation();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultPatient, setDefaultPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchDefaultPatient();
    fetchPatients();
  }, []);

  const fetchDefaultPatient = async () => {
    try {
      const patientJSON = await AsyncStorage.getItem("defaultPatient");
      if (patientJSON) {
        const patient = JSON.parse(patientJSON);
        console.log("Default patient loaded:", patient);
        setDefaultPatient(patient);
        const age = calculateAge(patient.dob);
        fetchMedicalPackages(patient.gender, age);
      } else {
        console.log("No default patient found in AsyncStorage");
        fetchMedicalPackages();
      }
    } catch (error) {
      console.error("Error fetching default patient:", error);
      fetchMedicalPackages();
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.isSuccess) {
        setPatients(response.value);
        console.log("Fetched patients:", response.value);
      } else {
        console.error("Failed to fetch patients:", response.error?.message);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchMedicalPackages = async (gender = null, age = null) => {
    try {
      setLoading(true);
      setSearchQuery("");
      console.log(`Fetching packages with gender: ${gender}, age: ${age}`);
      const response = await getMedicalPackages(gender, age);

      if (response.isSuccess) {
        setPackages(response.value);
        setFilteredPackages(response.value);
      } else {
        setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    try {
      if (!dob) {
        console.error("No dob provided");
        return 0;
      }
      const dateObj = typeof dob === "string" ? new Date(dob) : dob;
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.error("Invalid dob format:", dob);
        return 0;
      }
      const today = new Date();
      let age = today.getFullYear() - dateObj.getFullYear();
      const monthDiff = today.getMonth() - dateObj.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dateObj.getDate())
      ) {
        age--;
      }
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return 0;
    }
  };

  const handleSelectPatient = (patient) => {
    console.log("Selected patient:", patient);
    setSelectedPatient(patient);
    setShowPatientModal(false);
    const age = calculateAge(patient.dob);
    fetchMedicalPackages(patient.gender, age);
  };

  const handleSelectPackage = (pkg) => {
    navigation.navigate("PackageDetailScreen", {
      packages: filteredPackages,
      initialIndex: filteredPackages.findIndex((p) => p.id === pkg.id),
      selectedPatient: selectedPatient || defaultPatient,
      defaultPatient,
      showBookButton: true, // Enable book button
    });
  };

  const showPackageDetails = (pkg) => {
    handleSelectPackage(pkg);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredPackages(packages);
      return;
    }

    const searchTerms = text.toLowerCase().trim().split(/\s+/);

    const results = packages.filter((pkg) => {
      const nameMatch =
        pkg.name &&
        searchTerms.some((term) => pkg.name.toLowerCase().includes(term));
      const descriptionMatch =
        pkg.description &&
        searchTerms.some((term) =>
          pkg.description.toLowerCase().includes(term)
        );
      const typeMatch =
        pkg.type &&
        searchTerms.some((term) => pkg.type.toLowerCase().includes(term));
      const targetGroupMatch =
        pkg.targetGroup &&
        searchTerms.some((term) =>
          pkg.targetGroup.toLowerCase().includes(term)
        );
      return nameMatch || descriptionMatch || typeMatch || targetGroupMatch;
    });

    setFilteredPackages(results);
  };

  const renderPatientItem = ({ item }) => {
    const dobValue = item.dob || item.dateOfBirth;
    const age = calculateAge(dobValue);
    return (
      <TouchableOpacity
        style={styles.patientItem}
        onPress={() => handleSelectPatient(item)}
      >
        <Text style={styles.patientText}>
          {item.firstName} {item.lastName} - {age} tuổi -{" "}
          {item.gender === "Male" ? "Nam" : "Nữ"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.packageItem}
      onPress={() => showPackageDetails(item)}
    >
      <View style={styles.packageDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => showPackageDetails(item)}
        >
          <Icon name="eye-outline" size={18} color="#0071CE" />
          <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0071CE" />
          <Text style={styles.loadingText}>Đang tải gói khám...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <Icon name="alert-circle" size={40} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              fetchMedicalPackages(
                selectedPatient?.gender,
                selectedPatient ? calculateAge(selectedPatient.dob) : null
              )
            }
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Tất cả gói khám" onBack={() => navigation.goBack()}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

        {patients.length > 0 && (
          <TouchableOpacity
            style={styles.selectPatientButton}
            onPress={() => setShowPatientModal(true)}
          >
            <Icon name="person-outline" size={20} color="#0071CE" />
            <Text style={styles.selectPatientText}>
              Xem gói theo người khám
            </Text>
          </TouchableOpacity>
        )}

        {(defaultPatient || selectedPatient) && (
          <View style={styles.defaultPatientContainer}>
            <Text style={styles.defaultPatientText}>
              Các gói khám dành cho{" "}
              {selectedPatient
                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                : `${defaultPatient.firstName} ${defaultPatient.lastName}`}{" "}
              (
              {(selectedPatient || defaultPatient).gender === "Male"
                ? "Nam"
                : "Nữ"}
              , {calculateAge((selectedPatient || defaultPatient).dob)} tuổi)
            </Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm gói khám..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearch("")}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredPackages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.packagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={40} color="#666" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? `Không tìm thấy gói khám phù hợp với từ khóa "${searchQuery}"`
                  : "Không tìm thấy gói khám phù hợp"}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => handleSearch("")}
                >
                  <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        <Modal
          visible={showPatientModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPatientModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn người khám</Text>
                <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={patients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.identityNumber}
                contentContainerStyle={styles.patientList}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  defaultPatientContainer: {
    padding: 16,
    backgroundColor: "#e3f2fd",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  defaultPatientText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectPatientButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectPatientText: {
    fontSize: 15,
    color: "#0071CE",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxHeight: "80%",
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  patientList: {
    padding: 16,
  },
  patientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  patientText: {
    fontSize: 16,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    height: "100%",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  packagesList: {
    padding: 16,
    paddingTop: 0,
  },
  packageItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
  },
  packageDetails: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0071CE",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#0071CE",
    marginLeft: 4,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0071CE",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  clearSearchText: {
    color: "#0071CE",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AllPackagesScreen;
