import { Mail, MapPin } from "lucide-react";
import { contact } from "@/config/site";

/** E-Mail-Link an den Betreiber mit vorbelegtem Betreff (z. B. inklusive Objekt-ID). */
export function mailto(subject?: string): string {
  return `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

export function MailButton({
  subject,
  className,
  children,
}: {
  subject?: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a href={mailto(subject)} className={className}>
      {children}
    </a>
  );
}

/** Kontaktdaten des Betreibers als Adressblock. */
export function ContactDetails({ subject }: { subject?: string }) {
  return (
    <address className="text-sm not-italic leading-relaxed text-ink/80">
      <p className="heading-display text-2xl text-navy-900">{contact.company}</p>
      <p className="mt-1 text-stone-warm">{contact.descriptor}</p>
      <p className="mt-5 flex items-start gap-3">
        <MapPin size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-champagne-dark" />
        <span>
          {contact.street}
          <br />
          {contact.city}
        </span>
      </p>
      <p className="mt-3 flex items-center gap-3">
        <Mail size={18} strokeWidth={1.5} className="shrink-0 text-champagne-dark" />
        <a href={mailto(subject)} className="font-medium text-navy-900 underline-offset-4 hover:underline">
          {contact.email}
        </a>
      </p>
    </address>
  );
}
