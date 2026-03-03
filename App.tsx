import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Platform,
    Text,
} from "react-native";
import TimerView from "./components/TimerView";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { LargeText } from "./components/MyAppText";

async function initializeDatabase(db: SQLiteDatabase) {
    const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM schedule",
    );
    if (!result || result.count === 0) {
        throw new Error("Database is empty - needs refresh from asset");
    }
}

/**
 * On the web, expo-sqlite uses OPFS which holds an exclusive lock —
 * only one tab can have the database open at a time.
 * We use the Web Locks API to ensure a single active tab.
 */
function useWebDbLock() {
    const [lockState, setLockState] = useState<
        "waiting" | "acquired" | "unsupported"
    >(Platform.OS === "web" ? "waiting" : "unsupported");

    useEffect(() => {
        if (Platform.OS !== "web") return;

        // Web Locks API is available in all modern browsers
        if (!navigator.locks) {
            // Fallback: just let it through (old browser)
            setLockState("acquired");
            return;
        }

        let released = false;
        const controller = new AbortController();

        navigator.locks
            .request(
                "countdown-db-lock",
                { signal: controller.signal },
                () =>
                    new Promise<void>((resolve) => {
                        // Lock acquired — this tab is the active DB owner
                        setLockState("acquired");
                        // Hold the lock until this component unmounts or tab closes
                        const onUnload = () => {
                            released = true;
                            resolve();
                        };
                        window.addEventListener("beforeunload", onUnload);
                        // Also resolve on unmount
                        controller.signal.addEventListener("abort", () => {
                            window.removeEventListener(
                                "beforeunload",
                                onUnload,
                            );
                            if (!released) resolve();
                        });
                    }),
            )
            .catch(() => {
                // Lock request was aborted (component unmounted while waiting)
            });

        return () => {
            controller.abort();
        };
    }, []);

    return lockState;
}

export default function App() {
    const lockState = useWebDbLock();

    // On native, lockState is "unsupported" (skip lock logic).
    // On web, wait until we hold the exclusive lock.
    if (lockState === "waiting") {
        return (
            <View style={styles.container}>
                <LargeText>Waiting for other tab to close...</LargeText>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
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
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
});
