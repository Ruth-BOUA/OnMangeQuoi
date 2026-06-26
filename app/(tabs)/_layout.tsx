import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type TabIconProps = {
    icon: IoniconsName;
    iconOutline: IoniconsName;
    focused: boolean;
};

function TabIcon({ icon, iconOutline, focused }: TabIconProps) {
    return (
        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons
                name={focused ? icon : iconOutline}
                size={22}
                color={focused ? Colors.primary : Colors.textSecondary}
            />
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    marginBottom: 6,
                },
                tabBarStyle: {
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: 80,
                    paddingTop: 8,
                    backgroundColor: Colors.card,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: -4 },
                    elevation: 8,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Aujourd'hui",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="home" iconOutline="home-outline" />
                    ),
                }}
            />

            <Tabs.Screen
                name="planning"
                options={{
                    title: "Planning",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="calendar" iconOutline="calendar-outline" />
                    ),
                }}
            />

            <Tabs.Screen
                name="dishes"
                options={{
                    title: "Plats",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="restaurant" iconOutline="restaurant-outline" />
                    ),
                }}
            />

            <Tabs.Screen
                name="shopping"
                options={{
                    title: "Courses",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="cart" iconOutline="cart-outline" />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 44,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrapActive: {
        backgroundColor: Colors.primary + "18",
    },
});
