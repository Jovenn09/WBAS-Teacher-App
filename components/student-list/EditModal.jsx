import { useEffect, useState } from "react";
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

export default function EditModal({
  show,
  setShow,
  currentStudentNum,
  currentStudentName,
  showStudents,
}) {
  const [adding, setAdding] = useState(false);

  const [studentNum, setStudentNum] = useState(currentStudentNum);
  const [studentName, setStudentName] = useState(currentStudentName);

  const showToastWithGravityAndOffset = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  useEffect(() => {
    setStudentNum(currentStudentNum);
    setStudentName(currentStudentName);
  }, [currentStudentNum, currentStudentName]);

  async function onAddStudentHandler() {
    try {
      setAdding(true);

      const { data, error } = await supabase
        .from("student_record")
        .update({ id: studentNum, name: studentName })
        .eq("id", currentStudentNum)
        .select();

      if (error) throw new Error(error.message);

      await showStudents();
      showToastWithGravityAndOffset("Student Successfully Updated");
    } catch (error) {
      console.log(error);
      Alert.alert("Something went wrong", error.message);
    } finally {
      setShow(false);
      setAdding(false);
    }
  }

  return (
    <Modal visible={show} animationType="fade" transparent={true}>
      <View
        onTouchEnd={() => (adding ? false : setShow(false))}
        style={styles.modalOverlay}
      ></View>
      <View pointerEvents="box-none" style={styles.centeredView}>
        <View style={styles.innerContainer}>
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 4,
              borderColor: "grey",
              paddingHorizontal: 4,
            }}
            placeholder="Enter Student Number"
            defaultValue={currentStudentNum}
            onChangeText={setStudentNum}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderRadius: 4,
              borderColor: "grey",
              paddingHorizontal: 4,
            }}
            placeholder="Enter Student Name"
            defaultValue={currentStudentName}
            onChangeText={setStudentName}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#3e5028",
              paddingVertical: 4,
              borderRadius: 4,
              opacity: adding ? 0.7 : 1,
            }}
            onPress={onAddStudentHandler}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color={"white"} size={"small"} />
            ) : (
              <Text style={{ color: "white", textAlign: "center" }}>
                UPDATE
              </Text>
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
