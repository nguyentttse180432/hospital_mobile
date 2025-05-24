import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

const ScreenContainer = ({ children, style, scrollable = true, header }) => {
  const Container = scrollable ? ScrollView : View;

  // Define a status bar height for Android (approximate, can be adjusted)
  const STATUS_BAR_HEIGHT = Platform.OS === "android" ? 24 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        translucent={false} // Ensure content doesn't render under the status bar
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        {header}
        <Container
          style={[styles.container, style, { paddingTop: STATUS_BAR_HEIGHT }]}
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
    backgroundColor: "#ddd",
    // backgroundColor: "#000",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});

export default ScreenContainer;
