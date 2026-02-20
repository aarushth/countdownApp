import React from "react";
import { View, Text, Pressable } from "react-native";
import Button from "./Button";
interface Props {
    lunch: boolean;
    lunchToggle: () => void;
    period: number;
}
export default function LunchToggle({ lunch, lunchToggle, period }: Props) {
    return (
        <View className="flex flex-row justify-between">
            <Text className="text-nowrap my-auto">Period {period} Lunch:</Text>
            <View className="flex flex-row gap-4">
                <Button
                    onPress={lunchToggle}
                    clickDisabled={lunch}
                    lookDisabled={!lunch}
                    content={"A"}
                ></Button>
                <Button
                    onPress={lunchToggle}
                    clickDisabled={!lunch}
                    lookDisabled={lunch}
                    content={"B"}
                ></Button>
            </View>
        </View>
    );
}
