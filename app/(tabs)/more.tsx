import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function MoreScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Plus</Text>

            <Pressable
                style={styles.item}
                onPress={() => router.push("/members")}
            >
                <Text>👥 Membres</Text>
            </Pressable>

            <Pressable
                style={styles.item}
                onPress={() => router.push("/shopping")}
            >
                <Text>🛒 Courses</Text>
            </Pressable>

            <Pressable style={styles.item}>
                <Text>🔄 Synchronisation</Text>
            </Pressable>

            <Pressable style={styles.item}>
                <Text>⚙️ Paramètres</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
    },

    item: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
});