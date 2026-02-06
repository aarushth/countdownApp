import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import TimerView from "./components/TimerView";
import {
    SQLiteProvider,
    type SQLiteDatabase,
    deleteDatabaseAsync,
} from "expo-sqlite";
import "./global.css";

async function initializeDatabase(db: SQLiteDatabase) {
    // console.log("Database initialized:", db);

    // Verify the database has the expected table
    try {
        const result = await db.getFirstAsync<{ count: number }>(
            "SELECT COUNT(*) as count FROM schedule",
        );
        // console.log("Schedule table has", result?.count, "rows");
        if (!result || result.count === 0) {
            throw new Error("Database is empty - needs refresh from asset");
        }
    } catch (error) {
        // console.error("Database verification failed:", error);
        throw error;
    }
}

export default function App() {
    const [dbReady, setDbReady] = useState(false);
    const [dbKey, setDbKey] = useState(0);

    useEffect(() => {
        // Delete existing database on web to force fresh copy from asset
        const prepareDb = async () => {
            try {
                await deleteDatabaseAsync("schedule.db");
                // console.log(
                //     "Deleted existing database, will copy fresh from asset",
                // );
            } catch (e) {
                // console.log("No existing database to delete (this is fine)");
            }
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
                key={dbKey}
                databaseName="schedule.db"
                assetSource={{ assetId: require("./assets/schedule.db") }}
                onInit={initializeDatabase}
                onError={(error) => {
                    // console.error("SQLite error:", error);
                }}
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
