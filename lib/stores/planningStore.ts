import { create } from "zustand";
import { supabase } from "../supabase";
import type { MealPlanFull, MealSlot } from "../../types";
import { useDishStore } from "./dishStore";

type AddPlanInput = {
    date: string;
    slot: MealSlot;
    memberId: string;
    dishId: string;
};

type PlanningStore = {
    plans: MealPlanFull[];
    loading: boolean;
    fetchPlans: () => Promise<void>;
    addPlan: (input: AddPlanInput) => Promise<boolean>;
    removePlan: (planId: string, portionId: string) => Promise<void>;
};

export const usePlanningStore = create<PlanningStore>()((set) => ({
    plans: [],
    loading: false,

    fetchPlans: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from("meal_plans")
            .select("*, dish:dishes(*), member:members(*), portion:meal_portions(*)")
            .order("date");
        if (error) console.error(error.message);
        set({ plans: (data as unknown as MealPlanFull[]) ?? [], loading: false });
    },

    addPlan: async ({ date, slot, memberId, dishId }) => {
        const { portions } = useDishStore.getState();

        const bestPortion = portions
            .filter((p) => p.dish_id === dishId && p.remaining > 0)
            .sort((a, b) => new Date(b.cooked_at).getTime() - new Date(a.cooked_at).getTime())[0];

        if (!bestPortion) return false;

        const { data: plan, error } = await supabase
            .from("meal_plans")
            .insert({
                date,
                slot,
                member_id: memberId,
                dish_id: dishId,
                meal_portion_id: bestPortion.id,
            })
            .select("*, dish:dishes(*), member:members(*), portion:meal_portions(*)")
            .single();

        if (error || !plan) {
            console.error(error?.message);
            return false;
        }

        const newRemaining = bestPortion.remaining - 1;
        await supabase
            .from("meal_portions")
            .update({ remaining: newRemaining })
            .eq("id", bestPortion.id);

        useDishStore.setState((state) => ({
            portions: state.portions.map((p) =>
                p.id === bestPortion.id ? { ...p, remaining: newRemaining } : p
            ),
        }));

        set((state) => ({ plans: [...state.plans, plan as unknown as MealPlanFull] }));
        return true;
    },

    removePlan: async (planId, portionId) => {
        await supabase.from("meal_plans").delete().eq("id", planId);

        const { portions } = useDishStore.getState();
        const portion = portions.find((p) => p.id === portionId);
        if (portion) {
            const newRemaining = portion.remaining + 1;
            await supabase
                .from("meal_portions")
                .update({ remaining: newRemaining })
                .eq("id", portionId);
            useDishStore.setState((state) => ({
                portions: state.portions.map((p) =>
                    p.id === portionId ? { ...p, remaining: newRemaining } : p
                ),
            }));
        }

        set((state) => ({ plans: state.plans.filter((p) => p.id !== planId) }));
    },
}));
