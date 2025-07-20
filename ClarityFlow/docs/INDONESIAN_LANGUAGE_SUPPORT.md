# Dukungan Bahasa Indonesia untuk AI Service

## Fitur Baru
AI Service sekarang mendukung deteksi bahasa otomatis dan memberikan respons dalam bahasa yang sama dengan input pengguna.

## Update Terbaru (v2.0)
- ✅ **Perbaikan Reasoning Bahasa Indonesia**: AI sekarang memberikan reasoning dalam bahasa Indonesia untuk input bahasa Indonesia
- ✅ **Prompt yang Diperkuat**: Menambahkan instruksi tegas untuk menggunakan bahasa Indonesia
- ✅ **Parameter Input Tracking**: Fungsi `parseAIResponse` sekarang melacak bahasa input asli
- ✅ **Prefix Provider Bilingual**: Menggunakan "[Provider AI]" untuk bahasa Indonesia dan "[Provider]" untuk bahasa Inggris

## Cara Kerja

### 1. Deteksi Bahasa Otomatis
- **Fungsi**: `detectLanguage(input: string)`
- **Metode**: Menghitung skor berdasarkan kata kunci bahasa Indonesia
- **Threshold**: Minimal 2 kata kunci Indonesia untuk dianggap sebagai input bahasa Indonesia

### 2. Kata Kunci Indonesia yang Dideteksi
```typescript
// Kata dasar
'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'dalam', 'yang', 'ini', 'itu'

// Kata ganti
'saya', 'aku', 'kamu', 'dia', 'mereka', 'kita', 'kami'

// Kata kerja
'buat', 'bikin', 'lakukan', 'kerjakan', 'selesaikan', 'tugas', 'pekerjaan'

// Waktu
'hari', 'minggu', 'bulan', 'tahun', 'jam', 'menit'

// Prioritas
'penting', 'urgent', 'mendesak', 'segera', 'cepat'

// Aktivitas
'rapat', 'meeting', 'presentasi', 'laporan', 'proyek'

// Waktu spesifik
'besok', 'nanti', 'sekarang', 'hari ini', 'kemarin'

// Kata modal (skor +2)
'harus', 'perlu', 'mau', 'ingin', 'akan', 'sudah'
```

### 3. Prompt Bahasa Indonesia (v2.0)
Ketika input terdeteksi sebagai bahasa Indonesia, AI akan menerima prompt yang diperkuat:

```
Analisis tugas ini dan kategorikan menggunakan Matriks Eisenhower. 
Respons HANYA dengan objek JSON yang valid dalam format yang tepat ini:

{
  "quadrant": "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important",
  "confidence": 0.8,
  "reasoning": "Penjelasan singkat mengapa tugas ini termasuk dalam kuadran ini",
  "suggestedDueDate": "2024-01-15" | null,
  "estimatedTime": 60,
  "tags": ["kerja", "rapat"],
  "priority": "high" | "medium" | "low"
}

PENTING: 
- Berikan reasoning dalam bahasa Indonesia
- Gunakan terminologi Indonesia untuk menjelaskan analisis
- Jangan gunakan bahasa Inggris dalam reasoning

Pertimbangkan:
- Urgent (Mendesak) = perlu perhatian segera, sensitif waktu, didorong deadline
- Important (Penting) = berkontribusi pada tujuan jangka panjang, memiliki dampak signifikan
- Gunakan kata kunci, petunjuk konteks, dan waktu untuk menentukan urgensi dan kepentingan
- Estimasi waktu dalam menit
- Sarankan tanggal jatuh tempo yang realistis jika ada indikator waktu
- Ekstrak tag yang relevan dari konten
- Tetapkan prioritas berdasarkan kuadran dan urgensi

Respons HANYA dengan objek JSON, tanpa teks tambahan. WAJIB berikan reasoning dalam bahasa Indonesia.
```

## Dukungan Ekstraksi Data

### 1. Ekstraksi Tanggal (extractDueDate)
**Bahasa Indonesia:**
- `hari ini`, `sekarang` → hari ini
- `besok` → besok
- `minggu depan`, `pekan depan` → minggu depan
- `bulan depan` → bulan depan

**Bahasa Inggris:**
- `today` → hari ini
- `tomorrow` → besok
- `next week` → minggu depan

