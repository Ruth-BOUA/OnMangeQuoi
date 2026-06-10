import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Screen from "../../components/Screen";
import { useDishStore } from "../../lib/stores/dishStore";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/colors";

async function uploadPhoto(uri: string): Promise<string | null> {
    const ext = uri.split(".").pop() ?? "jpg";
    const fileName = `dish-${Date.now()}.${ext}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const { data, error } = await supabase.storage
        .from("dish-photos")
        .upload(fileName, blob, { contentType: `image/${ext}` });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from("dish-photos").getPublicUrl(data.path);
    return urlData.publicUrl;
}

export default function NewDishScreen() {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const addDish = useDishStore((s) => s.addDish);

    async function pickPhoto() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    }

    async function handleSave() {
        if (!name.trim()) return;
        setSaving(true);
        let photo_uri: string | undefined;
        if (photoUri) {
            const url = await uploadPhoto(photoUri);
            photo_uri = url ?? undefined;
        }
        const dish = await addDish({ name: name.trim(), notes: notes.trim(), photo_uri });
        setSaving(false);
        if (!dish) {
            Alert.alert("Erreur", "Impossible de sauvegarder le plat.");
            return;
        }
        router.back();
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
                    <Text style={styles.navTitle}>Nouveau plat</Text>
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

                <ScrollView
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable onPress={pickPhoto} style={styles.photoPicker}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoIcon}>📷</Text>
                                <Text style={styles.photoLabel}>Ajouter une photo</Text>
                            </View>
                        )}
                    </Pressable>

                    <Text style={styles.label}>Nom du plat *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex : Kedjenou de poulet"
                        placeholderTextColor={Colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="sentences"
                        returnKeyType="next"
                    />

                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        placeholder="Ingrédients, variantes, remarques..."
                        placeholderTextColor={Colors.textSecondary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </ScrollView>
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
    photoPicker: {
        alignSelf: "center",
        marginBottom: 28,
    },
    photo: {
        width: 200,
        height: 150,
        borderRadius: 14,
    },
    photoPlaceholder: {
        width: 200,
        height: 150,
        borderRadius: 14,
        backgroundColor: Colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    photoIcon: {
        fontSize: 36,
    },
    photoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 8,
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
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputMultiline: {
        minHeight: 110,
    },
});
