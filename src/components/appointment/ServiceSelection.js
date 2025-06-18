import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { getServices } from "../../services/serviceService";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../common/Button";

const ServiceSelection = ({
  selectedServices,
  setSelectedServices,
  setStep,
}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải dịch vụ. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      // Remove service if already selected
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      // Add service if not selected
      setSelectedServices([...selectedServices, service]);
    }
  };
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      setStep(2); // Return to main appointment selection screen instead of going directly to date selection
    }
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some((s) => s.id === serviceId);
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serviceItem,
        isServiceSelected(item.id) && styles.selectedServiceItem,
      ]}
      onPress={() => handleToggleService(item)}
    >
      <View style={styles.serviceImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
        ) : (
          <View style={styles.serviceImagePlaceholder}>
            <Icon name="medical" size={24} color="#0071CE" />
          </View>
        )}
      </View>
      <View style={styles.serviceDetails}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.servicePrice}>
          {item.price.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        <View
          style={[
            styles.checkbox,
            isServiceSelected(item.id) && styles.checkboxSelected,
          ]}
        >
          {isServiceSelected(item.id) && (
            <Icon name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0071CE" />
        <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" size={40} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Dịch Vụ</Text>
      <Text style={styles.subtitle}>
        Chọn một hoặc nhiều dịch vụ bạn muốn đặt lịch
      </Text>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.selectedCountContainer}>
        <Text style={styles.selectedCountText}>
          {selectedServices.length} dịch vụ đã chọn
        </Text>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          disabled={selectedServices.length === 0}
        />
      </View>
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  selectedCountContainer: {
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 14,
    color: "#0071CE",
    fontWeight: "500",
  },
  servicesList: {
    paddingBottom: 16,
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
  },
  selectedServiceItem: {
    borderWidth: 2,
    borderColor: "#0071CE",
  },
  serviceImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  serviceImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f0f9",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0071CE",
  },
  checkboxContainer: {
    justifyContent: "center",
    paddingLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0071CE",
    borderColor: "#0071CE",
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
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});

export default ServiceSelection;
