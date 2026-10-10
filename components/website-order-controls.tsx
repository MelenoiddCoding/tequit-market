"use client";
import { WEBSITE_OFFER } from "@/lib/website-offer";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardStyles as styles } from "@/components/dashboard-components";
import {useAdminUpdate} from "@/components/admin-update-toast";
export function WebsiteOrderControls({
  providerId,
  orderId,
  status,
  renewal = false,
}: {
  providerId?: string;
  orderId?: string;
  status?: string;
  renewal?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const showUpdate = useAdminUpdate();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const action = String(fields.get("action"));
    if (action === "pay" && !fields.get("confirmed")) {
      showUpdate({mode:"warning",title:"Verifica el pago",message:"Confirma que recibimos el ingreso antes de marcar el pedido como pagado."});
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "create"
            ? {
                action,
                providerId,
                amount: Number(fields.get("amount")),
                months: Number(fields.get("months")),
              }
            : {
                action,
                orderId,
                reference: String(fields.get("reference") ?? ""),
              },
        ),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      const outcomes:Record<string,{title:string;message:string}>={create:{title:"Pedido creado",message:"Ya puedes registrar el pago cuando lo recibas."},pay:{title:"Pago registrado",message:"El pedido está listo para publicar la página."},publish:{title:"Página publicada",message:"La vigencia del sitio ya está activa."},cancel:{title:"Pedido cancelado",message:"El pedido dejó de estar pendiente."}};
      showUpdate({mode:"success",...(outcomes[action]??{title:"Cambios guardados",message:"La información está actualizada."})});
      router.refresh();
    } catch (error) {
      showUpdate({mode:"error",title:"No se guardó el pedido",message:error instanceof Error ? error.message : "Inténtalo de nuevo."});
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.stack}>
      {!orderId ? (
        <form className={styles.form} onSubmit={submit}>
          <input type="hidden" name="action" value="create" />
          <label className={styles.fieldGroup}>
            Importe acordado (MXN)
            <input
              className={styles.field}
              name="amount"
              type="number"
              min="0"
              max="100000"
              defaultValue={renewal ? WEBSITE_OFFER.renewalPrice : WEBSITE_OFFER.initialPrice}
              required
            />
          </label>
          <label className={styles.fieldGroup}>
            Meses de publicación
            <input
              className={styles.field}
              name="months"
              type="number"
              min="1"
              max="24"
              defaultValue={WEBSITE_OFFER.months}
              required
            />
          </label>
          <p>
            {renewal ? "Renovación beta: $499 por 12 meses." : "Sitio beta: $699 por 12 meses."} El periodo inicia al publicar. Registra aquí las condiciones
            acordadas con esta persona.
          </p>
          <button disabled={busy} className={styles.primary}>
            {renewal ? "Crear pedido de renovación" : "Crear pedido de sitio"}
          </button>
        </form>
      ) : status === "pending" ? (
        <>
          <form className={styles.form} onSubmit={submit}>
            <input type="hidden" name="action" value="pay" />
            <label className={styles.fieldGroup}>
              Referencia del pago recibido
              <input
                className={styles.field}
                name="reference"
                minLength={3}
                maxLength={160}
                required
              />
            </label>
            <label className={styles.fieldGroup}>
              <input type="checkbox" name="confirmed" required /> Verifiqué que
              recibimos el pago
            </label>
            <button disabled={busy} className={styles.primary}>
              Confirmar pago recibido
            </button>
          </form>
          <form onSubmit={submit}>
            <input type="hidden" name="action" value="cancel" />
            <button disabled={busy} className={styles.ghost}>
              Cancelar pedido sin pago
            </button>
          </form>
        </>
      ) : status === "paid" ? (
        <form onSubmit={submit}>
          <input type="hidden" name="action" value="publish" />
          <p>
            Revisa el contenido y el consentimiento antes de activar la
            vigencia.
          </p>
          <button disabled={busy} className={styles.primary}>
            Publicar sitio / aplicar renovación
          </button>
        </form>
      ) : null}
    </div>
  );
}
