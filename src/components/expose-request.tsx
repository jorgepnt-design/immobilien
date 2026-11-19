"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CheckCircle2, Mail, Send, TriangleAlert } from "lucide-react";
import { contact } from "@/config/site";
import { fill } from "@/lib/i18n/dictionary";
import { useI18n } from "./providers";

interface Props {
  propertyId?: string;
  propertyTitle?: string;
}

type State = "idle" | "sending" | "success" | "mail" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Anfrageformular „Vollständiges Exposé anfordern“ (Stufe 2 der Vermarktung).
 * Vertrauliche Objektangaben werden nie über die Website ausgeliefert, sondern
 * erst nach manueller Prüfung der Anfrage durch den Vermittler übermittelt.
 */
export function ExposeRequest({ propertyId, propertyTitle }: Props) {
  const { t, locale, href } = useI18n();
  const uid = useId();
  const subject = propertyId
    ? fill(t.form.subjectInquiry, { id: propertyId, title: propertyTitle ?? "" })
    : t.form.subjectGeneral;

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
    broker: false,
    website: "", // Honeypot – bleibt bei echten Besuchern leer
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>("idle");
  const [errorText, setErrorText] = useState("");

  const update = (key: keyof typeof values, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = t.form.required;
    if (!values.lastName.trim()) e.lastName = t.form.required;
    if (!values.email.trim()) e.email = t.form.required;
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t.form.invalidEmail;
    if (values.phone.replace(/\D/g, "").length < 6) e.phone = t.form.required;
    if (!values.message.trim()) e.message = t.form.required;
    if (!values.consent) e.consent = t.form.required;
    if (!values.broker) e.broker = t.form.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Ersatzweg ohne Versanddienst: vorbereitete E-Mail im Programm des Besuchers. */
  const mailtoHref = () => {
    const body = [
      propertyId ? `${t.detail.objectId}: ${propertyId}` : "",
      `${t.form.firstName}: ${values.firstName}`,
      `${t.form.lastName}: ${values.lastName}`,
      `${t.form.company}: ${values.company || "–"}`,
      `${t.form.email}: ${values.email}`,
      `${t.form.phone}: ${values.phone}`,
      "",
      values.message,
      "",
      `[x] ${t.form.broker}`,
      `[x] ${t.form.consent}`,
    ]
      .filter((line, i) => i !== 0 || line)
      .join("\n");
    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      setState("error");
      setErrorText(t.form.errorValidation);
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/expose-anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, subject, propertyId: propertyId ?? null, locale }),
      });
      if (res.ok) {
        setState("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (data.error === "not_configured" || data.error === "delivery_failed") {
        // Die Anfrage geht nicht verloren: E-Mail-Programm mit vorbereitetem Text öffnen
        setState("mail");
        window.location.href = mailtoHref();
        return;
      }
      setErrorText(
        data.error === "rate_limited" ? t.form.errorRate : data.error === "validation" ? t.form.errorValidation : t.form.errorGeneric,
      );
      setState("error");
    } catch {
      setState("mail");
      window.location.href = mailtoHref();
    }
  };

  if (state === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-2xl border border-mint bg-mint p-8">
        <CheckCircle2 size={32} strokeWidth={1.4} className="text-accent" />
        <h3 className="heading-display text-3xl text-navy-900">{t.form.successTitle}</h3>
        <p className="text-sm leading-relaxed text-ink/75">{t.form.successText}</p>
      </div>
    );
  }

  if (state === "mail") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-2xl border border-sand bg-white p-8">
        <Mail size={30} strokeWidth={1.4} className="text-champagne-dark" />
        <h3 className="heading-display text-3xl text-navy-900">{t.form.mailTitle}</h3>
        <p className="text-sm leading-relaxed text-ink/75">{t.form.mailText}</p>
        <a href={mailtoHref()} className="btn btn-dark">
          <Mail size={15} />
          {t.form.mailOpen}
        </a>
        <p className="text-xs text-stone-warm">{contact.email}</p>
      </div>
    );
  }

  const field = (
    key: "firstName" | "lastName" | "company" | "email" | "phone",
    label: string,
    opts: { type?: string; autoComplete?: string; required?: boolean } = {},
  ) => {
    const id = `${uid}-${key}`;
    const required = opts.required ?? true;
    return (
      <div>
        <label className="label" htmlFor={id}>
          {label}
          {required ? <span aria-hidden> *</span> : <span className="font-normal normal-case"> ({t.form.optional})</span>}
        </label>
        <input
          id={id}
          name={key}
          type={opts.type ?? "text"}
          autoComplete={opts.autoComplete}
          className="field"
          required={required}
          maxLength={200}
          value={values[key]}
          aria-invalid={errors[key] ? "true" : undefined}
          aria-describedby={errors[key] ? `${id}-fehler` : undefined}
          onChange={(e) => update(key, e.target.value)}
        />
        {errors[key] && (
          <p id={`${id}-fehler`} className="mt-1 text-xs text-red-800">
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  const check = (key: "consent" | "broker", content: React.ReactNode) => (
    <div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
        <input
          type="checkbox"
          name={key}
          className="mt-1 h-4 w-4 shrink-0 accent-navy-900"
          checked={values[key]}
          required
          aria-invalid={errors[key] ? "true" : undefined}
          onChange={(e) => update(key, e.target.checked)}
        />
        <span>
          {content}
          <span aria-hidden> *</span>
        </span>
      </label>
      {errors[key] && <p className="mt-1 text-xs text-red-800">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("firstName", t.form.firstName, { autoComplete: "given-name" })}
        {field("lastName", t.form.lastName, { autoComplete: "family-name" })}
        {field("email", t.form.email, { type: "email", autoComplete: "email" })}
        {field("phone", t.form.phone, { type: "tel", autoComplete: "tel" })}
      </div>
      {field("company", t.form.company, { autoComplete: "organization", required: false })}
      <div>
        <label className="label" htmlFor={`${uid}-message`}>
          {t.form.message}
          <span aria-hidden> *</span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          required
          maxLength={5000}
          placeholder={t.form.messageHint}
          className="field resize-y"
          value={values.message}
          aria-invalid={errors.message ? "true" : undefined}
          onChange={(e) => update("message", e.target.value)}
        />
        {errors.message && <p className="mt-1 text-xs text-red-800">{errors.message}</p>}
      </div>

      {/* Honeypot gegen automatisierte Einsendungen */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      {check("broker", t.form.broker)}
      {check(
        "consent",
        <>
          {t.form.consent}{" "}
          <Link href={href("/datenschutz")} className="underline underline-offset-2 hover:text-champagne-dark">
            {t.form.privacyLink}
          </Link>
        </>,
      )}

      {state === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose bg-rose px-4 py-3 text-sm text-red-900">
          <TriangleAlert size={17} className="mt-0.5 shrink-0" />
          {errorText}
        </p>
      )}

      <button type="submit" className="btn btn-dark" disabled={state === "sending"}>
        <Send size={15} />
        {state === "sending" ? t.form.sending : t.form.submit}
      </button>
    </form>
  );
}
