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
  StatusBar,
} from "react-native";
import { getServices } from "../../services/serviceService";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";

const AllServicesScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setSearchQuery(""); // Reset search query when fetching new services

      const response = await getServices();

      if (response.isSuccess) {
        setServices(response.value);
        setFilteredServices(response.value);
      } else {
        setError("Không thể tải dịch vụ. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setError("Không thể tải dịch vụ. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service) => {
    navigation.navigate("ServiceDetailScreen", { serviceId: service.id });
  };

  const showServiceDetails = (service) => {
    setSelectedServiceDetails(service);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      // If search is empty, show all services
      setFilteredServices(services);
      return;
    }

    const searchTerms = text.toLowerCase().trim().split(/\s+/);

    // Filter services based on search terms
    const results = services.filter((service) => {
      const nameMatch =
        service.name &&
        searchTerms.some((term) => service.name.toLowerCase().includes(term));

      const descriptionMatch =
        service.description &&
        searchTerms.some((term) =>
          service.description.toLowerCase().includes(term)
        );

      const categoryMatch =
        service.category &&
        searchTerms.some((term) =>
          service.category.toLowerCase().includes(term)
        );

      return nameMatch || descriptionMatch || categoryMatch;
    });

    setFilteredServices(results);
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => showServiceDetails(item)}
    >
      <View style={styles.serviceDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.servicePrice}>
            {item.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
        <Text style={styles.serviceDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0071CE" />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Tất cả dịch vụ</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Search input */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dịch vụ..."
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
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={40} color="#666" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? `Không tìm thấy dịch vụ phù hợp với từ khóa "${searchQuery}"`
                  : "Không tìm thấy dịch vụ phù hợp"}
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
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholderView: {
    width: 40,
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
  servicesList: {
    padding: 16,
    paddingTop: 0,
  },
  serviceItem: {
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
  serviceDetails: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 18,
  },
  servicePrice: {
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
  serviceText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
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

export default AllServicesScreen;
