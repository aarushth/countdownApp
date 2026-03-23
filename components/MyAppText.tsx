import React, { type ReactNode } from "react";
import { styles } from "./styles";
import { Text, View } from "react-native";

export const SmallText = ({ children }: { children: ReactNode }) => {
    return <Text style={styles.smallText}>{children}</Text>;
};

export const LargeText = ({ children }: { children: ReactNode }) => {
    return <Text style={styles.largeText}>{children}</Text>;
};

export const StaticDigit = ({ children }: { children: ReactNode }) => {
    return (
        <View style={styles.digitContainer}>
            <Text style={styles.digitText}>{children}</Text>
        </View>
    );
};
