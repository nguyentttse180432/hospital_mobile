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

const ScreenContainer = ({
  children,
  style,
  scrollable = true,
  header,
  title,
  headerBackgroundColor = "#4299e1",
  leftComponent,
  hasBottomTabs = false, // Add prop to indicate if screen has bottom tabs
  onBack,
}) => {
  const Container = scrollable ? ScrollView : View;
  const insets = useSafeAreaInsets();

  // Get actual status bar height
  const STATUS_BAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

  // Only apply status bar padding if not explicitly set to 0 in style
  const topPadding = style && style.paddingTop === 0 ? 0 : STATUS_BAR_HEIGHT;

  // Get bottom tab safe area style if needed
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
        {(leftComponent || onBack) && (
          <View style={styles.headerLeftContainer}>
            {leftComponent || (
              <TouchableOpacity onPress={onBack}>

                <Icon name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <Text
          style={[
            styles.headerTitle,
            leftComponent || onBack ? styles.headerTitleWithLeft : null,
          ]}
        >
          {title}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        // Luôn dùng màu nền app, không lấy headerBackgroundColor
        // { backgroundColor: title ? headerBackgroundColor : "#f5f5f5" },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={headerBackgroundColor}
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
            bottomTabStyle, // Apply bottom tab safe area style
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
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#4299e1",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 2,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 56 : 56,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerTitleWithLeft: {
    marginLeft: 0, // Adjust this value to properly center the title
    flex: 1,
  },
  headerLeftContainer: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "android" ? StatusBar.currentHeight : 2,
    zIndex: 10,
    height: "100%",
    justifyContent: "center",
  },
});

export default ScreenContainer;
