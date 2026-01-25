import { supabase } from "../conection";

export const inviteUser = async (email: string, role: string) => {
    const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role },
    });
    return { data, error };
};