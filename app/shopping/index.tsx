import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlashList } from "@shopify/flash-list";
import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import { useShoppingStore } from "../../lib/stores/shoppingStore";
import { Colors } from "../../constants/colors";
import type { ShoppingList } from "../../types";

export default function ShoppingIndexScreen() {
    const { lists, loading, fetchLists } = useShoppingStore();

    useFocusEffect(
        useCallback(() => {
            fetchLists();
        }, [])
    );

    function formatDate(dateStr: string | null) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
        });
    }

    function renderList({ item }: { item: ShoppingList }) {
        return (
            <Pressable
                style={[styles.item, item.is_done && styles.itemDone]}
                onPress={() => router.push(`/shopping/${item.id}`)}
            >
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.is_done && styles.itemNameDone]}>
                        {item.name}
                    </Text>
                    <Text style={styles.itemDate}>Créée le {formatDate(item.created_at)}</Text>
                </View>
                {item.is_done ? (
                    <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>Terminée</Text>
                    </View>
                ) : (
                    <Text style={styles.chevron}>›</Text>
                )}
            </Pressable>
        );
    }

    return (
        <Screen>
            <View style={styles.header}>
                <PageHeader title="Courses" />
                <Pressable style={styles.addBtn} onPress={() => router.push("/shopping/new")}>
                    <Text style={styles.addBtnText}>+</Text>
                </Pressable>
            </View>

            {loading && lists.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlashList
                    data={lists}
                    renderItem={renderList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            Aucune liste pour l'instant.{"\n"}Appuie sur + pour en créer une.
                        </Text>
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
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    itemDone: {
        opacity: 0.6,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    itemNameDone: {
        textDecorationLine: "line-through",
        color: Colors.textSecondary,
    },
    itemDate: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    doneBadge: {
        backgroundColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    doneBadgeText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: "600",
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
