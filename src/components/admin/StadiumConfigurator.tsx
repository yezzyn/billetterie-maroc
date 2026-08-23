'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ZoneConfig {
  id: string;
  name: string;
  category: string;
  shape: 'rectangle' | 'arc' | 'custom';
  position: { x: number; y: number; width: number; height: number; rotation?: number };
  color: string;
  rows: number;
  seatsPerRow: number;
  entrance?: string;
  gate?: string;
  block: string;
  price: number;
}

interface StadiumConfiguratorProps {
  venueId: string;
  onSave?: () => void;
}

const newId = () => Math.random().toString(36).slice(2, 11);

const presetTemplates = {
  tanger: {
    name: 'Grand Stade de Tanger',
    shape: 'oval' as const,
    zones: [
      { name: 'Tribune Nord', category: 'CAT2', color: '#3b82f6', block: '201', price: 250 },
      { name: 'Tribune Sud', category: 'CAT3', color: '#ef4444', block: '101', price: 150 },
      { name: 'Tribune Est', category: 'CAT1', color: '#10b981', block: '301', price: 500 },
      { name: 'Tribune Ouest', category: 'CAT1', color: '#10b981', block: '401', price: 500 }
    ]
  },
  marrakech: {
    name: 'Grand Stade de Marrakech',
    shape: 'rectangular' as const,
    zones: [
      { name: 'CAT 1 Ouest', category: 'CAT1', color: '#dc2626', block: '401', price: 500 },
      { name: 'CAT 2 Est', category: 'CAT2', color: '#3b82f6', block: '201', price: 250 },
      { name: 'CAT 3 Nord', category: 'CAT3', color: '#6b7280', block: '301', price: 150 },
      { name: 'CAT 3 Sud', category: 'CAT3', color: '#6b7280', block: '101', price: 150 }
    ]
  },
  wydad: {
    name: 'Stade Mohammed V',
    shape: 'oval' as const,
    zones: [
      { name: 'ZONE 1', category: 'VIP', color: '#6b7280', block: '101', price: 500 },
      { name: 'ZONE 2', category: 'CAT2', color: '#3b82f6', block: '201', price: 250 },
      { name: 'ZONE 3', category: 'CAT2', color: '#6b7280', block: '301', price: 250 },
      { name: 'ZONE 4', category: 'CAT2', color: '#6b7280', block: '401', price: 250 },
      { name: 'ZONE 5', category: 'VIP', color: '#6b7280', block: '501', price: 500 },
      { name: 'ZONE 6', category: 'CAT3', color: '#f97316', block: '601', price: 150 }
    ]
  }
};

// Default positions around the pitch for preset zones
function defaultPosition(index: number, total: number) {
  const slots = [
    { x: 440, y: 90, width: 320, height: 130 }, // north
    { x: 440, y: 680, width: 320, height: 130 }, // south
    { x: 830, y: 330, width: 260, height: 240 }, // east
    { x: 110, y: 330, width: 260, height: 240 } // west
  ];
  return slots[index % 4];
}

