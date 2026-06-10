import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { Colors } from "../constants/colors";

type Props = {
    children: ReactNode;
};

export default function Card({ children }: Props) {
    return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,

        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 2,
    },
});