import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const ImageViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUrl, title } = route.params;

  const renderCustomHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title || "Hình ảnh"}
      </Text>
      <View style={styles.headerRightPlaceholder} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {renderCustomHeader()}

      <ScrollView
        style={styles.imageContainer}
        contentContainerStyle={styles.imageContentContainer}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onError={() => {
            Alert.alert("Lỗi", "Không thể tải hình ảnh");
            navigation.goBack();
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  imageContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 60 : 60,
  },
  imageContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ImageViewerScreen;
