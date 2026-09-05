"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@/types";
import { dashboardStyles as styles } from "@/components/dashboard-components";

type Faq = { question: string; answer: string };
export function ProviderSiteEditor({ provider }: { provider: Provider }) {
  const advanced = provider.plan === "pro" || provider.plan === "premium";
  const [faqs, setFaqs] = useState<Faq[]>(
    provider.faqs.map(({ question, answer }) => ({ question, answer })),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [coverPath, setCoverPath] = useState<string | null>(
    provider.site.coverPath ?? null,
  );
  const [avatarPath, setAvatarPath] = useState<string | null>(
    provider.avatarPath ?? null,
  );
  async function upload(file: File, bucket: "provider-work" | "avatars") {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Usa una imagen JPG, PNG o WebP.");
    if (file.size > 8 * 1024 * 1024)
      throw new Error("La imagen debe pesar menos de 8 MB.");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Tu sesión terminó.");
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type });
    if (error) throw new Error("No pudimos subir la imagen.");
    return path;
  }
  async function pick(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "cover" | "avatar",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const path = await upload(
        file,
        kind === "cover" ? "provider-work" : "avatars",
      );
      if (kind === "cover") setCoverPath(path);
      else setAvatarPath(path);
      setMessage("Imagen lista. Guarda los cambios para publicarla.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No pudimos subir la imagen.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const socialLinks = {
      facebook: String(form.get("facebook") ?? ""),
      instagram: String(form.get("instagram") ?? ""),
      tiktok: String(form.get("tiktok") ?? ""),
      website: String(form.get("website") ?? ""),
    };
    const services = provider.services.map((service) => ({
      id: service.id,
      description: String(form.get(`service-${service.id}`) ?? ""),
    }));
    const response = await fetch("/api/dashboard/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: provider.id,
        headline: form.get("headline"),
        intro: form.get("intro"),
        yearsExperience: form.get("yearsExperience")
          ? Number(form.get("yearsExperience"))
          : null,
        coverPath,
        avatarPath,
        theme: advanced
          ? String(form.get("theme") ?? provider.site.theme)
          : "tequit",
        accentColor: advanced
          ? String(form.get("accentColor") ?? provider.site.accentColor)
          : "#254432",
        whiteLabel: advanced && form.get("whiteLabel") === "on",
        socialLinks,
        services,
        faqs,
      }),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? "Sitio actualizado."
        : (body.error ?? "No pudimos guardar."),
    );
    setBusy(false);
  }
  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={`${styles.surface} ${styles.formSection}`}>
        <h2>Identidad del sitio</h2>
        <div className={styles.formGrid}>
          <div className={`${styles.fieldGroup} ${styles.full}`}>
            <label htmlFor="site-headline">Frase comercial</label>
            <input
              className={styles.field}
              id="site-headline"
              name="headline"
              defaultValue={provider.site.headline}
              minLength={8}
              maxLength={120}
              required
            />
          </div>
          <div className={`${styles.fieldGroup} ${styles.full}`}>
            <label htmlFor="site-intro">Presentación</label>
            <textarea
              className={styles.textarea}
              id="site-intro"
              name="intro"
              defaultValue={provider.site.intro}
              minLength={40}
              maxLength={1200}
              required
            />
            <span className={styles.help}>
              Para indexar en Google, completa al menos 120 caracteres.
            </span>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="site-years">Años de experiencia</label>
            <input
              className={styles.field}
              id="site-years"
              name="yearsExperience"
              type="number"
              min={0}
              max={80}
              defaultValue={provider.site.yearsExperience}
            />
          </div>
          <label className={styles.upload}>
            <ImagePlus aria-hidden />
            <strong>Portada</strong>
            <span className={styles.help}>
              {coverPath ? "Imagen cargada" : "JPG, PNG o WebP"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => pick(event, "cover")}
              hidden
            />
          </label>
          <label className={styles.upload}>
            <ImagePlus aria-hidden />
            <strong>Avatar</strong>
            <span className={styles.help}>
              {avatarPath ? "Imagen cargada" : "JPG, PNG o WebP"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => pick(event, "avatar")}
              hidden
            />
          </label>
        </div>
      </section>
      <section className={`${styles.surface} ${styles.formSection}`}>
        <h2>Servicios</h2>
        <p className={styles.help}>
          Una descripción de 40 caracteres o más ayuda a las personas y habilita
          el SEO.
        </p>
        {provider.services.map((service) => (
          <div className={styles.fieldGroup} key={service.id}>
            <label htmlFor={`service-${service.id}`}>{service.name}</label>
            <textarea
              className={styles.textarea}
              id={`service-${service.id}`}
              name={`service-${service.id}`}
              defaultValue={service.description}
              maxLength={500}
            />
          </div>
        ))}
        <Link className={styles.secondary} href="/dashboard/servicios">
          Administrar servicios
        </Link>
      </section>
      <section className={`${styles.surface} ${styles.formSection}`}>
        <h2>Preguntas frecuentes</h2>
        {faqs.map((faq, index) => (
          <div className={styles.formGrid} key={index}>
            <div className={styles.fieldGroup}>
              <label>Pregunta {index + 1}</label>
              <input
                className={styles.field}
                value={faq.question}
                onChange={(event) =>
                  setFaqs((current) =>
                    current.map((item, i) =>
                      i === index
                        ? { ...item, question: event.target.value }
                        : item,
                    ),
                  )
                }
                minLength={8}
                maxLength={160}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Respuesta</label>
              <textarea
                className={styles.textarea}
                value={faq.answer}
                onChange={(event) =>
                  setFaqs((current) =>
                    current.map((item, i) =>
                      i === index
                        ? { ...item, answer: event.target.value }
                        : item,
                    ),
                  )
                }
                minLength={12}
                maxLength={600}
                required
              />
            </div>
            <button
              className={styles.danger}
              type="button"
              onClick={() =>
                setFaqs((current) => current.filter((_, i) => i !== index))
              }
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        ))}
        {faqs.length < 6 && (
          <button
            className={styles.secondary}
            type="button"
            onClick={() =>
              setFaqs((current) => [...current, { question: "", answer: "" }])
            }
          >
            <Plus size={17} />
            Agregar pregunta
          </button>
        )}
      </section>
      <section className={`${styles.surface} ${styles.formSection}`}>
        <h2>Enlaces</h2>
        <div className={styles.formGrid}>
          {(["facebook", "instagram", "tiktok", "website"] as const).map(
            (key) => (
              <div className={styles.fieldGroup} key={key}>
                <label htmlFor={`site-${key}`}>
                  {key[0].toUpperCase() + key.slice(1)}
                </label>
                <input
                  className={styles.field}
                  id={`site-${key}`}
                  name={key}
                  type="url"
                  defaultValue={provider.site.socialLinks[key]}
                  placeholder="https://"
                />
              </div>
            ),
          )}
        </div>
      </section>
      <section className={`${styles.surface} ${styles.formSection}`}>
        <h2>Personalización Pro</h2>
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="site-theme">Tema</label>
            <select
              className={styles.select}
              id="site-theme"
              name="theme"
              defaultValue={provider.site.theme}
              disabled={!advanced}
            >
              <option value="tequit">Tequit</option>
              <option value="claro">Claro</option>
              <option value="oscuro">Oscuro</option>
              <option value="tierra">Tierra</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="site-accent">Color de acento</label>
            <input
              className={styles.field}
              id="site-accent"
              name="accentColor"
              type="color"
              defaultValue={provider.site.accentColor}
              disabled={!advanced}
            />
          </div>
          <label className={styles.fieldGroup}>
            <span>Sitio con marca propia</span>
            <input
              name="whiteLabel"
              type="checkbox"
              defaultChecked={provider.site.whiteLabel}
              disabled={!advanced}
            />
          </label>
        </div>
        {!advanced && (
          <Link className={styles.secondary} href="/dashboard/plan">
            Conocer Tequit Pro
          </Link>
        )}
      </section>
      <footer className={styles.formFooter}>
        <Link
          className={styles.secondary}
          href={`/p/${provider.slug}`}
          target="_blank"
        >
          Vista pública <ExternalLink size={16} />
        </Link>
        <button className={styles.primary} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save size={17} />}
          Guardar sitio
        </button>
      </footer>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
