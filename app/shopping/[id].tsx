import {
    View,
    Text,
    StyleSheet,
    Pressable,
    FlatList,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import Screen from "../../components/Screen";
import { useShoppingStore } from "../../lib/stores/shoppingStore";
import { Colors } from "../../constants/colors";
import type { ShoppingItem } from "../../types";

export default function ShoppingListScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { lists, items, fetchLists, fetchItems, addItem, toggleItem, deleteItem, markListDone, deleteList } =
        useShoppingStore();

    const [itemName, setItemName] = useState("");
    const [itemQty, setItemQty] = useState("");
    const [adding, setAdding] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (lists.length === 0) fetchLists();
            fetchItems(id);
        }, [id])
    );

    const list = lists.find((l) => l.id === id);
    const listItems = items[id] ?? [];
    const checkedCount = listItems.filter((i) => i.is_checked).length;

    async function handleAddItem() {
        if (!itemName.trim()) return;
        setAdding(true);
        await addItem(id, itemName.trim(), itemQty.trim() || undefined);
        setAdding(false);
        setItemName("");
        setItemQty("");
    }

    function handleDeleteItem(item: ShoppingItem) {
        Alert.alert("Supprimer cet article ?", item.name, [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: () => deleteItem(item.id, id),
            },
        ]);
    }

    function handleMarkDone() {
        Alert.alert("Terminer la liste ?", "La liste sera marquée comme terminée.", [
            { text: "Annuler", style: "cancel" },
            { text: "Terminer", onPress: () => markListDone(id) },
        ]);
    }

    function handleDeleteList() {
        Alert.alert("Supprimer cette liste ?", `"${list?.name}" et tous ses articles seront supprimés.`, [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    await deleteList(id);
                    router.back();
                },
            },
        ]);
    }

    function renderItem({ item }: { item: ShoppingItem }) {
        return (
            <Pressable style={styles.item} onPress={() => toggleItem(item)}>
                <View style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}>
                    {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.is_checked && styles.itemNameChecked]}>
                        {item.name}
                    </Text>
                    {item.quantity ? (
                        <Text style={styles.itemQty}>{item.quantity}</Text>
                    ) : null}
                </View>
                {!list?.is_done && (
                    <Pressable onPress={() => handleDeleteItem(item)} hitSlop={8}>
                        <Text style={styles.deleteIcon}>✕</Text>
                    </Pressable>
                )}
            </Pressable>
        );
    }

    if (!list) {
        return (
            <Screen>
                <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
            </Screen>
        );
    }

    return (
        <Screen>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.navBar}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.backText}>‹ Retour</Text>
                    </Pressable>
                    <Pressable onPress={handleDeleteList}>
                        <Text style={styles.deleteText}>Supprimer</Text>
                    </Pressable>
                </View>

                <View style={styles.listHeader}>
                    <Text style={styles.listName}>{list.name}</Text>
                    {listItems.length > 0 && (
                        <Text style={styles.progress}>
                            {checkedCount} / {listItems.length} article{listItems.length > 1 ? "s" : ""}
                        </Text>
                    )}
                    {!list.is_done && listItems.length > 0 && checkedCount === listItems.length && (
                        <Pressable style={styles.doneBtn} onPress={handleMarkDone}>
                            <Text style={styles.doneBtnText}>Terminer la liste</Text>
                        </Pressable>
                    )}
                    {list.is_done && (
                        <View style={styles.doneBadge}>
                            <Text style={styles.doneBadgeText}>Liste terminée</Text>
                        </View>
                    )}
                </View>

                <FlatList
                    data={listItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.itemsList}
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            Aucun article.{"\n"}Ajoute-en un ci-dessous.
                        </Text>
                    }
                />

                {!list.is_done && (
                    <View style={styles.addForm}>
                        <TextInput
                            style={[styles.addInput, { flex: 1 }]}
                            placeholder="Article"
                            placeholderTextColor={Colors.textSecondary}
                            value={itemName}
                            onChangeText={setItemName}
                            returnKeyType="done"
                            onSubmitEditing={handleAddItem}
                        />
                        <TextInput
                            style={[styles.addInput, styles.qtyInput]}
                            placeholder="Qté"
                            placeholderTextColor={Colors.textSecondary}
                            value={itemQty}
                            onChangeText={setItemQty}
                            returnKeyType="done"
                            onSubmitEditing={handleAddItem}
                        />
                        <Pressable
                            style={[styles.addBtn, (!itemName.trim() || adding) && styles.addBtnDisabled]}
                            onPress={handleAddItem}
                            disabled={!itemName.trim() || adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.addBtnText}>+</Text>
                            )}
                        </Pressable>
                    </View>
                )}
            </KeyboardAvoidingView>
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
    backText: {
        fontSize: 16,
        color: Colors.primary,
    },
    deleteText: {
        fontSize: 16,
        color: Colors.danger,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    listName: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 4,
    },
    progress: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    doneBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 4,
    },
    doneBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    doneBadge: {
        backgroundColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    doneBadgeText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: "600",
    },
    itemsList: {
        padding: 20,
        flexGrow: 1,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkmark: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.text,
    },
    itemNameChecked: {
        textDecorationLine: "line-through",
        color: Colors.textSecondary,
    },
    itemQty: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    deleteIcon: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    empty: {
        textAlign: "center",
        color: Colors.textSecondary,
        marginTop: 40,
        lineHeight: 24,
    },
    addForm: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.card,
    },
    addInput: {
        backgroundColor: Colors.background,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    qtyInput: {
        width: 70,
    },
    addBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnDisabled: {
        opacity: 0.5,
    },
    addBtnText: {
        color: "#fff",
        fontSize: 22,
        lineHeight: 26,
    },
});
