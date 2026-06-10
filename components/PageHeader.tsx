import { Text, View, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

type Props = {
    title: string;
};

export default function PageHeader({ title }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.text,
    },
});