import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Timer from "./Timer";
import React from "react";
import StaticTimer from "./StaticTimer";
import LunchToggle from "./LunchToggle";

export default function TimerView() {
    const db = useSQLiteContext();
    const [staticTime, setStaticTime] = useState<number[]>([]);
    const [rollingTime, setRollingTime] = useState<number>(0);
    const [rollingIndex, setRollingIndex] = useState<number>(0);
    const [resetTime, setResetTime] = useState<number>(Number.MAX_SAFE_INTEGER);
    const [thirdLunch, setThirdLunch] = useState<boolean>(false);
    const [fourthLunch, setFourthLunch] = useState<boolean>(true);

    const rollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const resetIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            `WITH active AS (
                    SELECT endTime AS time
                    FROM schedule
                    WHERE name = $name
                    AND DATETIME(startTime) <= DATETIME('now')
                    AND DATETIME(endTime) > DATETIME('now')
                    AND (lunch = $lunch OR lunch = 2)
                    ORDER BY endTime
                    LIMIT 1
                ),
                upcoming AS (
                    SELECT startTime AS time
                    FROM schedule
                    WHERE name = $name
                    AND DATETIME(startTime) > DATETIME('now')
                    AND (lunch = $lunch OR lunch = 2)
                    ORDER BY startTime
                    LIMIT 1
                )
                SELECT time
                FROM active
                UNION ALL
                SELECT time
                FROM upcoming
                WHERE NOT EXISTS (SELECT 1 FROM active)
                LIMIT 1;
                `,
        );
        let tempStaticTime: number[] = [];
        let rollingTimeBuffer: number = 0;
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
                const tempResetTime = new Date(
                    `${(resetRow as TotalTimeRow).time}Z`,
                );

                if (tempResetTime.getTime() / 1000 < resetTime) {
                    setResetTime(tempResetTime.getTime() / 1000);
                }
            }
            setRollingTime(rollingTimeBuffer);
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
        if (rollingTime <= 0) return;

        if (rollingIntervalRef.current)
            clearInterval(rollingIntervalRef.current);

        rollingIntervalRef.current = setInterval(() => {
            setRollingTime((prev) => prev - 1);
        }, 1000);

        return () => {
            if (rollingIntervalRef.current)
                clearInterval(rollingIntervalRef.current);
        };
    }, [rollingTime > 0]);

    // Reset watcher loop
    useEffect(() => {
        if (!resetTime) return;

        if (resetIntervalRef.current) clearInterval(resetIntervalRef.current);

        resetIntervalRef.current = setInterval(() => {
            const now = new Date();
            if (resetTime < now.getTime() * 1000) {
                initDb();
            }
        }, 1000);

        return () => {
            if (resetIntervalRef.current)
                clearInterval(resetIntervalRef.current);
        };
    }, [resetTime]);

    return (
        <View className="flex flex-row align-center gap-10">
            <ScrollView>
                {staticTime.map((time, index) => {
                    if (index + 1 == rollingIndex) {
                        return (
                            <View key={index} className="my-5">
                                <Timer time={rollingTime + time} />
                                <Text>Left in Period {index + 1}</Text>
                            </View>
                        );
                    } else {
                        return (
                            <View key={index} className="my-5">
                                <StaticTimer time={time} />
                                <Text>Left in Period {index + 1}</Text>
                            </View>
                        );
                    }
                })}
            </ScrollView>

            <View className="my-5 flex-1 justify-center items-center">
                <View className="flex gap-4 mb-10">
                    <LunchToggle
                        lunch={thirdLunch}
                        lunchToggle={() => {
                            setThirdLunch(!thirdLunch);
                        }}
                        period={3}
                    />
                    <LunchToggle
                        lunch={fourthLunch}
                        lunchToggle={() => {
                            setFourthLunch(!fourthLunch);
                        }}
                        period={4}
                    />
                </View>
                {rollingTime != 0 && (
                    <>
                        <Timer time={rollingTime} />
                        <Text>Left in Current Period</Text>
                    </>
                )}
            </View>
        </View>
    );
}
