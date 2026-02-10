import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import TimerView from "./components/TimerView";
import {
    SQLiteProvider,
    type SQLiteDatabase,
    deleteDatabaseAsync,
} from "expo-sqlite";
import "./global.css";

async function initializeDatabase(db: SQLiteDatabase) {
    try {
        const result = await db.getFirstAsync<{ count: number }>(
            "SELECT COUNT(*) as count FROM schedule",
        );
        if (!result || result.count === 0) {
            throw new Error("Database is empty - needs refresh from asset");
        }
    } catch (error) {
        throw error;
    }
}

export default function App() {
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        const prepareDb = async () => {
            try {
                await deleteDatabaseAsync("schedule.db");
            } catch (e) {}
            setDbReady(true);
        };
        prepareDb();
    }, []);

    if (!dbReady) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
                databaseName="schedule.db"
                assetSource={{ assetId: require("./assets/schedule_lunch.db") }}
                onInit={initializeDatabase}
            >
                <View style={styles.container}>
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