### 2. Estimasi Waktu (estimateTaskTime)
**Bahasa Indonesia:**
- `cepat`, `sederhana`, `mudah`, `singkat` → 15 menit
- `rapat`, `meeting`, `telepon`, `call` → 30 menit
- `review`, `baca`, `tinjau`, `periksa` → 45 menit
- `proyek`, `kompleks`, `detail`, `rumit` → 120 menit

**Bahasa Inggris:**
- `quick`, `simple`, `easy` → 15 menit
- `meeting`, `call` → 30 menit
- `review`, `read` → 45 menit
- `project`, `complex`, `detailed` → 120 menit

### 3. Ekstraksi Tag (extractTags)
**Bahasa Indonesia:**
- `kerja`, `pekerjaan`, `kantor`, `tugas` → tag: "kerja"
- `pribadi`, `rumah`, `keluarga`, `personal` → tag: "pribadi"
- `kesehatan`, `olahraga`, `gym`, `sehat` → tag: "kesehatan"
- `keuangan`, `uang`, `budget`, `anggaran` → tag: "keuangan"
- `belajar`, `study`, `pendidikan`, `kursus` → tag: "belajar"
- `rapat`, `meeting`, `presentasi` → tag: "rapat"

**Bahasa Inggris:**
- `work`, `job`, `office` → tag: "work"
- `personal`, `home`, `family` → tag: "personal"
- `health`, `exercise`, `gym` → tag: "health"
- `finance`, `money`, `budget` → tag: "finance"

## Contoh Penggunaan

### Input Bahasa Indonesia:
```
"Saya harus menyelesaikan laporan proyek besok untuk rapat dengan klien"
```

### Output yang Diharapkan (v2.0):
```json
{
  "quadrant": "urgent-important",
  "confidence": 0.9,
  "reasoning": "Tugas ini mendesak karena ada deadline besok dan penting karena melibatkan klien. Laporan proyek berkontribusi pada tujuan bisnis jangka panjang.",
  "suggestedDueDate": "2024-01-16",
  "estimatedTime": 120,
  "tags": ["kerja", "rapat", "proyek"],
  "priority": "high"
}
```

### Input Bahasa Inggris:
```
"Need to finish project report tomorrow for client meeting"
```

### Output yang Diharapkan:
```json
{
  "quadrant": "urgent-important",
  "confidence": 0.9,
  "reasoning": "This task is urgent due to tomorrow's deadline and important as it involves client relationship. Project reports contribute to long-term business goals.",
  "suggestedDueDate": "2024-01-16",
  "estimatedTime": 120,
  "tags": ["work", "meeting", "project"],
  "priority": "high"
}
```

## Perbaikan Teknis (v2.0)

### 1. Fungsi `parseAIResponse` yang Diperbaiki
```typescript
private static parseAIResponse(response: string, provider: string, originalInput?: string): AIAnalysisResult {
  // Deteksi bahasa untuk menentukan prefix provider
  const language = originalInput ? this.detectLanguage(originalInput) : 'en';
  const providerPrefix = language === 'id' ? `[${provider} AI]` : `[${provider}]`;
  
  return {
    // ... other fields
    reasoning: `${providerPrefix} ${parsed.reasoning}`,
    // ... other fields
  };
}
```

### 2. Pemanggilan yang Diperbaiki
```typescript
// analyzeWithGemini
return this.parseAIResponse(aiResponse, 'Gemini AI', input);

// analyzeWithOpenRouter  
const result = this.parseAIResponse(aiResponse, 'OpenRouter AI', input);
```

## Keuntungan
1. **User Experience Lebih Baik**: Pengguna Indonesia mendapat respons dalam bahasa mereka
2. **Akurasi Lebih Tinggi**: AI memahami konteks budaya dan bahasa Indonesia
3. **Konsistensi**: Format JSON tetap sama, hanya konten reasoning yang berbeda bahasa
4. **Fleksibilitas**: Mendukung kedua bahasa secara otomatis
5. **Reasoning Asli**: Tidak ada lagi reasoning bahasa Inggris untuk input bahasa Indonesia

## Masalah yang Diperbaiki
- ❌ **Sebelumnya**: Input bahasa Indonesia → Reasoning bahasa Inggris
- ✅ **Sekarang**: Input bahasa Indonesia → Reasoning bahasa Indonesia
- ✅ **Prompt Diperkuat**: Instruksi tegas untuk menggunakan bahasa Indonesia
- ✅ **Parameter Tracking**: Melacak bahasa input asli untuk konsistensi

## File yang Dimodifikasi
- `services/aiService.ts` - Menambahkan deteksi bahasa, prompt bilingual, dan perbaikan parsing