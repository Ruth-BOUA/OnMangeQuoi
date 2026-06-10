import { FlashList } from "@shopify/flash-list";
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import { useDishStore } from "../../lib/stores/dishStore";
import { Colors } from "../../constants/colors";
import type { Dish } from "../../types";

export default function DishesScreen() {
    const { dishes, portions, loading, fetchAll } = useDishStore();

    // 1. Recharger au focus
    useFocusEffect(
        useCallback(() => {
            fetchAll();
        }, [])
    );


    // 2. Calculer les portions restantes pour un plat
    function getRemainingForDish(dishId: string): number {
        const remaining = portions
            .filter((p) => p.dish_id === dishId)
            .reduce((sum, p) => sum + p.remaining, 0);
        return remaining;

    }

    // 3. Rendu d'un item de la liste
    function renderDish({ item }: { item: Dish }) {
        const remaining = getRemainingForDish(item.id);
        return (
            <Pressable style={styles.item} onPress={() => router.push(`/dishes/${item.id}`)}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={[styles.portions, remaining === 0 && styles.portionsEmpty, remaining <= 2 && remaining > 0 && styles.portionsLow]}>
                        {remaining === 0 ? "Aucune portion" : `${remaining} portion${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
                    </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </Pressable>
        );
    }

    return (
        <Screen>
            <View style={styles.header}>
                <PageHeader title="Mes plats" />
                <Pressable style={styles.addBtn} onPress={() => router.push("/dishes/new")}>
                    <Text style={styles.addBtnText}>+</Text>
                </Pressable>
            </View>

            {loading && dishes.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlashList
                    data={dishes}
                    renderItem={renderDish}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Aucun plat pour l'instant.{"\n"}Appuie sur + pour en ajouter un.</Text>
                    }
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 20,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnText: {
        color: "#fff",
        fontSize: 24,
        lineHeight: 28,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary + "22",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.primary,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    portions: {
        fontSize: 13,
        marginTop: 2,
        color: Colors.textSecondary,
    },
    portionsLow: {
        color: Colors.warning,
    },
    portionsEmpty: {
        color: Colors.textSecondary,
    },
    chevron: {
        fontSize: 20,
        color: Colors.border,
        marginLeft: 8,
    },
    empty: {
        textAlign: "center",
        color: Colors.textSecondary,
        marginTop: 60,
        lineHeight: 24,
    },
});
