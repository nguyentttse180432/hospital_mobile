import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const SymptomInput = ({ symptom, setSymptom }) => {
  const handleSymptomChange = (text) => {
    setSymptom(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập Triệu Chứng</Text>
      <TextInput
        style={styles.input}
        value={symptom}
        onChangeText={handleSymptomChange}
        placeholder="Nhập triệu chứng của bạn..."
        multiline
        numberOfLines={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
});

export default SymptomInput;
