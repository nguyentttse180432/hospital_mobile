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
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [systemTime] = React.useState(new Date("2025-07-29T03:19:00+07:00"));

  // Fetch doctor schedule
  React.useEffect(() => {
    const fetchDoctorSchedule = async () => {
      if (!selectedDoctor?.doctorId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getDoctorSchedule(selectedDoctor.doctorId);
        console.log("Fetched Doctor Schedule:", response.value);

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
  }, [selectedDoctor?.doctorId]);

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

    const timeDate = new Date(slot.time);
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

  // Handle time slot selection
  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotAvailable(timeSlot)) {
      const formattedSlot = {
        ...timeSlot,
        displayTime: formatTimeFromISO(timeSlot.time),
      };
      setCurrentTime(formattedSlot);
    }
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (currentTime) {
      setStep(2); // Navigate to confirmation step
    }
  };

  // Handle select another date
  const handleSelectAnotherDate = () => {
    setStep(2.3); // Navigate back to date selection
  };

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
  if (!schedule) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không có dữ liệu lịch trình bác sĩ.
        </Text>
      </View>
    );
  }

  const filteredTimeSlots =
    schedule.timeSlots?.filter((slot) => isTimeSlotAvailable(slot)) || [];
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
        {isToday && (
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primaryOrange} />
            <Text style={styles.noteText}>
              Lịch phải được đặt trước ít nhất 1 tiếng (sau 04:19)
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timeSlotsContainer}>
        {filteredTimeSlots.length > 0 ? (
          <View style={styles.timeSlotsGrid}>
            {filteredTimeSlots.map((slot, index) => {
              const displayTime = formatTimeFromISO(slot.time);
              const isSelected = currentTime?.time === slot.time;

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
            <Text style={styles.noSlotsText}>
              Không có khung giờ khả dụng
            </Text>
            <Text style={styles.noSlotsSubText}>
              {isToday
                ? "Hôm nay không còn khung giờ nào phù hợp (sau 04:19)."
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
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primaryOrange}10`,
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    color: colors.primaryOrange,
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
  timeSlotsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
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
    justifyContent: "space-between",
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