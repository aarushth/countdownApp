import { StyleSheet } from "react-native";

export const DIGIT_HEIGHT = 40;
export const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    digitContainer: {
        overflow: "hidden",
        height: DIGIT_HEIGHT,
    },
    timerContainer: {
        flexDirection: "column", // flex-col
        justifyContent: "center", // justify-center
        alignItems: "center", // items-center
        paddingVertical: 12, // py-3 ≈ 12px
    },
    currentTimerContainer: {
        borderWidth: 2,
        borderColor: "#ffffff",
        flexShrink: 1,
        padding: 20,
        borderRadius: 12,
    },
    digitText: {
        fontWeight: "700",
        fontFamily: "sans-serif",
        color: "#d185ed",
        textAlign: "center",
        height: DIGIT_HEIGHT,
        fontSize: DIGIT_HEIGHT - 4,
        lineHeight: DIGIT_HEIGHT,
    },
    smallText: {
        color: "#fff",
        fontSize: 10,
    },
    largeText: {
        color: "#fff",
        fontSize: 15,
        alignSelf: "center",
    },
    buttonText: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        color: "#fff",
        fontWeight: "700",
        fontSize: 20,
    },
    periodTimerContainter: {
        padding: 15,
    },
});
