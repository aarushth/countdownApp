import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import TimerView from "./components/TimerView";
import {
    SQLiteProvider,
    deleteDatabaseAsync,
    type SQLiteDatabase,
} from "expo-sqlite";
import { LargeText } from "./components/MyAppText";

const DB_NAME = "schedule_lunch.db";
// Bump this number whenever you update assets/schedule.db
const DB_ASSET_VERSION = 1;

async function initializeDatabase(db: SQLiteDatabase) {
    const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM schedule",
    );
    if (!result || result.count === 0) {
        throw new Error("Database is empty - needs refresh from asset");
    }
}

/**
 * Checks whether the cached DB matches the current asset version.
 * If not, deletes the cached copy so SQLiteProvider re-copies from the asset.
 */
function useDbAssetVersion() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const versionKey = `db_asset_version_${DB_NAME}`;
        async function check() {
            const stored =
                Platform.OS === "web" ? localStorage.getItem(versionKey) : null;

            if (stored !== String(DB_ASSET_VERSION)) {
                try {
                    await deleteDatabaseAsync(DB_NAME);
                } catch {
                    // DB may not exist yet on first launch — that's fine
                }
                if (Platform.OS === "web") {
                    localStorage.setItem(versionKey, String(DB_ASSET_VERSION));
                }
            }
            setReady(true);
        }
        check();
    }, []);

    // On native, skip the async check — asset overwrite issues are
    // mainly a web/OPFS problem. Extend with expo-file-system if needed.
    if (Platform.OS !== "web") return true;
    return ready;
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
    const dbReady = useDbAssetVersion();

    // On native, lockState is "unsupported" (skip lock logic).
    // On web, wait until we hold the exclusive lock.
    if (lockState === "waiting" || !dbReady) {
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
                databaseName={DB_NAME}
                assetSource={{ assetId: require("./assets/schedule.db") }}
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
