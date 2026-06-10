import { create } from "zustand";
import { supabase } from "../supabase";
import type { ShoppingList, ShoppingItem } from "../../types";

type ShoppingStore = {
    lists: ShoppingList[];
    items: Record<string, ShoppingItem[]>;
    loading: boolean;
    fetchLists: () => Promise<void>;
    fetchItems: (listId: string) => Promise<void>;
    addList: (name: string) => Promise<ShoppingList | null>;
    deleteList: (id: string) => Promise<void>;
    markListDone: (id: string) => Promise<void>;
    addItem: (listId: string, name: string, quantity?: string) => Promise<void>;
    toggleItem: (item: ShoppingItem) => Promise<void>;
    deleteItem: (itemId: string, listId: string) => Promise<void>;
};

export const useShoppingStore = create<ShoppingStore>()((set) => ({
    lists: [],
    items: {},
    loading: false,

    fetchLists: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from("shopping_lists")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) console.error(error.message);
        set({ lists: data ?? [], loading: false });
    },

    fetchItems: async (listId) => {
        const { data, error } = await supabase
            .from("shopping_items")
            .select("*")
            .eq("list_id", listId)
            .order("created_at");
        if (error) console.error(error.message);
        set((state) => ({
            items: { ...state.items, [listId]: data ?? [] },
        }));
    },

    addList: async (name) => {
        const { data, error } = await supabase
            .from("shopping_lists")
            .insert({ name })
            .select()
            .single();
        if (error || !data) return null;
        set((state) => ({ lists: [data, ...state.lists] }));
        return data;
    },

    deleteList: async (id) => {
        await supabase.from("shopping_lists").delete().eq("id", id);
        set((state) => {
            const newItems = { ...state.items };
            delete newItems[id];
            return { lists: state.lists.filter((l) => l.id !== id), items: newItems };
        });
    },

    markListDone: async (id) => {
        await supabase.from("shopping_lists").update({ is_done: true }).eq("id", id);
        set((state) => ({
            lists: state.lists.map((l) => (l.id === id ? { ...l, is_done: true } : l)),
        }));
    },

    addItem: async (listId, name, quantity) => {
        const { data, error } = await supabase
            .from("shopping_items")
            .insert({ list_id: listId, name: name.trim(), quantity: quantity?.trim() ?? null })
            .select()
            .single();
        if (error || !data) return;
        set((state) => ({
            items: {
                ...state.items,
                [listId]: [...(state.items[listId] ?? []), data],
            },
        }));
    },

    toggleItem: async (item) => {
        const newChecked = !item.is_checked;
        await supabase.from("shopping_items").update({ is_checked: newChecked }).eq("id", item.id);
        set((state) => ({
            items: {
                ...state.items,
                [item.list_id]: (state.items[item.list_id] ?? []).map((i) =>
                    i.id === item.id ? { ...i, is_checked: newChecked } : i
                ),
            },
        }));
    },

    deleteItem: async (itemId, listId) => {
        await supabase.from("shopping_items").delete().eq("id", itemId);
        set((state) => ({
            items: {
                ...state.items,
                [listId]: (state.items[listId] ?? []).filter((i) => i.id !== itemId),
            },
        }));
    },
}));
