import React from "react";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { styles, DIGIT_HEIGHT } from "./styles";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { SmallText } from "./MyAppText";

function OdometerDigit({ digit, max }: { digit: number; max: number }) {
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
        <View style={styles.digitContainer}>
            <Animated.View
                style={useAnimatedStyle(() => ({
                    transform: [{ translateY: translateY.value }],
                }))}
            >
                {arr.map((num) => (
                    <Text key={num} style={styles.digitText}>
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
        <View style={styles.rowContainer}>
            {daysDigits.map((digit, index) => (
                <OdometerDigit key={index} digit={digit} max={10} />
            ))}
            <SmallText>Days</SmallText>
            {hoursDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 3 : hours == 0 || hours >= 23 ? 4 : 10}
                />
            ))}
            <SmallText>Hours</SmallText>
            {minutesDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 6 : 10}
                />
            ))}
            <SmallText>Minutes</SmallText>
            {secondsDigits.map((digit, index) => (
                <OdometerDigit
                    key={index}
                    digit={digit}
                    max={index == 0 ? 6 : 10}
                />
            ))}
            <SmallText>Seconds</SmallText>
        </View>
    );
}
