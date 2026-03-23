import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Timer from "./Timer";
import React from "react";
import StaticTimer from "./StaticTimer";
import LunchToggle from "./LunchToggle";
import { LargeText } from "./MyAppText";
import { styles } from "./styles";

export default function TimerView() {
    const db = useSQLiteContext();
    const [staticTime, setStaticTime] = useState<number[]>([]);
    const [rollingTime, setRollingTime] = useState<number>(0);
    const [rollingIndex, setRollingIndex] = useState<number>(0);

    const [thirdLunch, setThirdLunch] = useState<boolean>(false);
    const [fourthLunch, setFourthLunch] = useState<boolean>(true);

    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { width } = useWindowDimensions();
    const isMd = width >= 768;

    const initDb = async () => {
        type TotalTimeRow = {
            time: number | null;
        };
        const staticStatement = await db.prepareAsync(
            `SELECT SUM(strftime('%s', endTime) - strftime('%s', startTime)) AS time 
                FROM schedule
                WHERE name = $name
                AND (lunch = $lunch OR lunch = 2)
                AND DATETIME(startTime) > DATETIME('now')`,
        );
        const rollingStatement = await db.prepareAsync(
            `SELECT (strftime('%s', endTime) - strftime('%s', DATETIME('now'))) AS time 
                FROM schedule 
                WHERE name = $name
                AND (lunch = $lunch OR lunch = 2)
                AND DATETIME(startTime) < DATETIME('now') 
                AND DATETIME(endTime) > DATETIME('now');`,
        );
        const resetStatement = await db.prepareAsync(
            `SELECT (strftime('%s', startTime) - strftime('%s', DATETIME('now'))) AS time
                FROM schedule
                WHERE name = $name
                AND DATETIME(startTime) > DATETIME('now')
                AND (lunch = $lunch OR lunch = 2)
                ORDER BY startTime
                LIMIT 1;`,
        );
        let tempStaticTime: number[] = [];
        let rollingTimeBuffer: number = 0;
        let resetTimeBuffer: number = Number.MAX_SAFE_INTEGER;
        try {
            for (let period = 1; period <= 6; period++) {
                const name = `Period ${period}`;
                let lunch = null;
                if (period == 3) {
                    lunch = thirdLunch ? 1 : 0;
                } else if (period == 4) {
                    lunch = fourthLunch ? 1 : 0;
                } else {
                    lunch = 2;
                }

                const staticResult = await staticStatement.executeAsync({
                    $name: name,
                    $lunch: lunch,
                });
                const staticRow = await staticResult.getFirstAsync();
                tempStaticTime.push((staticRow as TotalTimeRow).time!);

                const rollingResult = await rollingStatement.executeAsync({
                    $name: name,
                    $lunch: lunch,
                });
                const rollingRow = await rollingResult.getFirstAsync();
                const tempRollingTime =
                    (rollingRow as TotalTimeRow | null)?.time ?? 0;
                if (tempRollingTime != 0) {
                    rollingTimeBuffer = tempRollingTime;
                    setRollingIndex(period);
                }

                const resetResult = await resetStatement.executeAsync({
                    $name: name,
                    $lunch: lunch,
                });
                const resetRow = await resetResult.getFirstAsync();
                const tempResetTime =
                    (resetRow as TotalTimeRow | null)?.time ?? 0;

                if (tempResetTime != 0 && tempResetTime < resetTimeBuffer) {
                    resetTimeBuffer = tempResetTime;
                }
            }
            if (rollingTimeBuffer != 0) {
                setRollingTime(rollingTimeBuffer);
            } else {
                setRollingTime(resetTimeBuffer);
                setRollingIndex(0);
            }
            setStaticTime(tempStaticTime);
        } finally {
            await staticStatement.finalizeAsync();
            await rollingStatement.finalizeAsync();
            await resetStatement.finalizeAsync();
        }
    };

    //onStart or when lunches change
    useEffect(() => {
        initDb();
    }, [db, thirdLunch, fourthLunch]);

    // Resync when page regains focus
    useEffect(() => {
        const handleFocus = () => {
            initDb();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("focus", handleFocus);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("focus", handleFocus);
            }
        };
    }, [db]);

    //rolling Time Loop
    useEffect(() => {
        if (rollingTime <= 0) {
            initDb();
            return;
        }

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setRollingTime((prev) => prev - 1);
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [rollingTime > 0]);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View
                style={[
                    styles.timerContainer,
                    {
                        flexDirection: isMd ? "row" : "column-reverse",
                    },
                ]}
            >
                <View>
                    {staticTime.map((time, index) => {
                        if (index + 1 == rollingIndex) {
                            return (
                                <View
                                    key={index}
                                    style={styles.periodTimerContainter}
                                >
                                    <Timer time={rollingTime + time} />
                                    <LargeText>
                                        Left in Period {index + 1}
                                    </LargeText>
                                </View>
                            );
                        } else {
                            return (
                                <View
                                    key={index}
                                    style={styles.periodTimerContainter}
                                >
                                    <StaticTimer time={time} />
                                    <LargeText>
                                        Left in Period {index + 1}
                                    </LargeText>
                                </View>
                            );
                        }
                    })}
                </View>
                <View style={{ flexDirection: "column", gap: 8 }}>
                    {rollingTime != 0 && (
                        <View style={styles.currentTimerContainer}>
                            <Timer time={rollingTime} />
                            <LargeText>
                                {rollingIndex == 0
                                    ? "Until next period"
                                    : "Left in Current Period"}
                            </LargeText>
                        </View>
                    )}

                    <View
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                            marginTop: 8,
                        }}
                    >
                        <LunchToggle
                            lunch={thirdLunch}
                            lunchToggle={() => setThirdLunch(!thirdLunch)}
                            period={3}
                        />
                        <LunchToggle
                            lunch={fourthLunch}
                            lunchToggle={() => setFourthLunch(!fourthLunch)}
                            period={4}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
