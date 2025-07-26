import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Dimensions,
  ScrollView,
  PanResponder,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/common/ScreenContainer";

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

const PackageDetailScreen = ({ navigation, route }) => {
  const {
    packages,
    initialIndex = 0,
    onBookPackage,
    showBookButton = false,
    bookButtonText = "Đặt gói",
    selectedPatient,
    defaultPatient,
  } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const translateX = useRef(new Animated.Value(0)).current;
  const scrollViewRefs = useRef([]);
  const currentIndexRef = useRef(initialIndex);

  useEffect(() => {
    const validIndex = Math.max(0, Math.min(initialIndex, packages.length - 1));
    setCurrentIndex(validIndex);
    currentIndexRef.current = validIndex;
    translateX.setValue(-validIndex * width);

    scrollViewRefs.current = Array(packages.length)
      .fill()
      .map(() => null);
  }, [initialIndex, packages.length]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (scrollViewRefs.current[currentIndex]) {
      scrollViewRefs.current[currentIndex].scrollTo({ y: 0, animated: false });
    }
  }, [currentIndex]);

  const animateToIndex = (targetIndex, withVibration = true) => {
    if (targetIndex < 0 || targetIndex >= packages.length || isTransitioning) {
      return;
    }

    if (targetIndex === currentIndexRef.current) {
      Animated.spring(translateX, {
        toValue: -targetIndex * width,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      return;
    }

    setIsTransitioning(true);
    if (withVibration) {
      Vibration.vibrate(20);
    }

    setCurrentIndex(targetIndex);
    currentIndexRef.current = targetIndex;

    Animated.spring(translateX, {
      toValue: -targetIndex * width,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setIsTransitioning(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 2;
      },
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        translateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const currentPos = -currentIndexRef.current * width;
        let newPos = currentPos + dx;

        if (newPos > 0) {
          newPos = dx * 0.3;
        } else if (newPos < -(packages.length - 1) * width) {
          const excess = newPos + (packages.length - 1) * width;
          newPos = -(packages.length - 1) * width + excess * 0.3;
        }

        translateX.setValue(newPos);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        setScrollEnabled(true);

        let targetIndex = currentIndexRef.current;

        const shouldNavigate =
          Math.abs(dx) > SWIPE_THRESHOLD ||
          Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD;

        if (shouldNavigate) {
          if (dx < 0 && currentIndexRef.current < packages.length - 1) {
            targetIndex = currentIndexRef.current + 1;
          } else if (dx > 0 && currentIndexRef.current > 0) {
            targetIndex = currentIndexRef.current - 1;
          }
        }

        animateToIndex(targetIndex);
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        animateToIndex(currentIndexRef.current, false);
      },
    })
  ).current;

  const navigateToPackage = (direction) => {
    if (isTransitioning) return;

    const targetIndex = currentIndexRef.current + direction;
    animateToIndex(targetIndex);
  };

  const handleBookPackage = () => {
    if (packages[currentIndex]) {
      navigation.navigate("AppointmentScreen", {
        selectedProfile: selectedPatient || defaultPatient,
        currentPackage: packages[currentIndex],
        initialStep: 2,
      });
    }
  };

  const shouldShowBookButton =
    showBookButton && (selectedPatient || defaultPatient);

  if (!packages || packages.length === 0) {
    return (
      <ScreenContainer
        title="Chi tiết gói khám"
        onBack={() => navigation.goBack()}
        hasBottomTabs={true}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin gói khám
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="Chi tiết gói khám"
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.mainContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.packagesContainer,
            {
              width: width * packages.length,
              transform: [{ translateX }],
            },
          ]}
        >
          {packages.map((packageItem, index) => (
            <View
              key={`${packageItem.id}-${index}`}
              style={styles.packageContainer}
            >
              <ScrollView
                ref={(ref) => (scrollViewRefs.current[index] = ref)}
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={scrollEnabled}
                bounces={false}
              >
                {renderPackageContent(packageItem)}
              </ScrollView>
            </View>
          ))}
        </Animated.View>

        {packages.length > 1 && (
          <View style={styles.swipeHintContainer}>
            <Text style={styles.swipeHintText}>
              Vuốt trái/phải để xem các gói khác ({currentIndex + 1}/
              {packages.length})
            </Text>
          </View>
        )}

        <View style={styles.controlContainer}>
          {packages.length > 1 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonLeft,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={() => navigateToPackage(-1)}
              disabled={currentIndex === 0 || isTransitioning}
            >
              <Icon
                name="chevron-back"
                size={20}
                color={currentIndex === 0 ? "#ccc" : "#0071CE"}
              />
            </TouchableOpacity>
          )}

          {shouldShowBookButton && packages[currentIndex] && (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookPackage}
              disabled={isTransitioning}
            >
              <Text style={styles.bookButtonText}>{bookButtonText}</Text>
              <Icon
                name="calendar-outline"
                size={16}
                color="#fff"
                style={styles.bookButtonIcon}
              />
            </TouchableOpacity>
          )}

          {packages.length > 1 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonRight,
                currentIndex === packages.length - 1 &&
                  styles.navButtonDisabled,
              ]}
              onPress={() => navigateToPackage(1)}
              disabled={currentIndex === packages.length - 1 || isTransitioning}
            >
              <Icon
                name="chevron-forward"
                size={20}
                color={
                  currentIndex === packages.length - 1 ? "#ccc" : "#0071CE"
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );

  function renderPackageContent(packageItem) {
    return (
      <>
        <View style={styles.packageHeader}>
          <Text style={styles.packageTitle}>{packageItem.name}</Text>
          <Text style={styles.packagePrice}>
            {packageItem.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.packageDescription}>
            <Text style={styles.sectionLabel}>Mô tả: </Text>
            {packageItem.description}
          </Text>
        </View>

        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>Các xét nghiệm bao gồm:</Text>

          {packageItem.details &&
          packageItem.details.testCategories &&
          packageItem.details.testCategories.length > 0 ? (
            <View style={styles.testCategoriesContainer}>
              {packageItem.details.testCategories.map((category, index) => (
                <View key={index} style={styles.categorySection}>
                  {category.name && (
                    <Text style={styles.categoryName}>
                      {translateCategoryName(category.name)}
                    </Text>
                  )}

                  {category.tests && category.tests.length > 0 ? (
                    category.tests.map((test, testIndex) => (
                      <View key={testIndex} style={styles.testItem}>
                        <Icon
                          name="checkmark-circle"
                          size={16}
                          color="#0071CE"
                        />
                        <Text style={styles.testText}>{test.name}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.testItem}>
                      <Icon
                        name="information-circle-outline"
                        size={16}
                        color="#0071CE"
                      />
                      <Text style={styles.testText}>
                        Danh sách xét nghiệm đang được cập nhật
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : packageItem.type ? (
            <View style={styles.typeContainer}>
              <View style={styles.testItem}>
                <Icon name="medical" size={16} color="#0071CE" />
                <Text style={styles.testText}>
                  Loại gói: {packageItem.type}
                </Text>
              </View>
              {packageItem.targetGroup && (
                <View style={styles.testItem}>
                  <Icon name="people" size={16} color="#0071CE" />
                  <Text style={styles.testText}>
                    Đối tượng: {packageItem.targetGroup}
                  </Text>
                </View>
              )}
              <View style={styles.testItem}>
                <Icon name="information-circle" size={16} color="#0071CE" />
                <Text style={styles.testText}>
                  Chi tiết xét nghiệm sẽ được cung cấp tại bệnh viện
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noTestsText}>
              Không có thông tin về các xét nghiệm
            </Text>
          )}
        </View>
      </>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 50,
  },
  packagesContainer: {
    flexDirection: "row",
    flex: 1,
  },
  packageContainer: {
    width: width,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  packageHeader: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  packageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0071CE",
  },
  descriptionSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 8,
  },
  packageDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  sectionLabel: {
    fontWeight: "600",
    color: "#444",
  },
  testsSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 16,
  },
  testCategoriesContainer: {
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  testText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  typeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  noTestsText: {
    fontSize: 15,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  controlContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    left: 0,
    right: 0,
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  navButtonLeft: {
    marginRight: 8,
  },
  navButtonRight: {
    marginLeft: 8,
  },
  navButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  bookButton: {
    backgroundColor: "#0071CE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  bookButtonIcon: {
    marginLeft: 2,
  },
  swipeHintContainer: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  swipeHintText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
});

export default PackageDetailScreen;
