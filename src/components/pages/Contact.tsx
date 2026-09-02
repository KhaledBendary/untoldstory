"use client";

import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Phone, MapPin, Check } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import type { ContactForm } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { trackLead, trackFormStart, trackContactClick } from '@/lib/analytics';
import { usePageData } from '@/hooks/usePageData';
import { getContactData, type ContactData } from '@/lib/page-data';

const FALLBACK_EMAIL = 'bendary@globaluntoldstory.com';

const DEFAULT_SOCIAL = {
  instagram: 'https://www.instagram.com/globaluntoldstory',
  facebook: 'https://www.facebook.com/theuntoldstory.adv',
  linkedin: 'https://www.linkedin.com/company/the-untold-story-film-production-services/',
  vimeo: 'https://vimeo.com/user252566067',
};

export default function ContactPage({ initialData, initialLocale, formToken }: { initialData: ContactData | null; initialLocale: string; formToken: string }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMailto, setPendingMailto] = useState<string | null>(null);
  const { locale, t } = useLanguage();
  const { data, loading } = usePageData(initialData, initialLocale, getContactData);
  const services = data?.services ?? [];
  const layout = data?.layout ?? null;

  const email = layout?.site_config?.email || FALLBACK_EMAIL;
  const offices = layout?.footer?.offices || [];
  const socialLinks = layout?.site_config?.socialLinks;

  const [startedTracked, setStartedTracked] = useState(false);
  const onFirstInput = () => {
    if (startedTracked) return;
    setStartedTracked(true);
    trackFormStart();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const formData: ContactForm = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string || undefined,
      service: data.get('service') as string,
      message: data.get('message') as string,
      locale: locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...formData,
          website: String(data.get('website') || ''),
          formToken: String(data.get('formToken') || formToken),
        }),
      });
      if (!response.ok) {
        throw new Error(`Contact submit failed: ${response.status}`);
      }
      setSent(true);
      // After the 200, not before: a lead the server refused is not a lead.
      trackLead("form", { service: formData.service || "not specified" });
    } catch (err) {
      // The submission genuinely failed (network error, proxy/API down, or a
      // non-2xx response) — do NOT mark this as sent. Previously this branch
      // set `sent = true` unconditionally, which swapped in the "Your story
      // is on its way" success screen even though the request never reached
      // the backend, hiding the failure from the visitor entirely. Instead,
      // keep the form visible with the error banner and offer a manual
      // mailto fallback the visitor can choose to use.
      console.error('Failed to submit contact form:', err);
      setError(t('Failed to submit form. Please try again, or use the button below to email us directly.'));

      const subject = encodeURIComponent(`New project inquiry — ${formData.service}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nInterested service: ${formData.service}\n\nProject:\n${formData.message}`
      );
      setPendingMailto(`mailto:${email}?subject=${subject}&body=${body}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-transparent border-b border-white/20 focus:border-white outline-none py-4 font-display text-lg placeholder:text-white/55 transition-colors';

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-16 md:pb-20">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {t('Contact')} )</p>
        <SplitWords
          as="h1"
          text={t('Contact a Production Studio in Egypt')}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[12vw] md:text-[7.5vw] max-w-6xl"
        />
        <Reveal className="mt-8">
          <p className="text-white/60 max-w-xl leading-relaxed">
            {t("Send us your objectives, scope and timeline. We'll return with the right production direction and next steps.")}
          </p>
        </Reveal>
      </section>

      <section className="px-5 md:px-10 pb-24 md:pb-36 grid lg:grid-cols-12 gap-14">
        {/* Form */}
        <div className="lg:col-span-7">
          {sent ? (
            <div className="border border-white/15 p-10 md:p-14 text-center">
              <span className="inline-flex w-16 h-16 rounded-full bg-[#fafafa] text-[#0a0a0a] items-center justify-center mb-6">
                <Check className="w-7 h-7" />
              </span>
              <h2 className="font-display font-extrabold uppercase text-3xl mb-4">{t('Your story is on its way')}</h2>
              <p className="text-white/60 leading-relaxed">
                {t("We'll get back to you within one business day. If you need immediate assistance, write to us directly at")}{' '}
                <a href={`mailto:${email}`} onClick={() => trackContactClick("email")} className="link-line text-white">{email}</a>.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} onInput={onFirstInput} className="space-y-10">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <input type="hidden" name="formToken" value={formToken} />
              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm space-y-3">
                  <p>{error}</p>
                  {pendingMailto && (
                    <a
                      href={pendingMailto}
                      className="inline-flex items-center gap-2 underline hover:text-white transition-colors"
                    >
                      Open email to {email} <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-10">
                <div>
                  <label htmlFor="name" className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">{t('Home') === 'الرئيسية' ? 'الاسم الكامل *' : 'Full name *'}</label>
                  <input id="name" name="name" required placeholder={t('Home') === 'الرئيسية' ? 'اسمك' : 'Your name'} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="email" className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">{t('Home') === 'الرئيسية' ? 'البريد الإلكتروني *' : 'Email address *'}</label>
                  <input id="email" name="email" type="email" required placeholder="you@company.com" className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-10">
                <div>
                  <label htmlFor="phone" className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">{t('Home') === 'الرئيسية' ? 'رقم الهاتف' : 'Phone number'}</label>
                  <input id="phone" name="phone" type="tel" placeholder="+20 ..." className={inputCls} />
                </div>
                <div>
                  <label htmlFor="service" className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">{t('Home') === 'الرئيسية' ? 'الخدمة المطلوبة *' : 'Interested service *'}</label>
                  <select id="service" name="service" required defaultValue="" className={`${inputCls} bg-[#0a0a0a] cursor-pointer`} disabled={loading}>
                    <option value="" disabled>{t('Home') === 'الرئيسية' ? 'اختر خدمة' : 'Select a service'}</option>
                    {services.map(s => (
                      <option key={s.slug} value={s.title}>{s.title}</option>
                    ))}
                    <option value="Other">{t('Home') === 'الرئيسية' ? 'غير ذلك / لست متأكداً' : 'Other / Not sure yet'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">{t('Home') === 'الرئيسية' ? 'تفاصيل مشروعك *' : 'Your project *'}</label>
                <textarea id="message" name="message" required rows={4} placeholder={t('Home') === 'الرئيسية' ? 'التفاصيل، الموقع، الجدول الزمني...' : 'Format, locations, timeline, ambition — tell us everything.'} className={`${inputCls} resize-none`} />
              </div>
              <Magnetic>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-10 py-5 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? t('Loading...') : t('Get a Quote')} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                </button>
              </Magnetic>
            </form>
          )}
        </div>

        {/* Info */}
        <aside className="lg:col-span-5 space-y-12">
          <Reveal>
            <div className="border border-white/15 p-8 md:p-10">
              <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">{t('Contact')}</p>
              <a href={`mailto:${email}`} onClick={() => trackContactClick("email")} className="flex items-center gap-3 font-display font-bold text-lg md:text-xl mb-4 hover:opacity-70 transition-opacity break-all">
                <Mail className="w-5 h-5 shrink-0" /> {email}
              </a>
              {offices.filter(o => o.phone).map(o => (
                <a key={o.region} href={`tel:${o.phone}`} className="flex items-center gap-3 text-white/70 mb-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0" /> {o.phone} <span className="font-mono2 text-[10px] text-white/55 uppercase tracking-widest">({o.region})</span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-0 border border-white/15">
              {offices.map(o => (
                <div key={o.region} className="p-8 md:p-10 border-b border-white/15 last:border-b-0">
                  <p className="flex items-center gap-2 font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {o.region}
                  </p>
                  <h3 className="font-display font-extrabold uppercase text-2xl mb-1">{o.region}</h3>
                  <p className="text-white/60 text-sm">{o.address}</p>
                  {o.phone && <a href={`tel:${o.phone}`} className="text-white/80 text-sm link-line inline-block mt-2">{o.phone}</a>}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href={socialLinks?.instagram || DEFAULT_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="font-mono2 text-[11px] tracking-[0.2em] uppercase link-line text-white/60 hover:text-white transition-colors">
                Instagram
              </a>
              <a href={socialLinks?.facebook || DEFAULT_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="font-mono2 text-[11px] tracking-[0.2em] uppercase link-line text-white/60 hover:text-white transition-colors">
                Facebook
              </a>
              <a href={socialLinks?.linkedin || DEFAULT_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono2 text-[11px] tracking-[0.2em] uppercase link-line text-white/60 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href={socialLinks?.vimeo || DEFAULT_SOCIAL.vimeo} target="_blank" rel="noopener noreferrer" className="font-mono2 text-[11px] tracking-[0.2em] uppercase link-line text-white/60 hover:text-white transition-colors">
                Vimeo
              </a>
            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
