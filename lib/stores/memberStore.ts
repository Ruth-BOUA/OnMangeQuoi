import { create } from "zustand";
import { supabase } from "../supabase";
import type { Member } from "../../types";

type MemberStore = {
    members: Member[];
    loading: boolean;
    fetchMembers: () => Promise<void>;
};

export const useMemberStore = create<MemberStore>()((set) => ({
    members: [],
    loading: false,
    fetchMembers: async () => {
        set({ loading: true });
        const { data, error } = await supabase.from("members").select("*").order("name");
        if (error) console.error(error.message);
        set({ members: data ?? [], loading: false });
    },
}));
