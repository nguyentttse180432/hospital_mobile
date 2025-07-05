import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
} from "react-native";

const ScreenContainer = ({
  children,
  style,
  scrollable = true,
  header,
  title,
  headerBackgroundColor = "#4299e1",
}) => {
  const Container = scrollable ? ScrollView : View;

  // Get actual status bar height
  const STATUS_BAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0;

  // Only apply status bar padding if not explicitly set to 0 in style
  const topPadding = style && style.paddingTop === 0 ? 0 : STATUS_BAR_HEIGHT;

  const renderStandardHeader = () => {
    if (!title) return null;

    return (
      <View
        style={[
          styles.standardHeader,
          { backgroundColor: headerBackgroundColor },
        ]}
      >
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: title ? headerBackgroundColor : "#f5f5f5" },
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
          ]}
          contentContainerStyle={scrollable && styles.scrollContent}
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default ScreenContainer;
