"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { CheckCircle2, Send, TriangleAlert } from "lucide-react";
import { fill } from "@/lib/i18n/dictionary";
import { useI18n } from "./providers";

export const INQUIRY_MODE_EVENT = "anfrage-modus";
export type InquiryMode = "inquiry" | "viewing";

interface Props {
  propertyId?: string;
  propertyTitle?: string;
}

type State = "idle" | "sending" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InquiryForm({ propertyId, propertyTitle }: Props) {
  const { t, locale, href } = useI18n();
  const uid = useId();
  const subjectFor = (mode: InquiryMode) =>
    propertyId
      ? fill(mode === "viewing" ? t.form.subjectViewing : t.form.subjectInquiry, {
          id: propertyId,
          title: propertyTitle ?? "",
        })
      : t.form.subjectGeneral;

  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: subjectFor("inquiry"),
    message: "",
    consent: false,
    website: "", // Honeypot – bleibt bei echten Besuchern leer
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>("idle");
  const [errorText, setErrorText] = useState("");

  // „Besichtigung anfragen“ belegt Betreff und Nachricht vor
  useEffect(() => {
    const onMode = (e: Event) => {
      const mode = (e as CustomEvent<InquiryMode>).detail;
      setValues((v) => ({
        ...v,
        subject: subjectFor(mode),
        message: mode === "viewing" && !v.message ? t.form.messageViewing : v.message,
      }));
    };
    window.addEventListener(INQUIRY_MODE_EVENT, onMode);
    return () => window.removeEventListener(INQUIRY_MODE_EVENT, onMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subjectFor hängt nur von Props und Sprache ab
  }, [propertyId, propertyTitle, locale]);

  const update = (key: keyof typeof values, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = t.form.required;
    if (!values.company.trim()) e.company = t.form.required;
    if (!values.email.trim()) e.email = t.form.required;
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t.form.invalidEmail;
    if (!values.subject.trim()) e.subject = t.form.required;
    if (!values.message.trim()) e.message = t.form.required;
    if (!values.consent) e.consent = t.form.required;
    setErrors(e);
    return Object.keys(e).length === 0;
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
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, propertyId: propertyId ?? null, locale }),
      });
      if (res.ok) {
        setState("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErrorText(
        data.error === "not_configured"
          ? t.form.errorNotConfigured
          : data.error === "rate_limited"
            ? t.form.errorRate
            : data.error === "validation"
              ? t.form.errorValidation
              : t.form.errorGeneric,
      );
      setState("error");
    } catch {
      setErrorText(t.form.errorGeneric);
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-2xl border border-emerald-800/20 bg-emerald-50 p-8">
        <CheckCircle2 size={32} strokeWidth={1.4} className="text-emerald-800" />
        <h3 className="heading-display text-3xl text-navy-900">{t.form.successTitle}</h3>
        <p className="text-sm leading-relaxed text-ink/75">{t.form.successText}</p>
      </div>
    );
  }

  const field = (
    key: "name" | "company" | "email" | "phone" | "subject",
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

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", t.form.name, { autoComplete: "name" })}
        {field("company", t.form.company, { autoComplete: "organization" })}
        {field("email", t.form.email, { type: "email", autoComplete: "email" })}
        {field("phone", t.form.phone, { type: "tel", autoComplete: "tel", required: false })}
      </div>
      {field("subject", t.form.subject)}
      <div>
        <label className="label" htmlFor={`${uid}-message`}>
          {t.form.message}
          <span aria-hidden> *</span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          required
          maxLength={5000}
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

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-navy-900"
            checked={values.consent}
            required
            aria-invalid={errors.consent ? "true" : undefined}
            onChange={(e) => update("consent", e.target.checked)}
          />
          <span>
            {t.form.consent}{" "}
            <Link href={href("/datenschutz")} className="underline underline-offset-2 hover:text-champagne-dark">
              {t.form.privacyLink}
            </Link>
            <span aria-hidden> *</span>
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-red-800">{errors.consent}</p>}
      </div>

      {state === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">
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

/** Schaltfläche, die zum Formular springt und den Anfragemodus setzt. */
export function InquiryButton({
  mode,
  className,
  children,
}: {
  mode: InquiryMode;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#anfrage"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent<InquiryMode>(INQUIRY_MODE_EVENT, { detail: mode }))}
    >
      {children}
    </a>
  );
}
