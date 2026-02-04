import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Text } from "react-native";

interface Period {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}
export default function TimerView() {
    const db = useSQLiteContext();
    const [result, setResult] = useState<Period[]>();

    useEffect(() => {
        const getDb = async () => {
            const rows: Period[] = await db.getAllAsync(
                "SELECT * FROM schedule LIMIT 10;",
            );
            setResult(rows);
        };

        getDb();
    }, [db]);

    return <Text>Results: {JSON.stringify(result)}</Text>;
}
