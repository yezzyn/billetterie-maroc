'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Ticket,
  Shield,
  Smartphone,
  Zap,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const href = (path: string) => `/${locale}${path}`;

  const features = [
    { icon: Ticket, title: t('f1Title'), description: t('f1Desc'), color: 'from-blue-500 to-cyan-500', delay: 0 },
    { icon: Shield, title: t('f2Title'), description: t('f2Desc'), color: 'from-cyan-500 to-teal-500', delay: 0.1 },
    { icon: Zap, title: t('f3Title'), description: t('f3Desc'), color: 'from-purple-500 to-pink-500', delay: 0.2 },
    { icon: Smartphone, title: t('f4Title'), description: t('f4Desc'), color: 'from-orange-500 to-red-500', delay: 0.3 }
  ];

  const stats = [
    { value: '500+', label: t('statsEvents'), icon: Calendar },
    { value: '250K+', label: t('statsTickets'), icon: Ticket },
    { value: '98%', label: t('statsSatisfaction'), icon: Star },
    { value: '24/7', label: t('statsSupport'), icon: Users }
  ];

  const advantages = [t('adv1'), t('adv2'), t('adv3'), t('adv4')];

  return (
    <div className="min-h-screen">
      {/* Hero Section Premium */}
      <section className="gradient-hero relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-6 py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-3 backdrop-blur-sm"
              >
                <TrendingUp className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">{t('badge')}</span>
              </motion.div>

              <h1 className="mb-6 text-5xl leading-tight font-bold text-white lg:text-7xl">
                {t('title')}{' '}
                <span className="text-cyan-300">{t('titleAccent')}</span>
              </h1>

              <p className="mb-10 text-xl leading-relaxed text-white/90">
                {t('subtitle')}
              </p>

              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <Link href={href('/events')} className="btn-secondary text-lg">
                  <Calendar className="h-6 w-6" />
                  {t('ctaEvents')}
                </Link>
                <Link href={href('/register')} className="btn-primary text-lg">
                  {t('ctaRegister')}
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {advantages.map((adv, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-cyan-300" />
                    <span className="font-medium text-white/90">{adv}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="gradient-primary shadow-blue-500/30 aspect-square animate-float rounded-3xl p-8 shadow-2xl">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Ticket className="mx-auto mb-4 h-32 w-32 opacity-80" />
                      <p className="text-2xl font-bold">{t('virtualStadium')}</p>
                      <p className="text-white/70">{t('selectSeats')}</p>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="card-glass animate-float-delayed absolute -top-8 -right-8 p-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="gradient-secondary flex h-14 w-14 items-center justify-center rounded-2xl">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t('secured')}</p>
                      <p className="text-sm text-gray-500">{t('encryptedPayment')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="card-glass animate-float absolute -bottom-8 -left-8 p-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t('fastBooking')}</p>
                      <p className="text-sm text-gray-500">{t('under2min')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 text-center"
              >
                <stat.icon className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <div className="text-gradient mb-2 text-4xl font-bold lg:text-5xl">
                  {stat.value}
                </div>
                <div className="font-semibold text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 py-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
              {t('featuresTitle')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              {t('featuresSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -10 }}
                className="card-premium group p-8"
              >
                <div
                  className={`shadow-blue-500/20 mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.color} shadow-xl transition-shadow group-hover:shadow-2xl`}
                >
                  <feature.icon className="h-9 w-9 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-premium gradient-primary relative overflow-hidden rounded-[2.5rem] p-16 text-center text-white lg:p-24"
          >
            <div className="absolute top-0 left-0 h-full w-full opacity-10">
              <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white blur-3xl" />
              <div className="absolute right-10 bottom-10 h-60 w-60 rounded-full bg-cyan-300 blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold lg:text-6xl">{t('ctaTitle')}</h2>
              <p className="mx-auto mb-12 max-w-3xl text-2xl text-white/90">
                {t('ctaSubtitle')}
              </p>
              <Link
                href={href('/register')}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-12 py-6 text-xl font-bold text-blue-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
              >
                {t('ctaButton')}
                <ArrowRight className="h-7 w-7" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
