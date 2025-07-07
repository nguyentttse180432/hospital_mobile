import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import hospitalLogo from "../assets/hospital.png"; // Adjust the path as necessary

const SimpleHomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Load the username when the component mounts
    const loadUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("username");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Error loading username:", error);
      }
    };

    loadUsername();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear the stored username
      await AsyncStorage.removeItem("username");
      
      // Navigate back to the login screen
      navigation.replace("SimpleLogin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={hospitalLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Ứng Dụng Bệnh Viện</Text>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Xin chào, <Text style={styles.usernameText}>{username}</Text>!
        </Text>
        <Text style={styles.messageText}>
          Bạn đã đăng nhập thành công vào ứng dụng bệnh viện đơn giản hóa.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#0066CC",
  },
  welcomeContainer: {
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    padding: 30,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  usernameText: {
    color: "#0066CC",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: "#ff6347",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SimpleHomeScreen;
