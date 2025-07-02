import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/common/ScreenContainer";

const NotificationsScreen = () => {
  // Dữ liệu mẫu cho thông báo
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Nhắc nhở lịch khám",
      message: "Bạn có lịch khám với BS. Nguyễn Văn A vào ngày mai lúc 9:00",
      time: "30 phút trước",
      read: false,
      type: "appointment",
    },
    {
      id: "2",
      title: "Kết quả xét nghiệm",
      message: "Kết quả xét nghiệm máu của bạn đã có. Vui lòng kiểm tra.",
      time: "2 giờ trước",
      read: false,
      type: "result",
    },
    {
      id: "3",
      title: "Khuyến mãi gói khám",
      message: "Giảm 20% gói khám sức khỏe tổng quát trong tháng 7",
      time: "1 ngày trước",
      read: true,
      type: "promotion",
    },
    {
      id: "4",
      title: "Cập nhật ứng dụng",
      message: "Ứng dụng đã được cập nhật với nhiều tính năng mới",
      time: "3 ngày trước",
      read: true,
      type: "system",
    },
  ]);

  const getIconForType = (type) => {
    switch (type) {
      case "appointment":
        return { name: "calendar", color: "#1e88e5" };
      case "result":
        return { name: "document-text", color: "#4CAF50" };
      case "promotion":
        return { name: "gift", color: "#ff6b6b" };
      case "system":
        return { name: "information-circle", color: "#757575" };
      default:
        return { name: "notifications", color: "#757575" };
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const renderItem = ({ item }) => {
    const iconInfo = getIconForType(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          item.read && styles.notificationCardRead,
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconInfo.color}20` },
          ]}
        >
          <Icon name={iconInfo.name} size={24} color={iconInfo.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Thông báo</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Đánh dấu đã đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  markAllText: {
    fontSize: 14,
    color: "#1e88e5",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  notificationCardRead: {
    backgroundColor: "#f9f9f9",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1e88e5",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});

export default NotificationsScreen;
