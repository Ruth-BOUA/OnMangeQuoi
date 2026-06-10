import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import Screen from "../../components/Screen";
import { useShoppingStore } from "../../lib/stores/shoppingStore";
import { Colors } from "../../constants/colors";

export default function NewShoppingListScreen() {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const addList = useShoppingStore((s) => s.addList);

    async function handleSave() {
        if (!name.trim()) return;
        setSaving(true);
        const list = await addList(name.trim());
        setSaving(false);
        if (!list) {
            Alert.alert("Erreur", "Impossible de créer la liste.");
            return;
        }
        router.replace(`/shopping/${list.id}`);
    }

    return (
        <Screen>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.navBar}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.cancel}>Annuler</Text>
                    </Pressable>
                    <Text style={styles.navTitle}>Nouvelle liste</Text>
                    <Pressable onPress={handleSave} disabled={!name.trim() || saving}>
                        {saving ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>
                                Créer
                            </Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Nom de la liste *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex : Courses du weekend"
                        placeholderTextColor={Colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="sentences"
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                    />
                </View>
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
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.text,
    },
    cancel: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    save: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
    },
    saveDisabled: {
        opacity: 0.4,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
