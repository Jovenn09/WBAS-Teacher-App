import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ToastAndroid,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../supabase/supabaseClient";

export default function DeleteModal({
  show,
  setShow,
  currentStudentNum,
  showStudents,
  selectedSection,
  selectedSubject,
}) {
  const [adding, setAdding] = useState(false);

  const showToastWithGravityAndOffset = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  async function onDeleteStudentHandler() {
    try {
      setAdding(true);

      const { error } = await supabase
        .from("student_record")
        .delete()
        .eq("id", currentStudentNum)
        .eq("section", selectedSection)
        .eq("subject", selectedSubject);

      if (error) throw new Error(error.message);

      await showStudents();
      showToastWithGravityAndOffset("Student Successfully Deleted");
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
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 18 }}>
            Are you sure you want to delete this student? This action cannot be
            undone.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#3e5028",
              paddingVertical: 4,
              borderRadius: 4,
              opacity: adding ? 0.7 : 1,
            }}
            onPress={onDeleteStudentHandler}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color={"white"} size={"small"} />
            ) : (
              <Text style={{ color: "white", textAlign: "center" }}>
                CONFIRM
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              paddingVertical: 4,
              borderRadius: 4,
              opacity: adding ? 0.7 : 1,
            }}
            onPress={() => setShow(false)}
            disabled={adding}
          >
            <Text style={{ color: "white", textAlign: "center" }}>CANCEL</Text>
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
    width: "80%",
    maxHeight: 200,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
});
