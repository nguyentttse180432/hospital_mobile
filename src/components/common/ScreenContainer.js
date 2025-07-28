import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomTabSafeStyle } from "../../utils/safeAreaHelper";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../../constant/colors"; // Import file colors.js mới

const ScreenContainer = ({
  children,
  style,
  scrollable = true,
  header,
  title,
  headerBackgroundColor = colors.primaryBlue,
  leftComponent,
  hasBottomTabs = false,
  onBack,
}) => {
  const Container = scrollable ? ScrollView : View;
  const insets = useSafeAreaInsets();

  // Lấy chiều cao thực tế của status bar
  const STATUS_BAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

  // Chỉ áp dụng padding cho status bar nếu không được đặt rõ ràng là 0 trong style
  const topPadding = style && style.paddingTop === 0 ? 0 : STATUS_BAR_HEIGHT;

  // Áp dụng style cho bottom tab safe area nếu cần
  const bottomTabStyle = hasBottomTabs ? getBottomTabSafeStyle(insets) : {};

  const renderStandardHeader = () => {
    if (!title) return null;
    return (
      <View
        style={[
          styles.standardHeader,
          { backgroundColor: headerBackgroundColor },
        ]}
      >
        <View style={styles.headerRow}>
          {(leftComponent || onBack) && (
            <View style={styles.headerLeftContainer}>
              {leftComponent || (
                <TouchableOpacity onPress={onBack}>
                  <Icon name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
          {/* Để giữ cân đối, thêm View rỗng bên phải nếu có leftComponent */}
          {(leftComponent || onBack) && <View style={{ width: 40 }} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        // Sử dụng colors.background thay vì "#f5f5f5"
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={headerBackgroundColor} // Giữ headerBackgroundColor từ props
        translucent={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        {header || renderStandardHeader()}
        <Container
          style={[
            styles.container,
            style,
            {
              paddingTop: header || title ? 0 : topPadding,
            },
            bottomTabStyle, // Áp dụng style cho bottom tab safe area
          ]}
          contentContainerStyle={
            scrollable && [styles.scrollContent, bottomTabStyle]
          }
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Thay "#f5f5f5" bằng colors.background
    paddingTop: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 4, // Giảm khoảng cách chung
  },
  standardHeader: {
    backgroundColor: colors.primaryBlue,
    paddingBottom: 12,
    paddingTop: 35,
    paddingHorizontal: 16,
    height:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 56 : 56,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
  },
  headerLeftContainer: {
    width: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});

export default ScreenContainer;
