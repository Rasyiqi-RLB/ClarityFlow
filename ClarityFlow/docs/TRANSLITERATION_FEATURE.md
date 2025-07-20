# Fitur Transliterasi ClarityFlow

## Gambaran Umum

ClarityFlow sekarang mendukung fitur transliterasi yang komprehensif untuk mengkonversi teks antar sistem penulisan yang berbeda. Fitur ini mendukung bahasa Indonesia, Inggris, Arab, China, dan dapat diperluas untuk bahasa lainnya.

## Bahasa yang Didukung

### Bahasa Utama
- **Bahasa Indonesia (id)**: Latin script dengan normalisasi ejaan lama
- **Bahasa Inggris (en)**: Latin script standar
- **Bahasa Arab (ar)**: Arabic script ↔ Latin transliteration
- **Bahasa China (zh)**: Chinese characters ↔ Pinyin

### Bahasa Tambahan
- **Bahasa Malaysia (ms)**: Sudah didukung dalam sistem bahasa

## Komponen Utama

### 1. TransliterationService
**Lokasi**: `services/transliterationService.ts`

Service utama yang menangani semua operasi transliterasi:

```typescript
// Penggunaan dasar
const service = TransliterationService.getInstance();
const result = await service.transliterate("مرحبا", {
  sourceLanguage: 'ar',
  direction: 'to-latin'
});
// Output: { transliterated: "marhaba", confidence: 0.8, ... }
```

**Fitur Utama**:
- Deteksi bahasa otomatis
- Transliterasi dua arah (to-latin/from-latin)
- Batch processing
- Custom rules support
- Slug generation

### 2. TransliterationTool Component
**Lokasi**: `components/TransliterationTool.tsx`

Komponen UI lengkap untuk transliterasi dengan fitur:
- Input/output text fields
- Language selection
- Direction control
- Real-time transliteration
- Copy/paste functionality

### 3. TaskTransliterationButton Component
**Lokasi**: `components/TaskTransliterationButton.tsx`

Tombol transliterasi terintegrasi untuk task management:
- Quick transliteration (otomatis)
- Advanced tool modal
- Task title & description support

### 4. TransliterationSettings Component
**Lokasi**: `components/TransliterationSettings.tsx`

Panel pengaturan untuk:
- Enable/disable transliteration
- Language selection
- Feature information

## Integrasi dengan Aplikasi

### 1. Language Context
**Update**: `contexts/LanguageContext.tsx`

Menambahkan dukungan untuk:
- Bahasa Arab dan China
- RTL text support
- Transliteration settings

### 2. Task Management
**Update**: `components/TaskDetailModal.tsx`

Integrasi transliterasi dalam task detail:
- Tombol transliterasi di header
- Auto-update task title/description
- Seamless user experience

### 3. Settings Page
**Update**: `app/settings.tsx`

Link ke halaman transliterasi di menu General settings.

### 4. Dedicated Page
**Baru**: `app/transliteration.tsx`

Halaman khusus transliterasi dengan:
- Tab navigation (Tool/Settings)
- Modal support
- Enable/disable handling

## Cara Penggunaan

### 1. Mengaktifkan Transliterasi
1. Buka **Settings** → **General**
2. Tap **Alat Transliterasi**
3. Aktifkan toggle **Enable Transliteration**
4. Pilih bahasa yang diinginkan

### 2. Menggunakan Tool Transliterasi
1. Dari Settings → Transliteration → **Open Tool**
2. Atau akses langsung `/transliteration`
3. Masukkan teks di input field
4. Pilih bahasa sumber dan target
5. Tap **Transliterate**

### 3. Transliterasi Task
1. Buka task detail modal
2. Tap tombol transliterasi (🔤) di header
3. Pilih quick transliteration atau advanced tool
4. Task akan otomatis terupdate

## Contoh Penggunaan

### Transliterasi Arab ke Latin
```
Input: "مرحبا بك في التطبيق"
Output: "marhaba bik fi al-tatbiq"
```

### Transliterasi China ke Pinyin
```
Input: "欢迎使用应用程序"
Output: "huan ying shi yong ying yong cheng xu"
```

### Normalisasi Indonesia
```
Input: "Soekarno dan Soeharto"
Output: "Sukarno dan Suharto"
```

## Konfigurasi Lanjutan

### Custom Rules
```typescript
const result = await service.transliterate(text, {
  customRules: {
    'oe': 'u',
    'dj': 'j',
    'tj': 'c'
  }
});
```

### Batch Processing
```typescript
const results = await service.transliterateBatch([
  "مرحبا",
  "你好",
  "Hello"
]);
```

### Slug Generation
```typescript
const slug = await service.createSlug("مرحبا بالعالم");
// Output: "marhaba-bil-alam"
```

## Dependencies

### NPM Packages
- `transliteration`: Unicode to ASCII transliteration
- `pinyin`: Chinese to Pinyin conversion
- `arabic-transliterate`: Arabic to Latin transliteration
- `@sindresorhus/transliterate`: Multi-language support
- `@react-native-picker/picker`: Language selection UI

### Installation
```bash
npm install transliteration pinyin arabic-transliterate @sindresorhus/transliterate @react-native-picker/picker
```

## Struktur File

```
ClarityFlow/
├── services/
│   └── transliterationService.ts      # Core service
├── components/
│   ├── TransliterationTool.tsx        # Main UI component
│   ├── TaskTransliterationButton.tsx  # Task integration
│   └── TransliterationSettings.tsx    # Settings panel
├── app/
│   └── transliteration.tsx            # Dedicated page
├── contexts/
│   └── LanguageContext.tsx            # Updated with new languages
└── docs/
    └── TRANSLITERATION_FEATURE.md     # This documentation
```

## Pengembangan Selanjutnya

### Bahasa yang Akan Ditambahkan
- **Jepang**: Hiragana/Katakana ↔ Romaji
- **Korea**: Hangul ↔ Romanization
- **Hindi**: Devanagari ↔ Latin
- **Thai**: Thai script ↔ Latin
- **Rusia**: Cyrillic ↔ Latin

### Fitur Tambahan
- Voice input transliteration
- OCR integration
- Translation + transliteration
- Offline mode support
- History/favorites
- Batch file processing

## Troubleshooting

### Common Issues

1. **Transliteration not working**
   - Pastikan fitur sudah diaktifkan di Settings
   - Check internet connection untuk beberapa bahasa
   - Restart aplikasi jika diperlukan

2. **Language detection incorrect**
   - Gunakan manual language selection
   - Pastikan teks cukup panjang untuk deteksi
   - Check supported language patterns

3. **Performance issues**
   - Gunakan batch processing untuk multiple texts
   - Avoid very long texts (>1000 characters)
   - Consider using slug generation for URLs

### Error Handling
Service ini memiliki fallback mechanisms:
- Auto-fallback ke generic transliteration
- Error logging untuk debugging
- Graceful degradation jika library tidak tersedia

## Kontribusi

Untuk menambahkan bahasa baru:
1. Update `LANGUAGE_PATTERNS` di `transliterationService.ts`
2. Tambahkan method transliterasi spesifik
3. Update language names mapping
4. Tambahkan translasi UI
5. Test dengan berbagai input

## Lisensi

Fitur ini menggunakan open-source libraries dengan lisensi MIT/Apache.
