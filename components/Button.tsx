import React from "react";
import { Pressable, Text } from "react-native";

interface Props {
    onPress: () => void;
    clickDisabled: boolean;
    lookDisabled: boolean;
    content: string;
}
export default function MyButton({
    onPress,
    clickDisabled,
    lookDisabled = clickDisabled,
    content,
}: Props) {
    return (
        <Pressable onPress={onPress} disabled={clickDisabled}>
            <Text
                className={`${lookDisabled ? "bg-slate-400" : "bg-blue-500"} py-2 px-5 rounded-lg text-white text-bold text-xl`}
            >
                {content}
            </Text>
        </Pressable>
    );
}
