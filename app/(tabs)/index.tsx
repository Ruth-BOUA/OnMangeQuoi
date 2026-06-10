import { ScrollView, Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { usePlanningStore } from "../../lib/stores/planningStore";
import { useDishStore } from "../../lib/stores/dishStore";
import { useMemberStore } from "../../lib/stores/memberStore";
import { Colors } from "../../constants/colors";
import type { MealSlot } from "../../types";

const TODAY = new Date().toISOString().split("T")[0];

const SLOTS: { key: MealSlot; label: string }[] = [
    { key: "lunch", label: "Déjeuner" },
    { key: "dinner", label: "Dîner" },
];

export default function HomeScreen() {
    const { plans, loading: planLoading, fetchPlans } = usePlanningStore();
    const { dishes, portions, loading: dishLoading, fetchAll } = useDishStore();
    const { members, fetchMembers } = useMemberStore();

    useFocusEffect(
        useCallback(() => {
            fetchPlans();
            fetchAll();
            fetchMembers();
        }, [])
    );

    const loading = planLoading || dishLoading;
    const todayPlans = plans.filter((p) => p.date === TODAY);

    const lowStockDishes = dishes.filter((dish) => {
        const remaining = portions
            .filter((p) => p.dish_id === dish.id)
            .reduce((sum, p) => sum + p.remaining, 0);
        return remaining > 0 && remaining <= 2;
    });

    function getPlansForSlot(slot: MealSlot) {
        return todayPlans.filter((p) => p.slot === slot);
    }

    function getRemainingForDish(dishId: string) {
        return portions
            .filter((p) => p.dish_id === dishId)
            .reduce((sum, p) => sum + p.remaining, 0);
    }

    if (loading && todayPlans.length === 0 && dishes.length === 0) {
        return (
            <Screen>
                <PageHeader title="Aujourd'hui" />
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            </Screen>
        );
    }

    return (
        <Screen>
            <PageHeader title="Aujourd'hui" />

            <ScrollView contentContainerStyle={styles.scroll}>

                {SLOTS.map(({ key: slot, label }) => {
                    const slotPlans = getPlansForSlot(slot);
                    return (
                        <Card key={slot}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>{label}</Text>
                                <Pressable onPress={() => router.push(`/planning/${TODAY}`)}>
                                    <Text style={styles.editLink}>Modifier</Text>
                                </Pressable>
                            </View>

                            {slotPlans.length === 0 ? (
                                <Text style={styles.empty}>Aucun repas planifié</Text>
                            ) : (
                                slotPlans.map((plan) => (
                                    <View key={plan.id} style={styles.mealRow}>
                                        <View style={[styles.memberDot, { backgroundColor: plan.member.avatar_color }]} />
                                        <Text style={styles.memberName}>{plan.member.name}</Text>
                                        <Text style={styles.dishName}>{plan.dish.name}</Text>
                                    </View>
                                ))
                            )}

                            {members.length > 0 && slotPlans.length < members.length && slotPlans.length > 0 && (
                                <Text style={styles.partial}>
                                    {members.length - slotPlans.length} membre{members.length - slotPlans.length > 1 ? "s" : ""} sans repas
                                </Text>
                            )}
                        </Card>
                    );
                })}

                {lowStockDishes.length > 0 && (
                    <Card>
                        <Text style={styles.sectionTitle}>⚠️ Portions faibles</Text>
                        {lowStockDishes.map((dish) => {
                            const remaining = getRemainingForDish(dish.id);
                            return (
                                <Pressable
                                    key={dish.id}
                                    style={styles.mealRow}
                                    onPress={() => router.push(`/dishes/${dish.id}`)}
                                >
                                    <Text style={styles.lowStockText}>
                                        {dish.name}
                                    </Text>
                                    <Text style={styles.lowStockCount}>
                                        {remaining} restante{remaining > 1 ? "s" : ""}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </Card>
                )}

                {todayPlans.length === 0 && lowStockDishes.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateTitle}>Rien de planifié aujourd'hui</Text>
                        <Pressable
                            style={styles.planBtn}
                            onPress={() => router.push(`/planning/${TODAY}`)}
                        >
                            <Text style={styles.planBtnText}>Planifier les repas</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        fontWeight: "700",
        fontSize: 17,
        color: Colors.text,
    },
    editLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: "600",
    },
    mealRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        gap: 8,
    },
    memberDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    memberName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        width: 90,
    },
    dishName: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    partial: {
        fontSize: 12,
        color: Colors.warning,
        marginTop: 8,
    },
    empty: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontStyle: "italic",
    },
    lowStockText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.warning,
        flex: 1,
    },
    lowStockCount: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyStateTitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    planBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    planBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
