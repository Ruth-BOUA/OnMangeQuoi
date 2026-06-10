import { create } from "zustand";
import { supabase } from "../supabase";
import type { Dish, MealPortion } from "../../types";

type DishStore = {
    dishes: Dish[];
    portions: MealPortion[];
    loading: boolean;
    fetchAll: () => Promise<void>;
    addDish: (input: { name: string; notes?: string; photo_uri?: string }) => Promise<Dish | null>;
    deleteDish: (id: string) => Promise<void>;
    addPortion: (dishId: string, totalCount: number) => Promise<MealPortion | null>;
};

export const useDishStore = create<DishStore>()((set, get) => ({
    dishes: [],
    portions: [],
    loading: false,
    fetchAll: async () => {
        set({ loading: true });
        try{
            const [{ data: dishes, error:e1 }, { data: portions, error:e2 }] = await Promise.all([
                supabase.from("dishes").select("*"),
                supabase.from("meal_portions").select("*"),
            ]);
            if (e1 || e2) console.error(`Error while fetching dishes: ${e1 ?? e2}`);
            set({ dishes: dishes ?? [], portions: portions ?? [] });

        } catch(e) {
            console.error(`Error while fetching dishes: ${e}`);
        }
        set({ loading: false });
    },
    addDish: async (input: { name: string; notes?: string; photo_uri?: string }) => {

        const {data: dish, error} = await supabase.from("dishes").insert({
            name: input.name,
            notes: input.notes ?? null,
            photo_uri: input.photo_uri ?? null
        }).select("*").single();
        if(error) console.error(`Error while adding dish: ${error}`);
        if (dish) {
            set((state) => ({ dishes: [dish, ...state.dishes] }));
        }
        return dish ?? null;
    },

    deleteDish: async (id) => {
        const { error } = await supabase.from("dishes").delete().eq("id", id);
        if (error) {
            console.error(`Error while deleting dish: ${error.message}`);
            return;
        }
        set((state) => ({
            dishes: state.dishes.filter((d) => d.id !== id),
            portions: state.portions.filter((p) => p.dish_id !== id),
        }));
    },

    addPortion: async (dishId, totalCount) => {
        const { data: portion, error } = await supabase
            .from("meal_portions")
            .insert({ dish_id: dishId, total_count: totalCount, remaining: totalCount })
            .select("*")
            .single();
        if (error) {
            console.error(`Error while adding portion: ${error.message}`);
            return null;
        }
        if (portion) {
            set((state) => ({ portions: [portion, ...state.portions] }));
        }
        return portion ?? null;
    },
}));

