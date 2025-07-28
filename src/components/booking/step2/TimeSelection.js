import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Button from "../../common/Button";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getDoctorSchedule } from "../../../services/appointmentService";
import colors from "../../../constant/colors";

const { width: screenWidth } = Dimensions.get("window");

const TimeSelection = ({
  currentDate,
  currentTime,
  setCurrentTime,
  setStep,
  selectedDoctor,
}) => {
  // State cho lịch trình bác sĩ
  const [schedule, setSchedule] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Lấy lịch trình bác sĩ khi component mount hoặc currentDate thay đổi
  React.useEffect(() => {
    const fetchDoctorSchedule = async () => {
      if (!selectedDoctor?.doctorId || !currentDate) return;

      setLoading(true);
      setError(null);
      try {
        const [day, month, year] = currentDate.split("/").map(Number);
        const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;
        const response = await getDoctorSchedule(
          selectedDoctor.doctorId,
          dateStr
        );

        if (response && response.isSuccess && response.value) {
          setSchedule(response.value);
        } else {
          setError("Không lấy được lịch trình bác sĩ.");
        }
      } catch (err) {
        setError("Lỗi khi lấy lịch trình bác sĩ.");
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSchedule();
  }, [selectedDoctor?.doctorId, currentDate]);

  // Xử lý chọn khung giờ
  const handleTimeSelect = (timeSlot) => {
    setCurrentTime(timeSlot);
  };

  // Xử lý tiếp tục đến bước tiếp theo
  const handleContinue = () => {
    if (currentTime) {
      setStep(2); // Chuyển sang bước xác nhận thông tin
    }
  };

  // Hiển thị loading/error nếu dữ liệu chưa sẵn sàng
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Đang tải lịch trình bác sĩ...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!currentDate || !selectedDoctor?.doctorId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Vui lòng chọn ngày và bác sĩ trước khi chọn giờ.
        </Text>
      </View>
    );
  }

  // Lọc ngày hiện tại trong lịch trình để hiển thị khung giờ
  const currentSchedule = schedule.find(
    (s) => s.date === currentDate.replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1")
  );

  // Lọc timeSlots theo yêu cầu
  const filteredTimeSlots =
    currentSchedule?.timeSlots?.filter((slot) => {
      if (!slot.isAvailable) return false;
      const [hour, minute] = slot.time.split(":").map(Number);
      const timeValue = hour * 60 + minute;
      return timeValue >= 420 && timeValue <= 1020; // Giữ nguyên từ 7:00 đến 17:00
    }) || [];

  return (
    <View style={styles.container}>
      <View style={styles.timeSlotsContainer}>
        {filteredTimeSlots.length > 0 ? (
          filteredTimeSlots.map((slot, index) => {
            const isSelected = currentTime?.time === slot.time;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
                onPress={() => handleTimeSelect(slot)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    isSelected && styles.selectedTimeSlotText,
                  ]}
                >
                  {slot.time.slice(0, 5)}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noSlotsText}>
            Không có khung giờ nào khả dụng cho ngày này.
          </Text>
        )}
      </View>

      {/* Chú thích */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.selectedLegendDot]} />
          <Text style={styles.legendText}>Đã chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unavailableLegendDot]} />
          <Text style={styles.legendText}>Không khả dụng</Text>
        </View>
      </View>

      <Button
        title="Tiếp Tục"
        onPress={handleContinue}
        disabled={!currentTime}
        style={[
          styles.continueButton,
          {
            opacity: currentTime ? 1 : 0.5,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    width: (screenWidth - 48) / 4 - 8, // 4 cột, trừ padding và margin
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.background,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textDark,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTimeSlotText: {
    color: colors.white,
    fontWeight: "700",
  },
  unavailableTimeSlot: {
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  unavailableTimeSlotText: {
    color: colors.gray,
  },
  noSlotsText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.background,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  selectedLegendDot: {
    backgroundColor: colors.primaryBlue,
  },
  unavailableLegendDot: {
    backgroundColor: colors.gray,
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  continueButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.primaryOrange,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default TimeSelection;
