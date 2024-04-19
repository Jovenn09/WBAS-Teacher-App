import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";
import { supabase } from "../supabase/supabaseClient";
import { AuthContext } from "../context/AuthContext";
import { Entypo } from "@expo/vector-icons";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import ReportCard from "../components/reports/ReportCard";

function HeaderComponent({
  sections,
  setSelectedSection,
  selectedSection,
  isFetching,
  setSelectedSubject,
  selectedSubject,
  subjects,
  setShowStartDate,
  setShowEndDate,
  startDate,
  endDate,
  reportData,
}) {
  return (
    <View style={{ marginBottom: 16, gap: 17, marginTop: 18 }}>
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
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          alignSelf: "center",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        <View style={styles.filterBtnContainer}>
          <Text style={styles.filterBtnText}>Start Date:</Text>
          <Pressable
            style={styles.filterBtn}
            onPress={() => setShowStartDate(true)}
          >
            <Text>
              {!startDate ? "yyyy/mm/dd" : format(startDate, "yyyy/MM/dd")}
            </Text>
            <Entypo name="calendar" size={20} color="black" />
          </Pressable>
        </View>
        <View style={styles.filterBtnContainer}>
          <Text style={styles.filterBtnText}>End Date:</Text>
          <Pressable
            style={styles.filterBtn}
            onPress={() => setShowEndDate(true)}
          >
            <Text>
              {!endDate ? "yyyy/mm/dd" : format(endDate, "yyyy/MM/dd")}
            </Text>
            <Entypo name="calendar" size={20} color="black" />
          </Pressable>
        </View>
      </View>
      {reportData?.length === 0 && (
        <View style={{ padding: 24 }}>
          <Text>
            No attendace record found. make sure that you have selected a
            subject and section
          </Text>
        </View>
      )}

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

export default function Reports({ navigation }) {
  const { user } = useContext(AuthContext);

  const [reportData, setReportData] = useState([]);
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  function onChangeStartDateHandler(event, selectedDate) {
    setShowStartDate(false);

    if (event.type === "set") {
      setStartDate(selectedDate);
    }
  }
  function onChangeEndDateHandler(event, selectedDate) {
    setShowEndDate(false);

    if (event.type === "set") {
      setEndDate(selectedDate);
    }
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
    const unsubscribe = navigation.addListener("focus", () => {
      getSubjects();
    });

    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    if (selectedSubject !== "") {
      getSections();
    }
  }, [selectedSubject]);

  async function getAttendanceRecord() {
    setIsFetching(true);
    const query = supabase
      .from("attendance")
      .select(
        `
      student_id,
      student_name,
      subject_id,
      subjects (
        subject_description
      ),
      attendance_status,
      date
      `,
        { count: "exact" }
      )
      .ilike("subject_id", `%${selectedSubject.value}%`)
      .ilike("section_id", `%${selectedSection.value}%`)
      .eq("teacher_id", user.id)
      .eq("attendance_status", "absent")
      .order("date", { ascending: false });

    if (startDate && endDate) {
      query
        .lte("date", format(endDate, "yyyy/MM/dd"))
        .gte("date", format(startDate, "yyyy/MM/dd"));
    }

    const { data, error, count } = await query;
    setReportData(data);
    setIsFetching(false);
  }

  useEffect(() => {
    if (!selectedSubject.value || !selectedSection.value) return;
    getAttendanceRecord();
  }, [selectedSection, selectedSubject]);

  useEffect(() => {
    if (!startDate || !endDate || !selectedSubject.value || !selectedSection)
      return;
    getAttendanceRecord();
  }, [startDate, endDate]);

  return (
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
            setShowStartDate={setShowStartDate}
            setShowEndDate={setShowEndDate}
            onChangeEndDateHandler={onChangeEndDateHandler}
            onChangeStartDateHandler={onChangeStartDateHandler}
            startDate={startDate}
            endDate={endDate}
            reportData={reportData}
          />
        }
        data={reportData}
        renderItem={({ item }) => (
          <ReportCard
            subject={`${item.subject_id} - ${item.subjects.subject_description}`}
            studentName={item.student_name}
            date={item.date}
            status={item.attendance_status}
          />
        )}
      />
      {showStartDate && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeStartDateHandler}
        />
      )}
      {showEndDate && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeEndDateHandler}
        />
      )}
    </View>
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
  filterBtnContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
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
