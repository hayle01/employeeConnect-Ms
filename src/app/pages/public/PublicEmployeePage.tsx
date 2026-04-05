import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Shield, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PublicEmployeePayload } from "@/types/database";
import ministryLogo from "@/assets/moh-logo.webp";

export function PublicEmployeePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-employee", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: row, error: err } = await supabase.rpc(
        "get_public_employee_by_slug",
        {
          p_slug: slug!,
        },
      );
      if (err) throw err;
      return row as PublicEmployeePayload | null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-muted-foreground">
        Verifying…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6f8] px-4 text-center">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-slate-900">
          Verification not found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This verification link is invalid or has been removed.
        </p>
      </div>
    );
  }

  const emailValue = data.email?.trim() ? data.email : "—";
  const mobileValue = data.mobile?.trim() ? data.mobile : "—";

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-0">
      <div className="mx-auto min-h-screen max-w-5xl bg-white shadow-sm">
        <header className="bg-[#2b88c5] text-white">
          <div className="flex flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-10">
            <div className="max-w-sm text-center text-xl font-semibold leading-snug md:text-left">
              Jamhuuriyadda Federaalka Soomaaliya
              <br />
              Wasaaradda Caafimaadka &amp;
              <br />
              Daryeelka Bulshada
            </div>

            <div className="flex flex-col items-center">
              <img
                src={ministryLogo}
                alt="Ministry of Health and Human Services"
                className="h-24 w-24 object-contain md:h-28 md:w-28"
              />
              <div className="mt-3 text-center text-lg font-semibold leading-snug">
                Federal Republic of Somalia
                <br />
                Ministry of Health &amp; Human Services
              </div>
            </div>

            <div
              className="max-w-sm text-center text-xl font-semibold leading-snug md:text-right"
              dir="rtl"
            >
              جمهورية الصومال الفيدرالية
              <br />
              وزارة الصحة والرعاية المجتمع
            </div>
          </div>
        </header>

        <main className="px-4 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[#e8f2f8] bg-slate-50 shadow-sm">
                {data.profile_image_url ? (
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={data.profile_image_url}
                      alt={data.name}
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback className="bg-slate-100">
                      <User className="h-12 w-12 text-[#2b88c5]" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-14 w-14 text-[#2b88c5]" />
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>

              <p className="mt-2 text-base font-semibold text-slate-800">
                {data.title_en}
              </p>

              <p className="mt-1 text-base text-slate-600">{data.title_local}</p>

              <div className="mt-4">
                <Badge
                  variant={
                    data.status === "Active" ? "success" : "destructive"
                  }
                >
                  {data.status}
                </Badge>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<Phone className="h-5 w-5 text-[#2b88c5]" />}
                label="Telephone Number"
                value={mobileValue}
              />
              <InfoCard
                icon={<Mail className="h-5 w-5 text-[#2b88c5]" />}
                label="Email Address"
                value={emailValue}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="break-words text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}