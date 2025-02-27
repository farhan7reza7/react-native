import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppWrapper({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      {Platform.OS !== "web" ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboard}
          >
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
              <App>{children}</App>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      ) : (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <App>{children}</App>
        </SafeAreaView>
      )}
    </>
  );
}

const App = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeader}>Cuboids Block Header</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollContainer}
      >
        <View style={styles.main}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.textFooter}>Cuboids Block Footer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "lightblue" },
  keyboard: { flex: 1 },
  container: {
    flex: 1,
  },
  scrollContainer: {
    marginVertical: 50,
  },
  scrollContent: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  textHeader: {
    fontSize: 24,
    color: "white",
  },
  textFooter: { fontSize: 18, color: "white" },
  header: {
    position: "absolute",
    top: 0,
    right: 0,
    height: 50,
    left: 0,
    backgroundColor: "#000",
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  main: {
    width: "100%",
  },
  footer: {
    left: 0,
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    height: 50,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
});
