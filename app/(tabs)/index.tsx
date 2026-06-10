import { ScrollView, Text, View, StyleSheet } from "react-native";

import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

export default function HomeScreen() {
    return (
        <Screen>
            <PageHeader title="Aujourd'hui" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                }}
            >
                <Card>
                    <Text style={styles.sectionTitle}>Déjeuner</Text>

                    <Text>Ruth • Kedjenou</Text>
                    <Text>Elischama • Lasagnes</Text>
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>Dîner</Text>

                    <Text>Ruth • Pizza</Text>
                    <Text>Elischama • Pizza</Text>
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>
                        Portions faibles
                    </Text>

                    <Text>⚠️ Lasagnes (1 restante)</Text>
                </Card>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 10,
    },
});