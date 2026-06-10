import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Modal,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import Screen from "../../components/Screen";
import { usePlanningStore } from "../../lib/stores/planningStore";
import { useMemberStore } from "../../lib/stores/memberStore";
import { useDishStore } from "../../lib/stores/dishStore";
import { Colors } from "../../constants/colors";
import type { MealSlot, Dish } from "../../types";

const SLOTS: { key: MealSlot; label: string }[] = [
    { key: "lunch", label: "Déjeuner" },
    { key: "dinner", label: "Dîner" },
];

export default function DayPlanningScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();

    const { plans, addPlan, removePlan, fetchPlans } = usePlanningStore();
    const { members, fetchMembers } = useMemberStore();
    const { dishes, portions, fetchAll } = useDishStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [assigning, setAssigning] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchPlans();
            fetchMembers();
            if (dishes.length === 0) fetchAll();
        }, [])
    );

    const dayPlans = plans.filter((p) => p.date === date);

    function getPlan(memberId: string, slot: MealSlot) {
        return dayPlans.find((p) => p.member_id === memberId && p.slot === slot);
    }

    function getRemainingForDish(dishId: string) {
        return portions
            .filter((p) => p.dish_id === dishId)
            .reduce((sum, p) => sum + p.remaining, 0);
    }

    function openModal(memberId: string, slot: MealSlot) {
        setSelectedMemberId(memberId);
        setSelectedSlot(slot);
        setModalVisible(true);
    }

    async function handleSelectDish(dish: Dish) {
        if (!selectedSlot || !selectedMemberId) return;
        setModalVisible(false);
        setAssigning(true);
        const success = await addPlan({
            date,
            slot: selectedSlot,
            memberId: selectedMemberId,
            dishId: dish.id,
        });
        setAssigning(false);
        if (!success) {
            Alert.alert("Erreur", "Impossible d'assigner ce plat. Vérifiez qu'il reste des portions.");
        }
    }

    function handleRemovePlan(planId: string, portionId: string, dishName: string) {
        Alert.alert(
            "Retirer ce repas ?",
            `"${dishName}" sera retiré du planning. La portion sera restituée.`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Retirer",
                    style: "destructive",
                    onPress: () => removePlan(planId, portionId),
                },
            ]
        );
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    }

    return (
        <Screen>
            <View style={styles.navBar}>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backText}>‹ Retour</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.dateTitle}>{formatDate(date)}</Text>

                {assigning && (
                    <ActivityIndicator style={{ marginBottom: 12 }} color={Colors.primary} />
                )}

                {SLOTS.map(({ key: slot, label }) => (
                    <View key={slot} style={styles.slotSection}>
                        <Text style={styles.slotTitle}>{label}</Text>

                        {members.map((member) => {
                            const plan = getPlan(member.id, slot);
                            return (
                                <View key={member.id} style={styles.memberRow}>
                                    <View style={[styles.avatar, { backgroundColor: member.avatar_color + "22" }]}>
                                        <Text style={[styles.avatarText, { color: member.avatar_color }]}>
                                            {member.name[0].toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.memberName}>{member.name}</Text>

                                    {plan ? (
                                        <Pressable
                                            style={styles.dishTag}
                                            onPress={() => handleRemovePlan(plan.id, plan.meal_portion_id, plan.dish.name)}
                                        >
                                            <Text style={styles.dishTagText}>{plan.dish.name}</Text>
                                            <Text style={styles.dishTagRemove}>✕</Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            style={styles.assignBtn}
                                            onPress={() => openModal(member.id, slot)}
                                        >
                                            <Text style={styles.assignBtnText}>+ Assigner</Text>
                                        </Pressable>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Choisir un plat</Text>
                        <Pressable onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalClose}>Fermer</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={dishes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.modalList}
                        renderItem={({ item }) => {
                            const remaining = getRemainingForDish(item.id);
                            const disabled = remaining === 0;
                            return (
                                <Pressable
                                    style={[styles.modalItem, disabled && styles.modalItemDisabled]}
                                    onPress={() => !disabled && handleSelectDish(item)}
                                    disabled={disabled}
                                >
                                    <View style={styles.modalItemInfo}>
                                        <Text style={[styles.modalItemName, disabled && styles.modalItemNameDisabled]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[styles.modalItemPortions, disabled && styles.modalItemPortionsDisabled]}>
                                            {remaining === 0
                                                ? "Aucune portion disponible"
                                                : `${remaining} portion${remaining > 1 ? "s" : ""} disponible${remaining > 1 ? "s" : ""}`}
                                        </Text>
                                    </View>
                                    {!disabled && <Text style={styles.modalItemChevron}>›</Text>}
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={styles.modalEmpty}>
                                Aucun plat disponible.{"\n"}Ajoute des plats dans l'onglet "Plats".
                            </Text>
                        }
                    />
                </View>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    navBar: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backText: {
        fontSize: 16,
        color: Colors.primary,
    },
    content: {
        padding: 20,
        paddingTop: 4,
    },
    dateTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 24,
        textTransform: "capitalize",
    },
    slotSection: {
        marginBottom: 24,
    },
    slotTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 12,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    avatarText: {
        fontSize: 15,
        fontWeight: "700",
    },
    memberName: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.text,
        flex: 1,
    },
    dishTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary + "15",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    dishTagText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    dishTagRemove: {
        fontSize: 11,
        color: Colors.primary,
    },
    assignBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: "dashed",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    assignBtnText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    modal: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.text,
    },
    modalClose: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    modalList: {
        padding: 20,
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalItemDisabled: {
        opacity: 0.45,
    },
    modalItemInfo: {
        flex: 1,
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    modalItemNameDisabled: {
        color: Colors.textSecondary,
    },
    modalItemPortions: {
        fontSize: 13,
        color: Colors.primary,
        marginTop: 2,
    },
    modalItemPortionsDisabled: {
        color: Colors.textSecondary,
    },
    modalItemChevron: {
        fontSize: 20,
        color: Colors.border,
    },
    modalEmpty: {
        textAlign: "center",
        color: Colors.textSecondary,
        marginTop: 60,
        lineHeight: 24,
    },
});
