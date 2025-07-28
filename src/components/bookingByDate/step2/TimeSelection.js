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
import { getDoctorScheduleByDate } from "../../../services/appointmentService";
import colors from "../../../constant/colors";

const { width: screenWidth } = Dimensions.get("window");

const TimeSelection = ({
  currentDate,
  currentTime,
  setCurrentTime,
  setStep,
}) => {
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [systemTime] = React.useState(new Date("2025-07-29T03:13:00+07:00"));

  // Fetch schedule by date
  React.useEffect(() => {
    const fetchSchedule = async () => {
      if (!currentDate) return;

      setLoading(true);
      setError(null);
      try {
        const [day, month, year] = currentDate.split("/").map(Number);
        const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;
        const response = await getDoctorScheduleByDate(dateString);
        console.log("Fetched Schedule:", response.value);

        if (response && response.isSuccess && response.value) {
          setSchedule(response.value);
        } else {
          setError("Không lấy được lịch trình.");
        }
      } catch (err) {
        setError("Lỗi khi lấy lịch trình.");
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [currentDate]);

  // Convert ISO time to HH:MM format
  const formatTimeFromISO = (isoString) => {
    const date = new Date(isoString);
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (slot) => {
    if (!slot.isAvailable) return false;

    const timeDate = new Date(slot.startBlock);
    const slotHour = timeDate.getUTCHours();
    const slotMinute = timeDate.getUTCMinutes();
    const slotTimeInMinutes = slotHour * 60 + slotMinute;

    // Only show slots within working hours (7:00 - 17:00)
    if (slotTimeInMinutes < 420 || slotTimeInMinutes > 1020) {
      return false;
    }

    // Check if it's today
    const [day, month, year] = currentDate.split("/").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date(systemTime);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() !== today.getTime()) {
      return true;
    }

    // For today, ensure slot is at least 1 hour after current time
    const currentHour = systemTime.getHours();
    const currentMinute = systemTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const minimumTimeInMinutes = currentTimeInMinutes + 60;

    return slotTimeInMinutes >= minimumTimeInMinutes;
  };

  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotAvailable(timeSlot)) {
      const formattedSlot = {
        ...timeSlot,
        displayTime: formatTimeFromISO(timeSlot.startBlock),
      };
      setCurrentTime(formattedSlot);
    }
  };

  const handleContinue = () => {
    if (currentTime) {
      setStep(2.3); // Navigate to department selection
    }
  };

  const handleSelectAnotherDate = () => {
    setStep(2.1); // Navigate back to date selection
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Đang tải lịch trình...</Text>
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
  if (!currentDate) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Vui lòng chọn ngày trước khi chọn giờ.
        </Text>
      </View>
    );
  }
  if (!schedule) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không có dữ liệu lịch trình.</Text>
      </View>
    );
  }

  const filteredTimeSlots = schedule.blocks?.filter(isTimeSlotAvailable) || [];
  const isToday = (() => {
    const [day, month, year] = currentDate.split("/").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date(systemTime);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  })();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Chọn giờ khám cho ngày {currentDate}
        </Text>
       
      </View>

      <View style={styles.timeSlotsContainer}>
        {filteredTimeSlots.length > 0 ? (
          <View style={styles.timeSlotsGrid}>
            {filteredTimeSlots.map((slot, index) => {
              const displayTime = formatTimeFromISO(slot.startBlock);
              const isSelected = currentTime?.startBlock === slot.startBlock;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.selectedTimeSlot,
                    !isSelected && styles.availableTimeSlot,
                  ]}
                  onPress={() => handleTimeSelect(slot)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.selectedTimeSlotText,
                    ]}
                  >
                    {displayTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noSlotsContainer}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.textLight}
              style={styles.noSlotsIcon}
            />
            <Text style={styles.noSlotsText}>Không có khung giờ khả dụng</Text>
            <Text style={styles.noSlotsSubText}>
              {isToday
                ? "Hôm nay không còn khung giờ nào phù hợp (sau 04:13)."
                : "Không có lịch trống cho ngày này."}
            </Text>
            <Button
              title="Chọn ngày khác"
              onPress={handleSelectAnotherDate}
              style={styles.selectAnotherDateButton}
              textStyle={styles.selectAnotherDateText}
            />
          </View>
        )}
      </View>

      {filteredTimeSlots.length > 0 && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.selectedLegendDot]} />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.availableLegendDot]} />
            <Text style={styles.legendText}>Khả dụng</Text>
          </View>
        </View>
      )}

      <Button
        title="Tiếp tục"
        onPress={handleContinue}
        disabled={!currentTime}
        style={[styles.continueButton, !currentTime && styles.disabledButton]}
        textStyle={styles.continueButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "left",
    marginBottom: 8,
  },
  timeSlotsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 200,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    width: (screenWidth - 72) / 3 - 8, // 3 columns with spacing
    paddingVertical: 14,
    margin: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.grayLight,
    backgroundColor: colors.white,
  },
  availableTimeSlot: {
    backgroundColor: `${colors.primaryBlue}10`,
    borderColor: colors.primaryBlue,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  selectedTimeSlotText: {
    color: colors.white,
    fontWeight: "700",
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noSlotsIcon: {
    marginBottom: 24,
    opacity: 0.7,
  },
  noSlotsText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 12,
  },
  noSlotsSubText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  selectAnotherDateButton: {
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "auto",
  },
  selectAnotherDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  selectedLegendDot: {
    backgroundColor: colors.primaryBlue,
  },
  availableLegendDot: {
    backgroundColor: `${colors.primaryBlue}10`,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  legendText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colors.primaryBlue,
    marginBottom: 50,
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    margin: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
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
    margin: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primaryOrange,
    textAlign: "center",
    lineHeight: 26,
  },
});

export default TimeSelection;
