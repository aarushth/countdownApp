import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Timer({ time }: { time: number }) {
    const DIGIT_HEIGHT = 40;
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
        <View style={styles.container}>
            <View style={[styles.digitContainer, { height: DIGIT_HEIGHT }]}>
                <Text
                    style={[
                        styles.digitText,
                        {
                            height: DIGIT_HEIGHT,
                            fontSize: DIGIT_HEIGHT - 4,
                            lineHeight: DIGIT_HEIGHT,
                        },
                    ]}
                >
                    {days}
                </Text>
            </View>
            <Text className={textStyle}>Days</Text>
            <View style={[styles.digitContainer, { height: DIGIT_HEIGHT }]}>
                <Text
                    style={[
                        styles.digitText,
                        {
                            height: DIGIT_HEIGHT,
                            fontSize: DIGIT_HEIGHT - 4,
                            lineHeight: DIGIT_HEIGHT,
                        },
                    ]}
                >
                    {hours}
                </Text>
            </View>
            <Text className={textStyle}>Hours</Text>
            <View style={[styles.digitContainer, { height: DIGIT_HEIGHT }]}>
                <Text
                    style={[
                        styles.digitText,
                        {
                            height: DIGIT_HEIGHT,
                            fontSize: DIGIT_HEIGHT - 4,
                            lineHeight: DIGIT_HEIGHT,
                        },
                    ]}
                >
                    {minutes}
                </Text>
            </View>
            <Text className={textStyle}>Minutes</Text>
            <View style={[styles.digitContainer, { height: DIGIT_HEIGHT }]}>
                <Text
                    style={[
                        styles.digitText,
                        {
                            height: DIGIT_HEIGHT,
                            fontSize: DIGIT_HEIGHT - 4,
                            lineHeight: DIGIT_HEIGHT,
                        },
                    ]}
                >
                    {seconds}
                </Text>
            </View>
            <Text className={textStyle}>Seconds</Text>
        </View>
    );
}
const textStyle = "text-xs";
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    digitContainer: {
        overflow: "hidden",
    },
    digitText: {
        fontWeight: "700",
        fontFamily: "sans-serif",
        color: "#0b2369",
        textAlign: "center",
    },
});
