import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  StatusBar,
  Vibration,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SwipeGesture } from "react-native-swipe-gesture-handler";

const { width } = Dimensions.get("window");

const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

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
  return translations[name] || name;
};

const PackageDetailModal = ({
  visible,
  onClose,
  packages,
  initialIndex = 0,
  onBookPackage,
  showBookButton = false,
  bookButtonText = "Đặt lịch gói này",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const scrollViewRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, packages]);

  useEffect(() => {
    translateX.setValue(0);
    opacity.setValue(1);
    scale.setValue(1);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [currentIndex]);

  const currentPackage = packages[currentIndex];

  const navigateToPackage = (direction) => {
    if (isTransitioning) return;

    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= packages.length) return;

    setIsTransitioning(true);
    Vibration.vibrate(20);

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction > 0 ? -width : width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setCurrentIndex(newIndex);
        translateX.setValue(direction > 0 ? width : -width);

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setIsTransitioning(false);
          } else {
            console.warn("Animation in failed");
            setIsTransitioning(false);
          }
        });
      } else {
        console.warn("Animation out failed");
        setIsTransitioning(false);
      }
    });
  };

  const onSwipePerformed = (action) => {
    if (isTransitioning) return;
    if (action === "left") {
      if (currentIndex < packages.length - 1) {
        navigateToPackage(1);
      }
    } else if (action === "right") {
      if (currentIndex > 0) {
        navigateToPackage(-1);
      }
    }
  };

  if (!currentPackage) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          { paddingTop: StatusBar.currentHeight || 0 },
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết gói khám</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <SwipeGesture
            style={{ flex: 1 }}
            onSwipePerformed={onSwipePerformed}
            config={{
              velocityThreshold: SWIPE_VELOCITY_THRESHOLD,
              directionalOffsetThreshold: SWIPE_THRESHOLD,
            }}
          >
            <Animated.ScrollView
              ref={scrollViewRef}
              style={[
                styles.modalBody,
                {
                  opacity: opacity,
                  transform: [{ translateX: translateX }, { scale: scale }],
                },
              ]}
              scrollEnabled={!isTransitioning}
              showsVerticalScrollIndicator={true}
              horizontal={false}
            >
              <Text style={styles.detailTitle}>{currentPackage.name}</Text>
              <Text style={styles.detailPrice}>
                {currentPackage.price.toLocaleString("vi-VN")} VNĐ
              </Text>
              <Text style={styles.detailDescription}>
                <Text style={styles.detailSectionInline}>Mô tả: </Text>
                {currentPackage.description}
              </Text>

              <Text style={styles.detailSectionTitle}>
                Các xét nghiệm bao gồm:
              </Text>

              {currentPackage.details &&
              currentPackage.details.testCategories &&
              currentPackage.details.testCategories.length > 0 ? (
                <View style={styles.testCategoriesContainer}>
                  {currentPackage.details.testCategories.map(
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
              ) : currentPackage.type ? (
                <View style={styles.typeContainer}>
                  <View style={styles.serviceItem}>
                    <Icon name="medical" size={16} color="#0071CE" />
                    <Text style={styles.serviceText}>
                      Loại gói: {currentPackage.type}
                    </Text>
                  </View>
                  {currentPackage.targetGroup && (
                    <View style={styles.serviceItem}>
                      <Icon name="people" size={16} color="#0071CE" />
                      <Text style={styles.serviceText}>
                        Đối tượng: {currentPackage.targetGroup}
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
          </SwipeGesture>

          {packages.length > 1 && (
            <View style={styles.swipeHintContainer}>
              <Text style={styles.swipeHintText}>
                Vuốt trái/phải để xem các gói khác
              </Text>
            </View>
          )}

          {showBookButton && currentPackage && (
            <TouchableOpacity
              style={styles.bookPackageButton}
              onPress={() => onBookPackage(currentPackage.id)}
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
  modalBody: {
    padding: 16,
    paddingBottom: 0,
    minHeight: 300, // Ensure sufficient touch area
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
    marginLeft: 12,
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
  swipeHintContainer: {
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  swipeHintText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
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
