import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Button from "../../common/Button";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../../constant/colors";

const DateSelection = ({
  currentDate,
  setCurrentDate,
  setCurrentTime,
  setStep,
}) => {
  const [systemTime, setSystemTime] = React.useState(null);
  const [systemTimeLoading, setSystemTimeLoading] = React.useState(true);
  const [systemTimeError, setSystemTimeError] = React.useState(null);

  // Lấy thời gian hệ thống khi component được mount
  React.useEffect(() => {
    const fetchSystemTime = async () => {
      setSystemTimeLoading(true);
      setSystemTimeError(null);
      try {
        const today = new Date("2025-07-29T02:47:00+07:00"); // Current date and time
        setSystemTime(today);
      } catch (err) {
        setSystemTimeError("Lỗi khi lấy thời gian hệ thống.");
      } finally {
        setSystemTimeLoading(false);
      }
    };
    fetchSystemTime();
  }, []);

  const today = systemTime || new Date("2025-07-29T02:47:00+07:00");
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Cài đặt hiển thị lịch
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth);
  const [displayYear, setDisplayYear] = React.useState(currentYear);

  // Tạo danh sách 3 ngày tiếp theo
  const getNextThreeDays = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(currentDay + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = getNextThreeDays();

  // Kiểm tra ngày có trong danh sách 3 ngày tiếp theo không
  const isDateAvailable = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);
    return availableDates.some((availableDate) => {
      const checkDate = new Date(availableDate);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate.getTime() === dateToCheck.getTime();
    });
  };

  // Kiểm tra ngày có khả dụng không
  const isDayAvailable = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    const todayDate = new Date(today);
    dateToCheck.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    // Không cho phép chọn ngày trong quá khứ
    if (dateToCheck < todayDate) {
      return false;
    }

    return isDateAvailable(year, month, day);
  };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    setCurrentDate(null);
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
    setCurrentDate(null);
  };

  const handleDateSelect = (day) => {
    const month = displayMonth + 1;
    const selectedDate = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${displayYear}`;
    setCurrentDate(selectedDate);
    setCurrentTime(null);
  };

  const handleContinue = () => {
    if (currentDate) {
      setStep(2.2); // Chuyển sang chọn thời gian
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.day}>
          <Text style={styles.dayText}></Text>
        </View>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const selectedDay = currentDate
        ? parseInt(currentDate.split("/")[0])
        : null;
      const isSelected = selectedDay === day;
      const isAvailable = isDayAvailable(displayYear, displayMonth, day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            isSelected && styles.selectedDay,
            !isAvailable && styles.unavailableDay,
          ]}
          onPress={() => {
            if (isAvailable) {
              handleDateSelect(day);
            }
          }}
          disabled={!isAvailable}
          activeOpacity={isAvailable ? 0.7 : 1}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              !isAvailable && styles.unavailableDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (systemTimeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Đang lấy thời gian hệ thống...</Text>
      </View>
    );
  }
  if (systemTimeError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{systemTimeError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendar}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousMonth}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            Tháng {displayMonth + 1} - {displayYear}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
            <View key={day} style={styles.weekDayItem}>
              <Text
                style={[
                  styles.weekDayText,
                  (index === 0 || index === 6) && styles.weekendText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

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
      </View>

      <Button
        title="Tiếp Tục"
        onPress={handleContinue}
        disabled={!currentDate}
        style={[styles.continueButton, { opacity: currentDate ? 1 : 0.5 }]}
      />
    </View>
  );
};

// Styles remain the same as provided in the original DateSelection component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  calendar: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.background,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryBlue,
    textAlign: "center",
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
  },
  weekendText: {
    color: colors.primaryOrange,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textDark,
  },
  selectedDay: {
    backgroundColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: "700",
  },
  unavailableDay: {
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  unavailableDayText: {
    color: colors.gray,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 12,
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

export default DateSelection;
