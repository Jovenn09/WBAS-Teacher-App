import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { AppState } from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { AuthContext, AuthContextProvider } from "./context/AuthContext";
import { supabase } from "./supabase/supabaseClient";

// navigator
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

// screens
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import Attendance from "./screens/Attendance";
import StudentList from "./screens/StudentList";
import Reports from "./screens/Reports";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawer(props) {
  const { setUser } = useContext(AuthContext);
  async function onLogoutHandler() {
    const { error } = await supabase.auth.signOut();
    if (error) return console.log(error.message);
    setUser(null);
  }

  return (
    <DrawerContentScrollView contentContainerStyle={{ flex: 1 }} {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        inactiveTintColor="white"
        style={{ marginTop: "auto", marginBottom: 12 }}
        icon={({ color, size }) => (
          <Ionicons name="exit" size={size} color={color} />
        )}
        onPress={onLogoutHandler}
      />
    </DrawerContentScrollView>
  );
}

function HomeScreen() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: "#3e5028" },
        drawerActiveBackgroundColor: "#a88e03",
        drawerActiveTintColor: "white",
        drawerInactiveBackgroundColor: "transparent",
        drawerInactiveTintColor: "white",
        headerStyle: { backgroundColor: "#3e5028" },
        headerTintColor: "white",
      }}
    >
      <Drawer.Screen
        name="Attendance"
        component={Attendance}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-sharp" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Students"
        component={StudentList}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="groups" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={Reports}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-text"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-edit"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AuthScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

function Root() {
  const { user } = useContext(AuthContext);
  const screen = user ? (
    <>
      <StatusBar style="light" />
      <HomeScreen />
    </>
  ) : (
    <>
      <StatusBar style="dark" />
      <AuthScreen />
    </>
  );

  return screen;
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <AuthContextProvider>
          <Root />
        </AuthContextProvider>
      </NavigationContainer>
    </>
  );
}
