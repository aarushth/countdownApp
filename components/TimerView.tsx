import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import Timer from "./Timer";

interface Period {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
}
export default function TimerView() {
    const db = useSQLiteContext();
    const [staticTime, setStaticTime] = useState<number[]>([]);
    const [rollingTime, setRollingTime] = useState<number[]>([]);
    const [resetTime, setResetTime] = useState<number>(Number.MAX_SAFE_INTEGER);

    const rollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const resetIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const initDb = async () => {
        type TotalTimeRow = {
            time: number | null;
        };
        const staticStatement = await db.prepareAsync(
            "SELECT SUM(strftime('%s', endTime) - strftime('%s', startTime)) AS time FROM schedule WHERE name = $name AND startTime > DATETIME('now')",
        );
        let tempStaticTime: number[] = [];
        let tempRollingTime: number[] = [];
        for (let period = 1; period <= 6; period++) {
            const name = `Period ${period}`;
            const staticResult = await staticStatement.executeAsync({
                $name: name,
            });
            const staticRow = await staticResult.getFirstAsync();
            tempStaticTime.concat((staticRow as TotalTimeRow).time!);

            const rollingStatement = await db.prepareAsync(
                "SELECT (strftime('%s', endTime) - strftime('%s', DATETIME('now'))) AS time FROM schedule WHERE name = $name AND startTime < DATETIME('now') AND endTime > DATETIME('now')",
            );

            const rollingResult = await rollingStatement.executeAsync({
                $name: `Period ${period}`,
            });
            const rollingRow = await rollingResult.getFirstAsync();

            tempRollingTime.concat(
                (rollingRow as TotalTimeRow | null)?.time ?? 0,
            );

            const resetStatement = await db.prepareAsync(
                `WITH active AS (
                    SELECT endTime AS time
                    FROM schedule
                    WHERE name = $name
                    AND startTime <= DATETIME('now')
                    AND endTime > DATETIME('now')
                    ORDER BY endTime
                    LIMIT 1
                ),
                upcoming AS (
                    SELECT startTime AS time
                    FROM schedule
                    WHERE name = $name
                    AND startTime > DATETIME('now')
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
            const resetResult = await resetStatement.executeAsync({
                $name: `Period ${period}`,
            });
            const resetRow = await resetResult.getFirstAsync();

            if (resetRow && (resetRow as TotalTimeRow).time! < resetTime) {
                setResetTime((resetRow as TotalTimeRow).time!);
            }
        }
        setStaticTime(tempStaticTime);
        setRollingTime(tempRollingTime);
    };

    useEffect(() => {
        initDb();
    }, [db]);

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
            if (resetTime.getTime() < now.getTime()) {
                initDb();
            }
        }, 1000);

        return () => {
            if (resetIntervalRef.current)
                clearInterval(resetIntervalRef.current);
        };
    }, [resetTime]);

    return (
        staticTime != null && (
            <>
                <Timer time={rollingTime + staticTime}></Timer>
                <Text>{resetTime ? resetTime.toString() : "nodate"}</Text>
            </>
        )
    );
}
