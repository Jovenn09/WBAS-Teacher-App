import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useEffect, useMemo, useState } from "react";
import RadioGroup from "react-native-radio-buttons-group";

export default function StudentCard({
  studentId,
  studentName,
  handleAttendanceStatusChange,
  uuid,
}) {
  const radioButtons = useMemo(
    () => [
      {
        id: "1",
        label: "Present",
        value: "present",
        size: 14,
      },
      {
        id: "0",
        label: "Absent",
        value: "absent",
        size: 14,
      },
    ],
    []
  );
  const [selectedId, setSelectedId] = useState("1");

  return (
    <View style={styles.cardContainer}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Student ID:</Text>
        <ScrollView horizontal>
          <Text>{studentId}</Text>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Student Name:</Text>
        <ScrollView horizontal>
          <Text>{studentName}</Text>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "column", gap: 4 }}>
        <Text style={{ fontWeight: "bold" }}>Attendance:</Text>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={(value) => {
            setSelectedId(value);
            handleAttendanceStatusChange(uuid, value);
          }}
          selectedId={selectedId}
          layout="row"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: "center",
    width: "90%",
    gap: 8,
    padding: 8,
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
    elevation: 1,
    marginBottom: 10,
  },
});
