import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { FlatList } from "react-native-gesture-handler";
import { supabase } from "../supabase/supabaseClient";
import { AuthContext } from "../context/AuthContext";
import AddModal from "../components/student-list/AddModal";
import { Feather } from "@expo/vector-icons";
import EditModal from "../components/student-list/EditModal";
import DeleteModal from "../components/student-list/DeleteModal";

function StudentCard({
  studentId,
  studentName,
  onEditHandler,
  onDeleteHandler,
}) {
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Action:</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#cbe9ff",
              paddingVertical: 4,
              paddingHorizontal: 4,
              borderRadius: 4,
            }}
            onPress={() => onEditHandler(studentId, studentName)}
          >
            <Text>Edit</Text>
            <Feather name="edit" size={18} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#e84c3d",
              paddingVertical: 4,
              paddingHorizontal: 4,
              borderRadius: 4,
            }}
            onPress={() => onDeleteHandler(studentId)}
          >
            <Text style={{ color: "white" }}>Delete</Text>
            <Feather name="trash-2" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function HeaderComponent({
  sections,
  setSelectedSection,
  selectedSection,
  setSearch,
  isFetching,
  setSelectedSubject,
  selectedSubject,
  subjects,
  setShowAddStudentModal,
}) {
  const isDisabled = !(!!selectedSection.value && !!selectedSubject.value);
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={styles.container}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>Subjects:</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          data={subjects}
          labelField="label"
          valueField="value"
          placeholder="Choose a section"
          itemTextStyle={{ color: "black" }}
          value={selectedSubject}
          onChange={(item) => {
            setSelectedSubject(item);
          }}
        />
      </View>
      <View style={styles.container}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>Section:</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          data={sections}
          labelField="label"
          valueField="value"
          placeholder="Choose a section"
          itemTextStyle={{ color: "black" }}
          value={selectedSection}
          onChange={(item) => {
            setSelectedSection(item);
          }}
        />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isDisabled ? "grey" : "#a88e03",
            paddingVertical: 8,
            borderRadius: 6,
            opacity: isDisabled ? 0.6 : 1,
          }}
          onPress={() => setShowAddStudentModal(true)}
          disabled={isDisabled}
        >
          <Text style={{ textAlign: "center", color: "white" }}>
            Add Student
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ paddingTop: 26, paddingHorizontal: 16 }}>
        <TextInput
          onChangeText={setSearch}
          placeholder="Search by name"
          style={styles.textInputStyle}
        />
      </View>
      {isFetching && (
        <ActivityIndicator
          style={{ marginTop: 10 }}
          color="black"
          size="small"
        />
      )}
    </View>
  );
}

export default function StudentList({ navigation }) {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState({
    label: "",
    value: "",
  });
  const [selectedSubject, setSelectedSubject] = useState({
    label: "",
    value: "",
  });

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [studentNum, setStudentNum] = useState("");
  const [studentName, setStudentName] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  function onEditHandler(id, name) {
    setStudentNum(id);
    setStudentName(name);
    setShowEditStudentModal(true);
  }

  function onDeleteHandler(id) {
    setStudentNum(id);
    setShowDeleteModal(true);
  }

  async function showStudents() {
    setIsFetching(true);
    const students = await supabase
      .from("student_record")
      .select("*")
      .order("name", { ascending: true })
      .ilike("name", `%${search}%`)
      .eq("section", selectedSection.value)
      .eq("subject", selectedSubject.value);

    setStudents(students.data);

    setIsFetching(false);
  }

  useEffect(() => {
    if (selectedSection.value !== "" && selectedSubject !== "") {
      showStudents();
    }
  }, [selectedSection, search, selectedSubject]);

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("teacher_id", user.id)
      .eq("subject_id", selectedSubject.value);

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

  async function getSubjects() {
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

    if (error) console.log(error);

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
    if (selectedSubject !== "") {
      getSections();
    }
  }, [selectedSubject]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getSubjects();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <View>
        <FlatList
          ListHeaderComponent={
            <HeaderComponent
              sections={sections}
              setSelectedSection={setSelectedSection}
              selectedSection={selectedSection}
              setSearch={setSearch}
              isFetching={isFetching}
              setSelectedSubject={setSelectedSubject}
              selectedSubject={selectedSubject}
              subjects={subjects}
              setShowAddStudentModal={setShowAddStudentModal}
            />
          }
          data={students}
          renderItem={({ item }) => (
            <StudentCard
              studentId={item.id}
              studentName={item.name}
              onEditHandler={onEditHandler}
              onDeleteHandler={onDeleteHandler}
            />
          )}
          keyExtractor={(item) => item.id}
          onReach
        />
      </View>
      <AddModal
        show={showAddStudentModal}
        setShow={setShowAddStudentModal}
        selectedSection={selectedSection.value}
        selectedSubject={selectedSubject.value}
        showStudents={showStudents}
      />
      <EditModal
        show={showEditStudentModal}
        setShow={setShowEditStudentModal}
        currentStudentNum={studentNum}
        currentStudentName={studentName}
        showStudents={showStudents}
      />
      <DeleteModal
        show={showDeleteModal}
        setShow={setShowDeleteModal}
        currentStudentNum={studentNum}
        showStudents={showStudents}
        selectedSection={selectedSection.value}
        selectedSubject={selectedSubject.value}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 4,
    marginTop: 28,
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
  textInputStyle: {
    borderWidth: 2,
    fontSize: 14,
    borderRadius: 6,
    borderColor: "#ccc",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
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
