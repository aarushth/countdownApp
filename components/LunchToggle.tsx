import React from "react";
import { Button, View, Text, Pressable } from "react-native";

interface Props {
    lunch: boolean;
    lunchToggle: () => void;
    period: number;
}
export default function LunchToggle({ lunch, lunchToggle, period }: Props) {
    return (
        <View className="flex flex-row gap-3 justify-even">
            <Text className="flex-1 w-full text-nowrap my-auto">
                Period {period} Lunch:
            </Text>
            <Pressable onPress={lunchToggle} disabled={lunch}>
                <Text
                    className={`${lunch ? "bg-blue-500" : "bg-slate-400"} py-2 px-5 rounded-lg text-white text-bold text-xl`}
                >
                    A
                </Text>
            </Pressable>
            <Pressable onPress={lunchToggle} disabled={!lunch}>
                <Text
                    className={`${!lunch ? "bg-blue-500" : "bg-slate-400"} py-2 px-5 rounded-lg text-white text-bold text-xl`}
                >
                    B
                </Text>
            </Pressable>
        </View>
    );
}
