import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const STATUS_BAR_HEIGHT = Platform.OS === "android" ? 24 : 0;

const Header = ({ title, onBack, progressIcons = [], activeStep }) => (
  <SafeAreaView style={styles.headerContainer}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.progress}>
        {progressIcons.map((icon, index) => (
          <View key={index} style={styles.iconContainer}>
            <View
              style={[
                styles.progressIcon,
                {
                  backgroundColor: index <= activeStep ? "#1e88e5" : "#e0e0e0",
                },
              ]}
            >
              <Icon
                name={icon}
                size={16}
                color={index <= activeStep ? "#fff" : "#999"}
              />
            </View>
            {index < progressIcons.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: index < activeStep ? "#1e88e5" : "#e0e0e0",
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    paddingTop: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 65,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    width: 20,
    height: 2,
    marginHorizontal: 4,
  },
});

export default Header;
