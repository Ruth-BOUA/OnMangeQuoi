import type { Tables } from "../lib/database.types";

export type Member = Tables<"members">;
export type Dish = Tables<"dishes">;
export type MealPortion = Tables<"meal_portions">;
export type MealPlan = Tables<"meal_plans">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingItem = Tables<"shopping_items">;

export type MealSlot = "lunch" | "dinner";

export type MealPlanFull = MealPlan & {
    dish: Dish;
    member: Member;
    portion: MealPortion;
};

export type DaySummary = {
    date: string;
    lunch: MealPlanFull[];
    dinner: MealPlanFull[];
};
