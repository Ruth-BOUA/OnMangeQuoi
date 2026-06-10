import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Image,
    Alert,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import Screen from "../../components/Screen";
import { useDishStore } from "../../lib/stores/dishStore";
import { Colors } from "../../constants/colors";

export default function DishDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { dishes, portions, fetchAll, addPortion, deleteDish } = useDishStore();

    const [addingPortion, setAddingPortion] = useState(false);
    const [portionCount, setPortionCount] = useState("");
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (dishes.length === 0) fetchAll();
        }, [])
    );

    const dish = dishes.find((d) => d.id === id);
    const dishPortions = portions
        .filter((p) => p.dish_id === id)
        .sort((a, b) => new Date(b.cooked_at).getTime() - new Date(a.cooked_at).getTime());
    const totalRemaining = dishPortions.reduce((sum, p) => sum + p.remaining, 0);

    async function handleAddPortion() {
        const count = parseInt(portionCount, 10);
        if (!count || count <= 0) return;
        setSaving(true);
        await addPortion(id, count);
        setSaving(false);
        setPortionCount("");
        setAddingPortion(false);
    }

    function handleDelete() {
        Alert.alert(
            "Supprimer ce plat ?",
            `"${dish?.name}" et toutes ses portions seront supprimés.`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        await deleteDish(id);
                        router.back();
                    },
                },
            ]
        );
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
        });
    }

    if (!dish) {
        return (
            <Screen>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>‹ Retour</Text>
                </Pressable>
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.navBar}>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backText}>‹ Retour</Text>
                </Pressable>
                <Pressable onPress={handleDelete}>
                    <Text style={styles.deleteText}>Supprimer</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {dish.photo_uri ? (
                    <Image source={{ uri: dish.photo_uri }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoInitial}>{dish.name[0].toUpperCase()}</Text>
                    </View>
                )}

                <Text style={styles.title}>{dish.name}</Text>

                {dish.notes ? (
                    <Text style={styles.notes}>{dish.notes}</Text>
                ) : null}

                <View style={styles.summaryBadge}>
                    <Text style={styles.summaryText}>
                        {totalRemaining === 0
                            ? "Aucune portion disponible"
                            : `${totalRemaining} portion${totalRemaining > 1 ? "s" : ""} disponible${totalRemaining > 1 ? "s" : ""}`}
                    </Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lots cuisinés</Text>
                    <Pressable onPress={() => setAddingPortion(!addingPortion)}>
                        <Text style={styles.addPortionBtn}>
                            {addingPortion ? "Annuler" : "+ Ajouter"}
                        </Text>
                    </Pressable>
                </View>

                {addingPortion && (
                    <View style={styles.addForm}>
                        <TextInput
                            style={styles.portionInput}
                            placeholder="Nombre de portions cuisinées"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="number-pad"
                            value={portionCount}
                            onChangeText={setPortionCount}
                            autoFocus
                        />
                        <Pressable
                            style={[styles.confirmBtn, (!portionCount || saving) && styles.confirmBtnDisabled]}
                            onPress={handleAddPortion}
                            disabled={!portionCount || saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmBtnText}>Confirmer</Text>
                            )}
                        </Pressable>
                    </View>
                )}

                {dishPortions.length === 0 ? (
                    <Text style={styles.noPortions}>Aucun lot enregistré</Text>
                ) : (
                    dishPortions.map((portion) => (
                        <View key={portion.id} style={styles.portionItem}>
                            <View>
                                <Text style={styles.portionDate}>
                                    Cuisiné le {formatDate(portion.cooked_at)}
                                </Text>
                                <Text style={styles.portionDetail}>
                                    {portion.remaining} / {portion.total_count} portion{portion.total_count > 1 ? "s" : ""} restante{portion.remaining > 1 ? "s" : ""}
                                </Text>
                            </View>
                            {portion.remaining === 0 && (
                                <View style={styles.doneBadge}>
                                    <Text style={styles.doneBadgeText}>Terminé</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    backText: {
        fontSize: 16,
        color: Colors.primary,
    },
    deleteText: {
        fontSize: 16,
        color: Colors.danger,
    },
    content: {
        padding: 20,
        paddingTop: 4,
    },
    photo: {
        width: "100%",
        height: 200,
        borderRadius: 16,
        marginBottom: 20,
    },
    photoPlaceholder: {
        width: "100%",
        height: 160,
        borderRadius: 16,
        backgroundColor: Colors.primary + "15",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    photoInitial: {
        fontSize: 64,
        fontWeight: "700",
        color: Colors.primary,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
    },
    notes: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 20,
    },
    summaryBadge: {
        backgroundColor: Colors.primary + "15",
        borderRadius: 12,
        padding: 14,
        marginBottom: 28,
    },
    summaryText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.primary,
        textAlign: "center",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    addPortionBtn: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.primary,
    },
    addForm: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 10,
    },
    portionInput: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    confirmBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
    },
    confirmBtnDisabled: {
        opacity: 0.5,
    },
    confirmBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    noPortions: {
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: 20,
    },
    portionItem: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    portionDate: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.text,
    },
    portionDetail: {
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
});
