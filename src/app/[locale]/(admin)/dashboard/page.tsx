'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Stats {
  revenue: string | number;
  ticketsSold: number;
  ticketsUsed: number;
  events: { id: string; name: string; status: string; sold: number }[];
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t('denied'));
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'error');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state instead of a full page reload
        setStats((prev) =>
          prev
            ? {
                ...prev,
                events: prev.events.map((e) =>
                  e.id === eventId ? { ...e, status: data.event.status } : e
                )
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Event status update error:', err);
    }
  };

  if (error || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="card-premium max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('denied')}</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  const chartData = stats.events.map((e) => ({
    name: e.name.length > 20 ? e.name.substring(0, 20) + '...' : e.name,
    ventes: e.sold
  }));

  const kpis = [
    {
      title: t('revenue'),
      value: `${Number(stats.revenue).toLocaleString()} MAD`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: t('sold'),
      value: stats.ticketsSold,
      icon: Ticket,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: t('validated'),
      value: stats.ticketsUsed,
      icon: CheckCircle2,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-8 text-3xl font-bold text-gray-900">{t('title')}</h1>

          {/* KPIs */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {kpis.map((kpi, idx) => (
              <Card key={idx} className="card-premium p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${kpi.bg}`}
                  >
                    <kpi.icon className={`h-7 w-7 ${kpi.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="card-premium p-6">
            <CardHeader>
              <CardTitle className="text-xl">{t('salesByEvent')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="ventes" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick event management */}
          <Card className="card-premium mt-8 p-6">
            <CardHeader>
              <CardTitle className="text-xl">{t('quickManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{event.name}</p>
                      <p className="text-sm text-gray-500">
                        {event.sold} {t('soldTickets')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          event.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'CLOSED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {event.status}
                      </span>
                      <button
                        onClick={() => toggleEventStatus(event.id, event.status)}
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        {event.status === 'OPEN' ? t('close') : t('open')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
