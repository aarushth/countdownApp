import React from "react";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

function OdometerDigit({ digit, max }: { digit: number; max: number }) {
    const DIGIT_HEIGHT = 40;
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withTiming(
            -digit * DIGIT_HEIGHT,
            {
                duration: 300,
            },
            (finished) => {
                if (finished && digit == 0) {
                    translateY.value = -max * DIGIT_HEIGHT;
                }
            },
        );
    }, [digit]);
    const arr = Array.from({ length: max + 1 }, (_, i) => i);
    return (
        <View style={[styles.digitContainer, { height: DIGIT_HEIGHT }]}>
            <Animated.View
                style={useAnimatedStyle(() => ({
                    transform: [{ translateY: translateY.value }],
                }))}
            >
                {arr.map((num) => (
                    <Text
                        key={num}
                        style={[
                            styles.digitText,
                            {
                                height: DIGIT_HEIGHT,
                                fontSize: DIGIT_HEIGHT - 4,
                                lineHeight: DIGIT_HEIGHT,
                            },
                        ]}
                    >
                        {num % max}
                    </Text>
                ))}
            </Animated.View>
        </View>
    );
}

export default function Timer({ time }: { time: number }) {
    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    const toDigits = (n: number, pad = 2) =>
        n.toString().padStart(pad, "0").split("").map(Number);

    const daysDigits = toDigits(days, Math.max(2, days.toString().length));
    const hoursDigits = toDigits(hours);
    const minutesDigits = toDigits(minutes);
    const secondsDigits = toDigits(seconds);

    return (
        <View style={styles.container}>
            {daysDigits.map((digit, index) => (
                <OdometerDigit key={index} digit={digit} max={10} />
            ))}
            <Text className={textStyle}>Days</Text>
            {hoursDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 3 : hours < 5 ? 4 : 10}
                />
            ))}
            <Text className={textStyle}>Hours</Text>
            {minutesDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 6 : 10}
                />
            ))}
            <Text className={textStyle}>Minutes</Text>
            {secondsDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 6 : 10}
                />
            ))}
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
