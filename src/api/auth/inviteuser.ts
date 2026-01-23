import { supabase } from "../conection";

export const inviteUser = async (email: string) => {
    const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role: "editor" },
    });
    return { data, error };
};