export function StadiumConfigurator({ venueId, onSave }: StadiumConfiguratorProps) {
  const [configName, setConfigName] = useState('');
  const [shape, setShape] = useState<'oval' | 'rectangular'>('oval');
  const [fieldWidth, setFieldWidth] = useState(105);
  const [fieldLength, setFieldLength] = useState(68);
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const addZone = () => {
    const newZone: ZoneConfig = {
      id: newId(),
      name: `Zone ${zones.length + 1}`,
      category: 'CAT3',
      shape: 'rectangle',
      position: defaultPosition(zones.length, zones.length + 1),
      color: '#3b82f6',
      rows: 10,
      seatsPerRow: 20,
      block: `${100 + zones.length + 1}`,
      price: 150
    };
    setZones([...zones, newZone]);
  };

  const updateZone = (id: string, updates: Partial<ZoneConfig>) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  const saveConfig = async () => {
    setSaving(true);
    setError('');
    setSavedId(null);
    try {
      const res = await fetch('/api/admin/stadium-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          name: configName,
          shape,
          fieldWidth,
          fieldLength,
          zones
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setSavedId(data.config.id);
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setSaving(false);
    }
  };

  const loadTemplate = (template: keyof typeof presetTemplates) => {
    const tpl = presetTemplates[template];
    setConfigName(tpl.name);
    setShape(tpl.shape);
    setZones(
      tpl.zones.map((z, i) => ({
        id: newId(),
        ...z,
        shape: 'rectangle' as const,
        position: defaultPosition(i, tpl.zones.length),
        rows: 10,
        seatsPerRow: 20
      }))
    );
    setSavedId(null);
  };

  const totalCapacity = zones.reduce((s, z) => s + z.rows * z.seatsPerRow, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Configurateur de Stade</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => loadTemplate('tanger')}>
            Template Tanger
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadTemplate('marrakech')}>
            Template Marrakech
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadTemplate('wydad')}>
            Template Mohammed V
          </Button>
        </div>
      </div>

      {/* Base configuration */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Nom du stade"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Grand Stade de Tanger"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Forme</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as 'oval' | 'rectangular')}
                className="input-premium"
                aria-label="Forme"
              >
                <option value="oval">Ovale</option>
                <option value="rectangular">Rectangulaire</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Longueur terrain (m)"
              type="number"
              value={String(fieldLength)}
              onChange={(e) => setFieldLength(Number(e.target.value))}
            />
            <Input
              label="Largeur terrain (m)"
              type="number"
              value={String(fieldWidth)}
              onChange={(e) => setFieldWidth(Number(e.target.value))}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Capacité
              </label>
              <p className="input-premium bg-gray-50">{totalCapacity.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live SVG preview */}
      <Card>
        <CardContent className="p-6">
          <svg viewBox="0 0 1200 900" className="h-auto w-full rounded-xl bg-gray-50">
            {/* Pitch scaled from meters */}
            <rect
              x={(1200 - fieldLength * 4) / 2}
              y={(900 - fieldWidth * 4) / 2}
              width={fieldLength * 4}
              height={fieldWidth * 4}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="4"
              rx="12"
            />
            <text
              x={600}
              y={450}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              opacity="0.3"
              fontSize="22"
              fontWeight="bold"
              letterSpacing="6"
            >
              TERRAIN
            </text>

            {/* Zones */}
            {zones.map((zone) => (
              <g key={zone.id} onClick={() => setSelectedZone(zone.id)} style={{ cursor: 'pointer' }}>
                {zone.shape === 'rectangle' ? (
                  <rect
                    x={zone.position.x}
                    y={zone.position.y}
                    width={zone.position.width}
                    height={zone.position.height}
                    fill={zone.color}
                    opacity="0.3"
                    stroke={zone.color}
                    strokeWidth={selectedZone === zone.id ? 4 : 2}
                    rx="10"
                  />
                ) : (
                  <ellipse
                    cx={zone.position.x + zone.position.width / 2}
                    cy={zone.position.y + zone.position.height / 2}
                    rx={zone.position.width / 2}
                    ry={zone.position.height / 2}
                    fill={zone.color}
                    opacity="0.3"
                    stroke={zone.color}
                    strokeWidth={selectedZone === zone.id ? 4 : 2}
                  />
                )}
                <text
                  x={zone.position.x + zone.position.width / 2}
                  y={zone.position.y + zone.position.height / 2 - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={zone.color}
                  fontSize="16"
                  fontWeight="bold"
                >
                  {zone.name}
                </text>
                <text
                  x={zone.position.x + zone.position.width / 2}
                  y={zone.position.y + zone.position.height / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6b7280"
                  fontSize="12"
                >
                  {zone.block} · {zone.category} · {zone.price} MAD
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Zones list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Zones ({zones.length})</h3>
          <Button onClick={addZone} size="sm">
            <Plus className="me-2 h-4 w-4" />
            Ajouter une zone
          </Button>
        </div>

        {zones.map((zone) => (
          <Card key={zone.id} className={selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Nom"
                  value={zone.name}
                  onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    value={zone.category}
                    onChange={(e) => updateZone(zone.id, { category: e.target.value })}
                    className="input-premium"
                    aria-label="Catégorie"
                  >
                    <option value="CAT1">CAT 1 (VIP)</option>
                    <option value="CAT2">CAT 2 (Premium)</option>
                    <option value="CAT3">CAT 3 (Standard)</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <Input
                  label="Block"
                  value={zone.block}
                  onChange={(e) => updateZone(zone.id, { block: e.target.value })}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={zone.color}
                    onChange={(e) => updateZone(zone.id, { color: e.target.value })}
                    className="h-12 w-full cursor-pointer rounded-xl border border-gray-200"
                    aria-label="Couleur"
                  />
                </div>
                <Input
                  type="number"
                  label="Prix (MAD)"
                  value={String(zone.price)}
                  onChange={(e) => updateZone(zone.id, { price: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  label="Rangées"
                  value={String(zone.rows)}
                  onChange={(e) => updateZone(zone.id, { rows: Number(e.target.value) })}
                />
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteZone(zone.id)}
                className="mt-4"
              >
                <Trash2 className="me-2 h-4 w-4" />
                Supprimer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {savedId && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Configuration enregistrée ({totalCapacity.toLocaleString()} places).
        </p>
      )}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => { setZones([]); setSavedId(null); }}>
          <RotateCcw className="me-2 h-4 w-4" />
          Réinitialiser
        </Button>
        <Button onClick={saveConfig} loading={saving} disabled={!configName || zones.length === 0}>
          <Save className="me-2 h-4 w-4" />
          Sauvegarder la configuration
        </Button>
      </div>
    </div>
  );
}
