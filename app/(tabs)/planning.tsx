import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["fr"] = {
    monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    monthNamesShort: ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
    dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";
import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import { usePlanningStore } from "../../lib/stores/planningStore";
import { useMemberStore } from "../../lib/stores/memberStore";
import { Colors } from "../../constants/colors";
import type { MealSlot } from "../../types";

const SLOTS: { key: MealSlot; label: string }[] = [
    { key: "lunch", label: "Déjeuner" },
    { key: "dinner", label: "Dîner" },
];

function todayString() {
    return new Date().toLocaleDateString("sv-SE");
}

function formatDate(dateStr: string) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export default function PlanningScreen() {
    const { plans, loading, fetchPlans } = usePlanningStore();
    const { members, fetchMembers } = useMemberStore();
    const [selectedDate, setSelectedDate] = useState(todayString());

    useFocusEffect(
        useCallback(() => {
            fetchPlans();
            fetchMembers();
        }, [])
    );

    const markedDates = plans.reduce<Record<string, any>>((acc, plan) => {
        acc[plan.date] = { ...(acc[plan.date] || {}), marked: true, dotColor: Colors.primary };
        return acc;
    }, {});

    markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: Colors.primary,
        dotColor: Colors.card,
    };

    function handleDayPress(day: DateData) {
        setSelectedDate(day.dateString);
    }

    const dayPlans = plans.filter((p) => p.date === selectedDate);

    function getPlan(memberId: string, slot: MealSlot) {
        return dayPlans.find((p) => p.member_id === memberId && p.slot === slot);
    }

    return (
        <Screen>
            <PageHeader title="Planning" />

            {loading && plans.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            onDayPress={handleDayPress}
                            firstDay={1}
                            markedDates={markedDates}
                            theme={{
                                selectedDayBackgroundColor: Colors.primary,
                                todayTextColor: Colors.primary,
                                dotColor: Colors.primary,
                                arrowColor: Colors.primary,
                                textDayFontSize: 15,
                                textMonthFontSize: 16,
                                textMonthFontWeight: "700",
                                calendarBackground: Colors.background,
                                dayTextColor: Colors.text,
                                textDisabledColor: Colors.border,
                                monthTextColor: Colors.text,
                            }}
                        />
                    </View>

                    <View style={styles.preview}>
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewDate}>{formatDate(selectedDate)}</Text>
                            <Pressable
                                style={styles.editBtn}
                                onPress={() => router.push(`/planning/${selectedDate}`)}
                            >
                                <Text style={styles.editBtnText}>Modifier</Text>
                            </Pressable>
                        </View>

                        {members.length === 0 ? (
                            <Text style={styles.empty}>Aucun membre enregistré.</Text>
                        ) : (
                            SLOTS.map(({ key: slot, label }) => (
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
                                                    <View style={styles.dishTag}>
                                                        <Text style={styles.dishTagText}>{plan.dish.name}</Text>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.noMeal}>—</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: 32,
    },
    calendarContainer: {
        marginTop: 8,
        paddingHorizontal: 8,
    },
    preview: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: Colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
    },
    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    previewDate: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
        textTransform: "capitalize",
        flex: 1,
    },
    editBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    editBtnText: {
        color: Colors.card,
        fontSize: 13,
        fontWeight: "600",
    },
    slotSection: {
        marginBottom: 16,
    },
    slotTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        gap: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 13,
        fontWeight: "700",
    },
    memberName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        flex: 1,
    },
    dishTag: {
        backgroundColor: Colors.primary + "15",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    dishTagText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.primary,
    },
    noMeal: {
        fontSize: 14,
        color: Colors.border,
    },
    empty: {
        textAlign: "center",
        color: Colors.textSecondary,
        fontSize: 14,
        marginVertical: 12,
    },
});
