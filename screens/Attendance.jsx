import { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabase/supabaseClient";
import { Dropdown } from "react-native-element-dropdown";
import { Entypo } from "@expo/vector-icons";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FlatList } from "react-native-gesture-handler";
import StudentCard from "../components/attendance/StudentCard";
import { AntDesign } from "@expo/vector-icons";

function HeaderComponent({
  name,
  subjects,
  selectedSubjects,
  setSelectedSubjects,
  sections,
  setSelectedSection,
  setShowDatePicker,
  showStudents,
  date,
  isDisabled,
  onSearchChange,
  isFetching,
  selectedSection,
  students,
}) {
  return (
    <>
      <Text
        style={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: "bold",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        Welcome
      </Text>
      <Text
        style={{ textAlign: "center", fontWeight: "500", marginBottom: 16 }}
      >
        {name}
      </Text>
      <View style={{ gap: 16 }}>
        <View style={styles.container}>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>Class:</Text>
          <Dropdown
            style={[styles.dropdown]}
            placeholderStyle={styles.placeholderStyle}
            data={subjects}
            labelField="label"
            valueField="value"
            placeholder="Choose a subject"
            itemTextStyle={{ color: "black" }}
            value={selectedSubjects}
            onChange={(item) => {
              setSelectedSubjects(item);
            }}
          />
        </View>
        <View style={styles.container}>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>Section:</Text>
          <Dropdown
            style={[styles.dropdown]}
            placeholderStyle={[
              styles.placeholderStyle,
              selectedSubjects.value === "" && { color: "grey" },
            ]}
            data={sections}
            labelField="label"
            valueField="value"
            placeholder="Choose a section"
            disable={selectedSubjects.value === ""}
            value={selectedSection}
            onChange={(item) => {
              setSelectedSection(item);
            }}
          />
        </View>
        <View
          style={[
            styles.container,
            {
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <View style={styles.filterBtnContainer}>
            <Text style={styles.filterBtnText}>Date:</Text>
            <Pressable
              style={styles.filterBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{format(date, "dd/MM/yyyy")}</Text>
              <Entypo name="calendar" size={20} color="black" />
            </Pressable>
          </View>
          <TouchableOpacity
            style={[
              {
                backgroundColor: "#a88e03",
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 4,
              },
              isDisabled && { backgroundColor: "grey" },
            ]}
            disabled={isDisabled}
            onPress={() => showStudents()}
          >
            <Text style={{ color: "white" }}>Show</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingTop: 26, paddingHorizontal: 16 }}>
        <TextInput
          editable={students.length > 0}
          onChangeText={onSearchChange}
          placeholder="Search by name"
          style={styles.textInputStyle}
        />
      </View>
      {isFetching && (
        <ActivityIndicator
          style={{ marginTop: 16, marginBottom: 6 }}
          color="black"
          size="small"
        />
      )}
    </>
  );
}

export default function Attendance({ navigation }) {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [date, setDate] = useState(new Date());

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedSubjects, setSelectedSubjects] = useState({
    value: "",
    label: "",
  });
  const [selectedSection, setSelectedSection] = useState({
    value: "",
    label: "",
  });

  const [studentAttendance, setStudentAttendance] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);

  const [isDisabled, setIsDisabled] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendanceStatusChange = (studentId, status) => {
    if (status === "0") {
      setAbsentStudents((prev) =>
        prev.includes(studentId) ? prev : [...prev, studentId]
      );
      return;
    }

    setAbsentStudents((prev) => prev.filter((id) => id !== studentId));
  };

  useEffect(() => {
    console.log(absentStudents);
  }, [absentStudents]);

  function onChangeDateHandler(event, selectedDate) {
    setShowDatePicker(false);

    if (event.type === "set") {
      setDate(selectedDate);
    }
  }

  const scrollViewRef = useRef();

  async function getHandleSubjects() {
    const { data, error } = await supabase
      .from("assign")
      .select(
        `
      subject_id,
      subjects (
        subject_description
      )
      `
      )
      .eq("teacher_id", user.id);

    const subjects = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.subject_id === item.subject_id)
    );

    const mapSubjects = subjects.map((data) => ({
      label: `${data.subject_id} - ${data.subjects.subject_description}`,
      value: data.subject_id,
    }));

    setSubjects(mapSubjects);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("getting subjects");
      getHandleSubjects();
    });

    return unsubscribe;
  }, [navigation]);

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("teacher_id", user.id)
      .eq("subject_id", selectedSubjects.value);

    if (error) console.log(error);

    const sections = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.section_id === item.section_id)
    );

    const mapSections = sections.map((data) => ({
      label: data.section_id,
      value: data.section_id,
    }));

    setSections(mapSections);
  }

  useEffect(() => {
    if (selectedSubjects.value !== "") {
      getSections();
    }
  }, [selectedSubjects.value]);

  async function showStudents() {
    setIsFetching(true);
    const students = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true })
      .contains("sections", [selectedSection.value])
      .contains("subjects", [selectedSubjects.value]);

    setStudents(students.data);
    const defaultAttendance = students.data.map((student) => ({
      teacher_id: user.id,
      student_id: student.uuid,
      subject_id: selectedSubjects.value,
      section_id: selectedSection.value,
      date: format(date, "yyyy/MM/dd"),
      attendance_status: "present",
    }));

    setStudentAttendance(defaultAttendance);
    setIsFetching(false);
  }

  async function onSearchChange(value) {
    setIsFetching(true);
    const students = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true })
      .contains("sections", [selectedSection.value])
      .contains("subjects", [selectedSubjects.value])
      .ilike("name", `%${value}%`);

    setStudents(students.data);
    setIsFetching(false);
  }

  async function onSubmitAttendance() {
    try {
      if (date > new Date())
        throw new Error("You can't take attendance in future date");

      setIsSubmitting(true);
      const attendanceRecord = studentAttendance.map((data) =>
        absentStudents.includes(data.student_id)
          ? {
              ...data,
              attendance_status: "absent",
              date: format(date, "yyyy/MM/dd"),
            }
          : { ...data, date: format(date, "yyyy/MM/dd") }
      );

      if (attendanceRecord.length === 0) throw new Error("Nothing to submit");

      const { error } = await supabase
        .from("attendance")
        .upsert(attendanceRecord);

      if (error) throw new Error(error.message);

      setSelectedSection({ value: "", label: "" });
      setSelectedSubjects({ value: "", label: "" });
      setStudents([]);
      setAbsentStudents([]);
      Alert.alert("Success!", "You have submitted a class attendace");
    } catch (error) {
      Alert.alert("Something went wrong", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    setSelectedSection({ value: "", label: "" });
    setStudents([]);
  }, [selectedSubjects]);

  useEffect(() => {
    setStudents([]);
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection.value === "" || selectedSubjects.value === "") {
      setIsDisabled(true);
      return;
    }

    setIsDisabled(false);
  }, [selectedSection, selectedSubjects]);

  useEffect(() => {
    const getTeacherName = async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("name")
        .eq("uuid", user.id);

      if (error) console.log(error);

      const name = data[0]?.name || "";
      setName(name);
    };
    getTeacherName();
  }, []);

  return (
    <>
      <FlatList
        ref={scrollViewRef}
        ListHeaderComponent={
          <HeaderComponent
            name={name}
            sections={sections}
            selectedSubjects={selectedSubjects}
            date={date}
            setSelectedSection={setSelectedSection}
            setSelectedSubjects={setSelectedSubjects}
            showStudents={showStudents}
            subjects={subjects}
            setShowDatePicker={setShowDatePicker}
            isDisabled={isDisabled}
            onSearchChange={onSearchChange}
            isFetching={isFetching}
            selectedSection={selectedSection}
            students={students}
          />
        }
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        data={students}
        renderItem={({ item }) => (
          <StudentCard
            studentId={item.student_id}
            studentName={item.name}
            uuid={item.uuid}
            handleAttendanceStatusChange={handleAttendanceStatusChange}
          />
        )}
        keyExtractor={(item) => item.uuid}
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={[
                {
                  backgroundColor: "green",
                  marginTop: 8,
                  marginBottom: 36,
                  paddingVertical: 8,
                  borderRadius: 2,
                },
                (isDisabled || students.length === 0 || isSubmitting) && {
                  backgroundColor: "grey",
                },
              ]}
              disabled={isDisabled || students.length === 0 || isSubmitting}
              onPress={onSubmitAttendance}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateHandler}
        />
      )}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 15,
          right: 15,
          backgroundColor: "#3b5026",
          padding: 15,
          borderRadius: 30,
        }}
        onPress={() => setShowScrollButton((prev) => !prev)}
      >
        <Entypo name="dots-three-vertical" size={18} color="white" />
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: "grey",
          position: "absolute",
          bottom: 80,
          right: 15,
          paddingVertical: 6,
          padding: 5,
          borderRadius: 8,
          gap: 24,
          transform: [{ translateX: showScrollButton ? 0 : 70 }],
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 20,
          }}
          onPress={() =>
            scrollViewRef.current.scrollToOffset({ offset: 0, animated: true })
          }
        >
          <AntDesign name="up" size={18} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 20,
          }}
          onPress={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          <AntDesign name="down" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 4,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  filterBtnContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    padding: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  filterBtnText: { fontSize: 16, fontWeight: "500" },
  textInputStyle: {
    borderWidth: 2,
    fontSize: 14,
    borderRadius: 6,
    borderColor: "#ccc",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
