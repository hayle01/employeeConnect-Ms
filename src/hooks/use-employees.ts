import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Employee } from "@/types/database";

export function useEmployeesQuery() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployeeQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["employee", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Employee;
    },
  });
}

export function useEmployeeHistoryQuery(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["employee-history", employeeId],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_history")
        .select("*")
        .eq("employee_id", employeeId!)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProfilesQuery() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
