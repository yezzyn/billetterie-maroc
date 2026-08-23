import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

Font.register({
  family: 'Cairo',
  src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkNv5jQ.ttf'
});
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 0, fontFamily: 'Inter', backgroundColor: '#ffffff', fontSize: 10 },
  header: { backgroundColor: '#7f1d1d', color: 'white', padding: 15, textAlign: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  headerSub: { fontSize: 9, opacity: 0.9 },
  body: { padding: 20, backgroundColor: '#fefefe' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  column: { flex: 1, paddingHorizontal: 5 },
  label: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  value: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  valueSmall: { fontSize: 11, fontWeight: 'semibold', color: '#374151' },
  matchSection: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center'
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
    fontFamily: 'Cairo'
  },
  matchInfo: { fontSize: 9, color: '#78350f' },
  qrSection: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 8
  },
  addressBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  addressTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  addressGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  addressItem: { flex: 1, textAlign: 'center', paddingHorizontal: 5 },
  addressLabel: { fontSize: 7, color: '#4b5563', marginBottom: 2 },
  addressValue: { fontSize: 12, fontWeight: 'bold', color: '#1f2937' },
  categoryBadge: {
    backgroundColor: '#dc2626',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10
  },
  warning: {
    marginTop: 15,
    fontSize: 8,
    color: '#b91c1c',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  },
  priceSection: { textAlign: 'right', marginTop: 10 },
  priceLabel: { fontSize: 9, color: '#6b7280' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#dc2626' }
});

export interface TicketPDFReservation {
  id: string;
  entrance?: string | null;
  gate?: string | null;
  access?: string | null;
  block?: string | null;
  rowLetter?: string | null;
  seatLabel?: string | null;
  price: string;
  totalPrice: string;
  event: {
    eventDate: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
    venue: { nameAr: string; nameFr: string; nameEn: string };
  };
  seat?: {
    section: string;
    rowNumber: number;
    seatNumber: number;
    category?: string;
    entrance?: string | null;
    gate?: string | null;
    access?: string | null;
    block?: string | null;
    rowLetter?: string | null;
  };
  user?: { firstNameAr: string | null; lastNameAr: string | null; cin: string };
}

export const TicketPDF = ({
  reservation,
  qrCodeDataUrl,
  locale
}: {
  reservation: TicketPDFReservation;
  qrCodeDataUrl: string;
  locale: string;
}) => {
  const isAr = locale === 'ar';
  const localeTag = isAr ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US';

  const eventName = reservation.event[isAr ? 'nameAr' : locale === 'fr' ? 'nameFr' : 'nameEn'];
  const venueName =
    reservation.event.venue[isAr ? 'nameAr' : locale === 'fr' ? 'nameFr' : 'nameEn'];

  const date = new Date(reservation.event.eventDate);
  const dateStr = date.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString(localeTag, {
    hour: '2-digit',
    minute: '2-digit'
  });
  const gatesOpen = new Date(date.getTime() - 2 * 3600000).toLocaleTimeString(localeTag, {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Prefer the reservation snapshot, fall back to the seat record
  const entrance = reservation.entrance ?? reservation.seat?.entrance;
  const gate = reservation.gate ?? reservation.seat?.gate;
  const access = reservation.access ?? reservation.seat?.access;
  const block = reservation.block ?? reservation.seat?.block;
  const rowLetter = reservation.rowLetter ?? reservation.seat?.rowLetter;
  const seatNo = reservation.seatLabel ?? String(reservation.seat?.seatNumber ?? '');

  const category =
    reservation.seat?.category ??
    (Number(reservation.price) >= 400
      ? 'CAT 1'
      : Number(reservation.price) >= 200
        ? 'CAT 2'
        : 'CAT 3');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isAr
              ? 'الجامعة الملكية المغربية لكرة القدم'
              : 'FÉDÉRATION ROYALE MAROCAINE DE FOOTBALL'}
          </Text>
          <Text style={styles.headerSub}>
            {isAr ? 'تذكرة دخول' : "Billet d'entrée"} — 2025-2026
          </Text>
        </View>

        <View style={styles.body}>
          {/* Match */}
          <View style={styles.matchSection}>
            <Text style={styles.matchTitle}>{eventName}</Text>
            <Text style={styles.matchInfo}>{venueName}</Text>
          </View>

          {/* Main info */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>{isAr ? 'التاريخ' : 'Date'}</Text>
              <Text style={styles.value}>{dateStr}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>
                {isAr ? 'وقت الانطلاق' : 'Kick-off'}
              </Text>
              <Text style={styles.value}>{timeStr}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>
                {isAr ? 'افتتاح الأبواب' : 'Gates open'}
              </Text>
              <Text style={styles.valueSmall}>{gatesOpen}</Text>
            </View>
          </View>

          {/* Seat location (Moroccan standard addressing) */}
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>
              {isAr ? 'موقع المقعد' : 'SEAT LOCATION'}
            </Text>
            <View style={styles.addressGrid}>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>
                  {isAr ? 'المدخل' : 'ENTRANCE'}
                </Text>
                <Text style={styles.addressValue}>{entrance ?? '—'}</Text>
              </View>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>{isAr ? 'البوابة' : 'GATE'}</Text>
                <Text style={styles.addressValue}>{gate ?? '—'}</Text>
              </View>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>{isAr ? 'الولوج' : 'ACCESS'}</Text>
                <Text style={styles.addressValue}>{access ?? '—'}</Text>
              </View>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>{isAr ? 'المربع' : 'BLOCK'}</Text>
                <Text style={styles.addressValue}>{block ?? '—'}</Text>
              </View>
            </View>
            <View style={[styles.addressGrid, { marginBottom: 0 }]}>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>{isAr ? 'الصف' : 'ROW'}</Text>
                <Text style={styles.addressValue}>{rowLetter ?? '—'}</Text>
              </View>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>{isAr ? 'المقعد' : 'SEAT'}</Text>
                <Text style={styles.addressValue}>{seatNo || '—'}</Text>
              </View>
            </View>
          </View>

          {/* Category */}
          <View style={styles.categoryBadge}>
            <Text>{category}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>{isAr ? 'الثمن' : 'PRIX / PRICE'}</Text>
            <Text style={styles.priceValue}>
              {Number(reservation.totalPrice).toLocaleString()} MAD
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            {qrCodeDataUrl ? (
              <Image src={qrCodeDataUrl} style={{ width: 150, height: 150 }} />
            ) : null}
            <Text style={{ fontSize: 9, marginTop: 8, fontFamily: 'monospace' }}>
              ID: {reservation.id.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.warning}>
            {isAr
              ? 'يجب تقديم البطاقة الوطنية مطابقة للاسم في هذه التذكرة. هذه التذكرة شخصية ولا يمكن إعادة استخدامها.'
              : "La présentation de la CIN originale est obligatoire à l'entrée. Ce billet est strictement personnel et à usage unique."}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            N°-{reservation.id.slice(0, 7).toUpperCase()} • Généré par Billetterie
            Maroc • www.billetterie.ma
          </Text>
          <Text>© 2026 — {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</Text>
        </View>
      </Page>
    </Document>
  );
};
