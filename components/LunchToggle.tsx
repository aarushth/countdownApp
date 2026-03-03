import React from "react";
import { View } from "react-native";
import Button from "./Button";
import { LargeText } from "./MyAppText";
interface Props {
    lunch: boolean;
    lunchToggle: () => void;
    period: number;
}
export default function LunchToggle({ lunch, lunchToggle, period }: Props) {
    return (
        <View
            style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                justifyContent: "space-between",
            }}
        >
            <LargeText>Period {period} Lunch:</LargeText>
            <View
                style={{
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                <Button
                    onPress={lunchToggle}
                    clickDisabled={lunch}
                    lookDisabled={!lunch}
                    title={"A"}
                ></Button>
                <Button
                    onPress={lunchToggle}
                    clickDisabled={!lunch}
                    lookDisabled={lunch}
                    title={"B"}
                ></Button>
            </View>
        </View>
    );
}
