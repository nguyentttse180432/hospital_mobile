import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { getMedicalPackages } from "../../../services/medicalPackageService";
import Icon from "react-native-vector-icons/Ionicons";

const MedicalPackageSelection = ({
  currentPackage,
  setCurrentPackage,
  setStep,
  selectedProfile,
}) => {  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tính tuổi từ ngày sinh
  const calculateAge = (dobString) => {
    if (!dobString) return 0;

    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // If birthday hasn't occurred yet this year, subtract a year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };
  useEffect(() => {
    // When selectedProfile changes, fetch medical packages with appropriate filters
    if (selectedProfile) {
      fetchMedicalPackages(selectedProfile);
    } else {
      fetchMedicalPackages();
    }
  }, [selectedProfile]);
  const fetchMedicalPackages = async (profile = null) => {
    try {
      setLoading(true);
      setSearchQuery(""); // Reset search query when fetching new packages

      let gender = null;
      let age = null;

      if (profile) {
        // Map gender values to match API expectations (Male/Female)
        if (profile.gender) {
          gender =
            profile.gender === "Nam"
              ? "Male"
              : profile.gender === "Nữ"
              ? "Female"
              : profile.gender;
        }

        // Calculate age if dob exists
        if (profile.dob) {
          age = calculateAge(profile.dob);
        }
      }

      // Call API with gender and age parameters
      const data = await getMedicalPackages(gender, age);
      
      setPackages(data.value);
      setFilteredPackages(data.value);
      setError(null);
    } catch (err) {
      setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSelectPackage = (pkg) => {
    setCurrentPackage(pkg);
    setStep(2); // Return to main appointment selection screen instead of going directly to date selection
  };  const showPackageDetails = (pkg, e) => {
    e.stopPropagation();
    setSelectedPackageDetails(pkg);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      // If search is empty, show all packages
      setFilteredPackages(packages);
      return;
    }
    
    const searchTerms = text.toLowerCase().trim().split(/\s+/);
    
    // Filter packages based on search terms
    const results = packages.filter(pkg => {
      const nameMatch = pkg.name && searchTerms.some(term => 
        pkg.name.toLowerCase().includes(term)
      );
      
      const descriptionMatch = pkg.description && searchTerms.some(term => 
        pkg.description.toLowerCase().includes(term)
      );
      
      const typeMatch = pkg.type && searchTerms.some(term => 
        pkg.type.toLowerCase().includes(term)
      );
      
      const targetGroupMatch = pkg.targetGroup && searchTerms.some(term => 
        pkg.targetGroup.toLowerCase().includes(term)
      );
      
      return nameMatch || descriptionMatch || typeMatch || targetGroupMatch;
    });
    
    setFilteredPackages(results);
  };
  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        currentPackage?.id === item.id && styles.selectedPackageItem,
      ]}
      onPress={() => handleSelectPackage(item)}
    >
      {currentPackage?.id === item.id && (
        <View style={styles.checkmark}>
          <Icon name="checkmark-circle" size={24} color="#0071CE" />
        </View>
      )}
      <View style={styles.packageDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price.toLocaleString("vi-VN")} 
          </Text>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={(e) => showPackageDetails(item, e)}
        >
          <Icon name="eye-outline" size={18} color="#0071CE" />
          <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0071CE" />
        <Text style={styles.loadingText}>Đang tải gói khám...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" size={40} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMedicalPackages}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }  return (
    <View style={styles.container}>
      
      {selectedProfile && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            Những gói khám phù hợp với{" "}
            {selectedProfile.fullName.toUpperCase()} (
            {selectedProfile.gender === "Male" ? "Nam" : "Nữ"}{" "}
            {calculateAge(selectedProfile.dob)} tuổi)
          </Text>
        </View>
      )}

      {/* Search input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
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

      {/* Modal hiển thị chi tiết gói khám */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết gói khám</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedPackageDetails && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.detailTitle}>
                  {selectedPackageDetails.name}
                </Text>
                <Text style={styles.detailPrice}>
                  {selectedPackageDetails.price.toLocaleString("vi-VN")} VNĐ
                </Text>

                <Text style={styles.detailSectionTitle}>Mô tả:</Text>
                <Text style={styles.detailDescription}>
                  {selectedPackageDetails.description}
                </Text>
                <Text style={styles.detailSectionTitle}>
                  Các xét nghiệm bao gồm:
                </Text>
                {selectedPackageDetails.details &&
                selectedPackageDetails.details.testCategories &&
                selectedPackageDetails.details.testCategories.length > 0 ? (
                  <View style={styles.testCategoriesContainer}>
                    {selectedPackageDetails.details.testCategories.map(
                      (category, index) => (
                        <View key={index} style={styles.categorySection}>
                          {category.name && (
                            <Text style={styles.categoryName}>
                              {category.name}
                            </Text>
                          )}

                          {category.tests && category.tests.length > 0 ? (
                            category.tests.map((test, testIndex) => (
                              <View key={testIndex} style={styles.serviceItem}>
                                <Icon
                                  name="checkmark-circle"
                                  size={16}
                                  color="#0071CE"
                                />
                                <Text style={styles.serviceText}>
                                  {test.name}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <View style={styles.serviceItem}>
                              <Icon
                                name="information-circle-outline"
                                size={16}
                                color="#0071CE"
                              />
                              <Text style={styles.serviceText}>
                                Danh sách xét nghiệm đang được cập nhật
                              </Text>
                            </View>
                          )}
                        </View>
                      )
                    )}
                  </View>
                ) : selectedPackageDetails.type ? (
                  <View style={styles.typeContainer}>
                    <View style={styles.serviceItem}>
                      <Icon name="medical" size={16} color="#0071CE" />
                      <Text style={styles.serviceText}>
                        Loại gói: {selectedPackageDetails.type}
                      </Text>
                    </View>
                    {selectedPackageDetails.targetGroup && (
                      <View style={styles.serviceItem}>
                        <Icon name="people" size={16} color="#0071CE" />
                        <Text style={styles.serviceText}>
                          Đối tượng: {selectedPackageDetails.targetGroup}
                        </Text>
                      </View>
                    )}
                    <View style={styles.serviceItem}>
                      <Icon
                        name="information-circle"
                        size={16}
                        color="#0071CE"
                      />
                      <Text style={styles.serviceText}>
                        Chi tiết xét nghiệm sẽ được cung cấp tại bệnh viện
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noServiceText}>
                    Không có thông tin về các xét nghiệm
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    setCurrentPackage(selectedPackageDetails);
                    setModalVisible(false);
                    setStep(2);
                  }}
                >
                  <Text style={styles.selectButtonText}>Chọn gói này</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  filterInfo: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },  filterInfoText: {
    color: "#0071CE",
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
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
    paddingBottom: 16,
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
  selectedPackageItem: {
    borderWidth: 2,
    borderColor: "#0071CE",
  },
  packageImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 16,
  },
  packageImage: {
    width: "100%",
    height: "100%",
  },
  packageImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f0f9",
    justifyContent: "center",
    alignItems: "center",
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
  checkmark: {
    position: "absolute",
    top: 0,
    right: -1,
    zIndex: 10,
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
  skipButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#0071CE",
    fontSize: 15,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },  emptyText: {
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0071CE",
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  serviceText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  noServiceText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  testCategoriesContainer: {
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  typeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: "#0071CE",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MedicalPackageSelection;
