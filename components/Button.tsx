import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "./styles";

interface Props {
    onPress: () => void;
    clickDisabled?: boolean;
    lookDisabled?: boolean;
    title: string;
}
export default function MyButton({
    onPress,
    clickDisabled = false,
    lookDisabled = clickDisabled,
    title,
}: Props) {
    return (
        <Pressable onPress={onPress} disabled={clickDisabled}>
            <Text
                style={[
                    styles.buttonText,
                    {
                        backgroundColor: `${lookDisabled ? "rgba(148,163,184,0.6)" : "#d185ed"}`,
                    },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}
