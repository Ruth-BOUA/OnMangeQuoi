import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Aujourd'hui",
                }}
            />

            <Tabs.Screen
                name="planning"
                options={{
                    title: "Planning",
                }}
            />

            <Tabs.Screen
                name="dishes"
                options={{
                    title: "Plats",
                }}
            />

            <Tabs.Screen
                name="more"
                options={{
                    title: "Plus",
                }}
            />
        </Tabs>
    );
}