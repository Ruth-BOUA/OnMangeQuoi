import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Calendar, DateData } from "react-native-calendars";
import Screen from "../../components/Screen";
import PageHeader from "../../components/PageHeader";
import { usePlanningStore } from "../../lib/stores/planningStore";
import { Colors } from "../../constants/colors";

export default function PlanningScreen() {
    const { plans, loading, fetchPlans } = usePlanningStore();

    useFocusEffect(
        useCallback(() => {
            fetchPlans();
        }, [])
    );

    const markedDates = plans.reduce<Record<string, { marked: boolean; dotColor: string }>>(
        (acc, plan) => {
            acc[plan.date] = { marked: true, dotColor: Colors.primary };
            return acc;
        },
        {}
    );

    function handleDayPress(day: DateData) {
        router.push(`/planning/${day.dateString}`);
    }

    return (
        <Screen>
            <PageHeader title="Planning" />

            {loading && plans.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <View style={styles.calendarContainer}>
                    <Calendar
                        onDayPress={handleDayPress}
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
                    <Text style={styles.hint}>Appuie sur un jour pour voir ou modifier les repas</Text>
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    calendarContainer: {
        marginTop: 8,
        paddingHorizontal: 8,
    },
    hint: {
        textAlign: "center",
        color: Colors.textSecondary,
        fontSize: 13,
        marginTop: 20,
    },
});
