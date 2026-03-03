import React from "react";
import { View } from "react-native";
import { styles } from "./styles";
import { SmallText, StaticDigit } from "./MyAppText";

export default function Timer({ time }: { time: number }) {
    const days = Math.floor(time / 86400)
        .toString()
        .padStart(2, "0");
    const hours = Math.floor((time % 86400) / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");

    return (
        <View style={styles.rowContainer}>
            <StaticDigit>{days}</StaticDigit>
            <SmallText>Days</SmallText>
            <StaticDigit>{hours}</StaticDigit>
            <SmallText>Hours</SmallText>
            <StaticDigit>{minutes}</StaticDigit>
            <SmallText>Minutes</SmallText>
            <StaticDigit>{seconds}</StaticDigit>
            <SmallText>Seconds</SmallText>
        </View>
    );
}
