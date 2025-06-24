import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../common/Button";

const TimeSelection = ({
  currentDate,
  currentTime,
  setCurrentTime,
  setStep,
}) => {
  const [processedTimeSlots, setProcessedTimeSlots] = useState([]);

  // Fixed list of all time slots
  const availableTimeSlots = [
    {
      id: "1",
      time: "07:00 - 08:00",
      startHour: 7,
      startMinute: 0,
      available: true,
    },
    {
      id: "2",
      time: "08:00 - 09:00",
      startHour: 8,
      startMinute: 0,
      available: true,
    },
    {
      id: "3",
      time: "09:00 - 10:00",
      startHour: 9,
      startMinute: 0,
      available: false,
    }, // Đã hết
    {
      id: "4",
      time: "10:00 - 11:00",
      startHour: 10,
      startMinute: 0,
      available: true,
    },
    {
      id: "5",
      time: "11:00 - 12:00",
      startHour: 11,
      startMinute: 0,
      available: false,
    }, // Đã hết
    {
      id: "6",
      time: "13:00 - 14:00",
      startHour: 13,
      startMinute: 0,
      available: true,
    },
    {
      id: "7",
      time: "14:00 - 15:00",
      startHour: 14,
      startMinute: 0,
      available: true,
    },
    {
      id: "8",
      time: "15:00 - 16:00",
      startHour: 15,
      startMinute: 0,
      available: false,
    }, // Đã hết
    {
      id: "9",
      time: "16:00 - 17:00",
      startHour: 16,
      startMinute: 0,
      available: true,
    },
  ];
  // Update time slots based on current time
  useEffect(() => {
    const now = new Date();
    // Chuyển đổi chuỗi ngày DD/MM/YYYY từ currentDate thành đối tượng Date
    let isToday = false;

    if (currentDate) {
      const [day, month, year] = currentDate
        .split("/")
        .map((num) => parseInt(num, 10));
      const selectedDate = new Date(year, month - 1, day); // month là 0-based trong JS Date

      // So sánh ngày, tháng, năm để xác định có phải hôm nay không
      isToday =
        selectedDate.getDate() === now.getDate() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getFullYear() === now.getFullYear();
    }

    console.log("Ngày được chọn có phải hôm nay không:", isToday);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const updatedSlots = availableTimeSlots.map((slot) => {
      // Chỉ kiểm tra thời gian đã qua nếu ngày được chọn là hôm nay
      if (isToday) {
        const isPast =
          slot.startHour < currentHour ||
          (slot.startHour === currentHour && slot.startMinute <= currentMinute);

        // In ra log để debug
        if (isPast) {
          console.log(
            `Khung giờ ${slot.time} đã qua (${currentHour}:${currentMinute})`
          );
        }

        return {
          ...slot,
          // Đánh dấu không khả dụng nếu đã được đánh dấu không khả dụng HOẶC đã qua
          available: slot.available && !isPast,
          isPast: isPast, // Thêm trường để phân biệt lý do không khả dụng
        };
      }

      // Nếu không phải hôm nay, giữ nguyên trạng thái khả dụng ban đầu
      return { ...slot, isPast: false };
    });

    setProcessedTimeSlots(updatedSlots);

    // Xóa thời gian đã chọn nếu nó giờ không còn khả dụng
    if (currentTime) {
      const selectedSlot = updatedSlots.find(
        (slot) => slot.id === currentTime.id
      );
      if (selectedSlot && !selectedSlot.available) {
        setCurrentTime(null);
      }
    }
  }, [currentDate]);

  // Helper function to check if a time slot is available
  const isTimeSlotAvailable = (timeSlot) => {
    return timeSlot.available !== false;
  };

  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotAvailable(timeSlot)) {
      setCurrentTime(timeSlot);
    }
  };

  const handleConfirm = () => {
    if (currentTime) {
      setStep(2); // Return to main appointment selection screen
    }
  };

  const renderTimeSlot = ({ item }) => {
    const isSelected = currentTime?.id === item.id;
    const isAvailable = isTimeSlotAvailable(item);

    return (
      <TouchableOpacity
        style={[
          styles.timeSlotCard,
          isSelected && styles.selectedTimeSlotCard,
          !isAvailable && styles.unavailableTimeSlotCard,
        ]}
        onPress={() => handleTimeSelect(item)}
        disabled={!isAvailable}
        activeOpacity={0.7}
      >
        <View style={styles.timeSlotContent}>
          <Text
            style={[
              styles.timeText,
              isSelected && styles.selectedTimeText,
              !isAvailable && styles.unavailableTimeText,
            ]}
          >
            {item.time}
          </Text>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Icon name="checkmark-circle" size={20} color="#0071CE" />
            </View>
          )}
          {!isAvailable && (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableLabel}>
                {item.isPast ? "Đã qua" : "Đã hết"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Chọn Giờ Khám</Text>

      <View style={styles.dateInfoContainer}>
        <Icon name="calendar" size={18} color="#0071CE" />
        <Text style={styles.dateInfo}>Ngày khám: {currentDate}</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#0071CE" }]} />
          <Text style={styles.legendText}>Đã chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
            ]}
          />
          <Text style={styles.legendText}>Có thể chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f5f5f5" }]} />
          <Text style={styles.legendText}>Đã hết/Đã qua</Text>
        </View>
      </View>

      {processedTimeSlots && processedTimeSlots.length > 0 ? (
        <FlatList
          data={processedTimeSlots}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.timeSlotRow}
          renderItem={renderTimeSlot}
          contentContainerStyle={styles.timeSlotsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="time-outline" size={40} color="#999" />
          <Text style={styles.emptyStateText}>
            Không có khung giờ nào khả dụng
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Vui lòng chọn ngày khám khác
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Xác Nhận Giờ Khám"
          onPress={handleConfirm}
          disabled={!currentTime}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  dateInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateInfo: {
    fontSize: 16,
    color: "#0071CE",
    fontWeight: "500",
    marginLeft: 8,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  timeSlotsList: {
    paddingBottom: 16,
  },
  timeSlotRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeSlotCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedTimeSlotCard: {
    borderColor: "#0071CE",
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },
  unavailableTimeSlotCard: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  timeSlotContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  timeText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedTimeText: {
    color: "#0071CE",
    fontWeight: "600",
  },
  unavailableTimeText: {
    color: "#999",
  },
  checkmarkContainer: {
    marginTop: 8,
  },
  unavailableContainer: {
    marginTop: 4,
    alignItems: "center",
  },
  unavailableLabel: {
    fontSize: 11,
    color: "#f44336",
    marginTop: 2,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f5f7fa",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default TimeSelection;
