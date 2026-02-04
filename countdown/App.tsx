import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import TimerView from "./components/TimerView";
import { SQLiteProvider } from "expo-sqlite";

export default function App() {
    return (
        <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
                databaseName="schedule.db"
                assetSource={{ assetId: require("./assets/schedule.db") }}
            >
                <View style={styles.container}>
                    <Text>helloate</Text>
                    <TimerView></TimerView>
                    <StatusBar style="auto" />
                </View>
            </SQLiteProvider>
        </Suspense>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
