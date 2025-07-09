import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  PanResponder,
  Vibration,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

// Function to translate category names to Vietnamese
const translateCategoryName = (name) => {
  const translations = {
    Ophthalmology: "Nhãn khoa",
    Testing: "Xét nghiệm",
    ImagingDiagnostics: "Chẩn đoán hình ảnh",
    GeneralCheckup: "Khám tổng quát",
    Cardiology: "Tim mạch",
    Gastroenterology: "Tiêu hóa",
    Neurology: "Thần kinh",
    Dermatology: "Da liễu",
    ENT: "Tai Mũi Họng",
    Orthopedics: "Cơ xương khớp",
    Endocrinology: "Nội tiết",
    Urology: "Tiết niệu",
    Gynecology: "Phụ khoa",
    Pediatrics: "Nhi khoa",
    Oncology: "Ung bướu",
    Psychology: "Tâm lý",
  };

  return translations[name] || name; // Return the translated name or original if no translation exists
};

const PackageDetailModal = ({
  visible,
  onClose,
  packageDetails,
  packages,
  currentIndex,
  onNavigate,
  onBookPackage,
  swipeDistance,
  fadeAnim,
  scaleAnim,
  indicatorAnim,
  isTransitioning,
  canSwipe,
  panResponder,
  showBookButton = false,
  bookButtonText = "Đặt lịch gói này",
}) => {
  const scrollViewRef = useRef(null);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết gói khám</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {packageDetails && (
            <Animated.ScrollView
              ref={scrollViewRef}
              style={[
                styles.modalBody,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateX: swipeDistance },
                    { scale: scaleAnim },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
              scrollEnabled={!isTransitioning}
            >
              <Text style={styles.detailTitle}>{packageDetails.name}</Text>
              <Text style={styles.detailPrice}>
                {packageDetails.price.toLocaleString("vi-VN")} VNĐ
              </Text>
                <Text style={styles.detailDescription}>
                  <Text style={styles.detailSectionInline}>Mô tả: </Text>
                  {packageDetails.description}
                </Text>
              <Text style={styles.detailSectionTitle}>
                Các xét nghiệm bao gồm:
              </Text>
              {packageDetails.details &&
              packageDetails.details.testCategories &&
              packageDetails.details.testCategories.length > 0 ? (
                <View style={styles.testCategoriesContainer}>
                  {packageDetails.details.testCategories.map(
                    (category, index) => (
                      <View key={index} style={styles.categorySection}>
                        {category.name && (
                          <Text style={styles.categoryName}>
                            {translateCategoryName(category.name)}
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
              ) : packageDetails.type ? (
                <View style={styles.typeContainer}>
                  <View style={styles.serviceItem}>
                    <Icon name="medical" size={16} color="#0071CE" />
                    <Text style={styles.serviceText}>
                      Loại gói: {packageDetails.type}
                    </Text>
                  </View>
                  {packageDetails.targetGroup && (
                    <View style={styles.serviceItem}>
                      <Icon name="people" size={16} color="#0071CE" />
                      <Text style={styles.serviceText}>
                        Đối tượng: {packageDetails.targetGroup}
                      </Text>
                    </View>
                  )}
                  <View style={styles.serviceItem}>
                    <Icon name="information-circle" size={16} color="#0071CE" />
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
            </Animated.ScrollView>
          )}

          {/* Enhanced Navigation Buttons */}
          {packages.length > 1 && (
            <View style={styles.navigationButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  isTransitioning && styles.navigationButtonDisabled,
                ]}
                onPress={() => {
                  if (!isTransitioning) {
                    Vibration.vibrate(20);
                    onNavigate("prev");
                  }
                }}
                disabled={isTransitioning}
              >
                <Icon
                  name="chevron-back"
                  size={24}
                  color={isTransitioning ? "#ccc" : "#0071CE"}
                />
              </TouchableOpacity>

              <View style={styles.navigationDots}>
                {packages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.navigationDot,
                      index === currentIndex && styles.navigationDotActive,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  isTransitioning && styles.navigationButtonDisabled,
                ]}
                onPress={() => {
                  if (!isTransitioning) {
                    Vibration.vibrate(20);
                    onNavigate("next");
                  }
                }}
                disabled={isTransitioning}
              >
                <Icon
                  name="chevron-forward"
                  size={24}
                  color={isTransitioning ? "#ccc" : "#0071CE"}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Book Package Button - Only shown when showBookButton is true */}
          {showBookButton && packageDetails && (
            <TouchableOpacity
              style={styles.bookPackageButton}
              onPress={() => onBookPackage(packageDetails.id)}
              disabled={isTransitioning}
            >
              <Text style={styles.bookPackageButtonText}>{bookButtonText}</Text>
              <Icon
                name="calendar-outline"
                size={20}
                color="#fff"
                style={styles.bookPackageButtonIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
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
  detailDescriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  modalBody: {
    padding: 16,
    paddingBottom: 24,
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
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    marginBottom: 8,
  },
  detailSectionInline: {
    fontWeight: "600",
    color: "#444",
  },
  detailDescription: {
    marginTop: 4,
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
    flex: 1,
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
    borderBottomColor: "#eee",
  },
  typeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  // Enhanced navigation styles
  navigationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navigationButton: {
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  navigationButtonDisabled: {
    backgroundColor: "#f8f8f8",
    elevation: 0,
  },
  navigationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navigationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 3,
  },
  navigationDotActive: {
    backgroundColor: "#0071CE",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bookPackageButton: {
    backgroundColor: "#0071CE",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  bookPackageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  bookPackageButtonIcon: {
    marginLeft: 4,
  },
});

export default PackageDetailModal;
