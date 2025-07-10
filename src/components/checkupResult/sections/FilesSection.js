import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Card from "../../common/Card";
import Icon from "react-native-vector-icons/Ionicons";
import * as FileUtils from "../../../utils/fileUtils";

const FileItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.fileItem} onPress={() => onPress(item)}>
    <View style={styles.fileIconContainer}>
      <Icon
        name={
          FileUtils.isImageFile(item.resultFieldLink)
            ? "image"
            : FileUtils.isPdfFile(item.resultFieldLink)
            ? "document-text"
            : "document"
        }
        size={24}
        color="#4299e1"
      />
    </View>
    <View style={styles.fileInfo}>
      <Text style={styles.fileName}>{item.fileName}</Text>
      <Text style={styles.fileType}>{item.fileType}</Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const FilesSection = ({ files, onFilePress }) => {
  if (!files || files.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tệp kết quả</Text>
      <Card style={styles.filesCard}>
        <FlatList
          data={files}
          renderItem={({ item }) => (
            <FileItem item={item} onPress={onFilePress} />
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  filesCard: {
    padding: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  fileType: {
    fontSize: 14,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
});

export default FilesSection;
