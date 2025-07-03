import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Card from "../../components/common/Card";
import { getCheckupRecordsByDateAndStatus } from "../../services/checkupRecordService";

const TodayCheckupScreen = () => {
  const navigation = useNavigation();
  const [todayCheckups, setTodayCheckups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const fetchTodayCheckups = useCallback(async () => {
    try {
      setLoading(true);

      // Sử dụng ngày hiện tại
      const today = getTodayDate();
      console.log("Fetching appointments for date:", today);

      const response = await getCheckupRecordsByDateAndStatus(today, "Paid");

      if (response.isSuccess) {
        console.log("API Response:", response);
        setTodayCheckups(response.value.items);
      } else {
        console.warn("Failed to fetch appointments:", response);
        Alert.alert("Lỗi", "Không thể tải danh sách lịch khám ngày hôm nay");
      }
    } catch (error) {
      console.error("Error fetching today checkups:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải danh sách lịch khám");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTodayCheckups();
    setRefreshing(false);
  }, [fetchTodayCheckups]);

  useEffect(() => {
    fetchTodayCheckups();
  }, [fetchTodayCheckups]);

  const handleCheckupPress = useCallback(
    (checkup) => {
      console.log("Navigating to CheckupSteps with:", {
        checkupCode: checkup.code,
        patientName: checkup.fullname,
        bookingDate: checkup.bookingDate,
      });

      try {
        navigation.navigate("CheckupSteps", {
          checkupCode: checkup.code,
          patientName: checkup.fullname,
          bookingDate: checkup.bookingDate,
        });
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Lỗi", "Không thể mở màn hình chi tiết xét nghiệm");
      }
    },
    [navigation]
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderCheckupItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => {
        console.log("Card pressed for item:", item.code);
        handleCheckupPress(item);
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.orderNumber}>
          <Text style={styles.orderNumberText}>
            {item.numericalOrder || "N/A"}
          </Text>
        </View>
        <View style={styles.checkupInfo}>
          <Text style={styles.patientName}>{item.fullname}</Text>
          <Text style={styles.checkupCode}>Mã: {item.code}</Text>
          <Text style={styles.bookingTime}>
            Giờ đặt: {formatTime(item.bookingDate)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, styles.paidStatus]}>
              <Text style={styles.statusText}>Đã thanh toán</Text>
            </View>
          </View>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {todayCheckups.length === 0 && !loading ? (
        <View style={styles.container}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Lịch khám hôm nay</Text>
          </View>
          <Text style={styles.subtitle}>
            Vui lòng tiến hành xét nghiệm thêm. Nếu có vấn đề, vui lòng ấn vào
            biểu tượng điện thoại phía trên để yêu cầu hỗ trợ.
          </Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có lịch khám nào hôm nay</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={todayCheckups}
          renderItem={renderCheckupItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CAF50"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Lịch khám hôm nay</Text>
              </View>
              <Text style={styles.subtitle}>
                Vui lòng tiến hành xét nghiệm thêm. Nếu có vấn đề, vui lòng ấn
                vào biểu tượng điện thoại phía trên để yêu cầu hỗ trợ.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 25, // Adjust for status bar height
    paddingBottom: 20, // Adjust for bottom safe area
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    padding: 0,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  orderNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderNumberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkupInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  checkupCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  bookingTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidStatus: {
    backgroundColor: "#E8F5E8",
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default TodayCheckupScreen;
