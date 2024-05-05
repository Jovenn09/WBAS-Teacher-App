import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ToastAndroid,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../supabase/supabaseClient";

export default function AddModal({
  show,
  setShow,
  selectedSection,
  selectedSubject,
  showStudents,
}) {
  const [studentNum, setStudentNum] = useState("");
  const [studentName, setStudentName] = useState("");

  const [adding, setAdding] = useState(false);

  function validateString(input) {
    const pattern = /^(\d{2})-(\d{4})-(\d{5})$/;

    if (pattern.test(input)) {
      return true;
    } else {
      return false;
    }
  }

  function validateNoNumbers(input) {
    const pattern = /^[^0-9]+$/;

    if (pattern.test(input)) {
      return true;
    } else {
      return false;
    }
  }

  const showToastWithGravityAndOffset = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  async function onAddStudentHandler() {
    try {
      setAdding(true);

      const isValidId = validateString(studentNum);
      const isValidName = validateNoNumbers(studentName);

      if (!isValidId) throw new Error("Invalid Student Number");
      if (!isValidName) throw new Error("Invalid Student Name");

      const { data, error } = await supabase
        .from("student_record")
        .insert([
          {
            id: studentNum,
            name: studentName.toUpperCase(),
            section: selectedSection,
            subject: selectedSubject,
          },
        ])
        .select();

      if (error) throw new Error(error.message);

      await showStudents();
      showToastWithGravityAndOffset("Student Successfully Added");
      setShow(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Something went wrong", error.message);
    } finally {
      setAdding(false);
      setStudentName("");
    }
  }

  return (
    <Modal visible={show} animationType="fade" transparent={true}>
      <View
        onTouchEnd={() => setShow(false)}
        style={styles.modalOverlay}
      ></View>
      <View pointerEvents="box-none" style={styles.centeredView}>
        <View style={styles.innerContainer}>
          <Text>Student Number</Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={13}
            style={{
              borderWidth: 1,
              borderRadius: 4,
              borderColor: "grey",
              paddingHorizontal: 4,
            }}
            placeholder="e.g., 20-2024-02184"
            onChangeText={setStudentNum}
          />
          <Text>Student Name</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 4,
              borderColor: "grey",
              paddingHorizontal: 4,
            }}
            placeholder="e.g., SMITH, JAMES"
            value={studentName}
            onChangeText={setStudentName}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#3e5028",
              paddingVertical: 4,
              borderRadius: 4,
              opacity: adding || !(!!studentNum && !!studentName) ? 0.7 : 1,
            }}
            onPress={onAddStudentHandler}
            disabled={adding || !(!!studentNum && !!studentName)}
          >
            {adding ? (
              <ActivityIndicator color={"white"} size={"small"} />
            ) : (
              <Text style={{ color: "white", textAlign: "center" }}>ADD</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    backgroundColor: "black",
    top: 0,
    bottom: 0,
    flex: 1,
    width: "100%",
    opacity: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  innerContainer: {
    backgroundColor: "white",
    width: "60%",
    maxHeight: 200,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
});
