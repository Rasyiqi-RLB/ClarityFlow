# ClarityFlow - AI-Powered Task Management App

ClarityFlow adalah aplikasi manajemen tugas dan produktivitas berbasis AI yang dirancang untuk membantu individu dan tim dalam memprioritaskan tugas-tugas mereka secara efektif menggunakan prinsip-prinsip Eisenhower Matrix.

## 🎯 Fitur Utama

### 1. Eisenhower Matrix dengan AI
- **Analisis Tugas Cerdas**: AI menganalisis deskripsi tugas untuk menyarankan kuadran yang tepat
- **Pembelajaran Adaptif**: AI belajar dari kebiasaan prioritisasi pengguna
- **Saran Delegasi**: Rekomendasi untuk tugas yang dapat didelegasikan
- **Identifikasi Ketergantungan**: Deteksi ketergantungan antar tugas

### 2. Manajemen Tugas
- **Input Sederhana**: Tambah tugas dengan satu kolom input teks
- **Prioritisasi Otomatis**: AI secara otomatis mengkategorikan tugas
- **Penjadwalan Cerdas**: Saran slot waktu optimal untuk tugas penting
- **Pelacakan Waktu**: Estimasi dan pelacakan waktu aktual

### 3. Analytics & Insights
- **Statistik Produktivitas**: Analisis mendalam tentang pola kerja
- **AI Insights**: Saran personalisasi untuk meningkatkan produktivitas
- **Visualisasi Data**: Grafik dan diagram interaktif
- **Laporan Kustom**: Ekspor data ke Excel untuk analisis lanjutan

### 4. Integrasi & Backup
- **Penyimpanan Lokal**: Semua data disimpan di perangkat pengguna
- **Backup Google Drive**: Backup otomatis ke Google Drive
- **Ekspor Excel**: Ekspor data untuk analisis eksternal
- **Sinkronisasi Kalender**: Integrasi dengan kalender populer

## 🚀 Teknologi

- **Framework**: Expo (React Native)
- **Database**: AsyncStorage untuk penyimpanan lokal
- **AI/ML**: Gemini API dan Open Router API
- **UI**: React Native dengan komponen kustom
- **Platform**: Android, iOS, dan Web

## 📱 Instalasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn
- Expo CLI

### Setup
```bash
# Clone repository
git clone <repository-url>
cd ClarityFlow

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Environment Variables
Buat file `.env` di root project:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

## 🏗️ Struktur Project

```
ClarityFlow/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Main Matrix view
│   │   └── explore.tsx    # Analytics view
│   └── _layout.tsx        # Root layout
├── components/            # React components
│   ├── EisenhowerMatrix.tsx
│   ├── TaskCard.tsx
│   ├── AddTaskModal.tsx
│   └── AddTaskButton.tsx
├── services/             # Business logic
│   ├── storage.ts        # Local storage service
│   └── aiService.ts      # AI analysis service
├── types/                # TypeScript definitions
│   └── index.ts
├── utils/                # Utilities and constants
│   └── constants.ts
└── assets/              # Images and fonts
```

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #8B5CF6 (Purple)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Yellow)
- **Error**: #EF4444 (Red)

### Quadrant Colors
- **Do First** (Urgent & Important): #FF6B6B (Red)
- **Schedule** (Not Urgent & Important): #4ECDC4 (Teal)
- **Delegate** (Urgent & Not Important): #45B7D1 (Blue)
- **Delete** (Not Urgent & Not Important): #96CEB4 (Green)

## 🤖 AI Features

### Task Analysis
AI menganalisis input tugas berdasarkan:
- **Keywords**: Kata kunci urgensi dan kepentingan
- **Konteks**: Waktu, proyek, dan ketergantungan
- **Pola**: Kebiasaan pengguna sebelumnya

### Smart Suggestions
- **Prioritisasi Otomatis**: Kategorisasi tugas berdasarkan konten
- **Estimasi Waktu**: Perkiraan waktu penyelesaian
- **Tag Extraction**: Otomatis mengekstrak tag dari deskripsi
- **Due Date Detection**: Deteksi tanggal jatuh tempo dari teks

## 📊 Analytics

### Metrics Tracked
- **Completion Rate**: Persentase tugas yang diselesaikan
- **Quadrant Distribution**: Distribusi tugas per kuadran
- **Time Analysis**: Estimasi vs waktu aktual
- **Productivity Trends**: Pola produktivitas over time

### AI Insights
- **Efficiency Analysis**: Analisis efisiensi kerja
- **Time Management**: Saran pengelolaan waktu
- **Priority Optimization**: Optimasi prioritas tugas
- **Habit Recognition**: Pengenalan pola kebiasaan

## 🔧 Development

### Adding New Features
1. Buat komponen di `components/`
2. Tambah types di `types/index.ts`
3. Implementasi business logic di `services/`
4. Update constants di `utils/constants.ts`

### Testing
```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Eisenhower Matrix UI
- ✅ Basic AI analysis
- ✅ Local storage
- ✅ Task management

### Phase 2 (Next)
- 🔄 Calendar integration
- 🔄 Google Drive backup
- 🔄 Notifications
- 🔄 Advanced AI features

### Phase 3 (Future)
- 📋 Team collaboration
- 📋 Advanced analytics
- 📋 Mobile widgets
- 📋 Voice input

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Eisenhower Matrix**: Metodologi prioritisasi tugas
- **Expo**: Framework React Native
- **Gemini API**: AI capabilities
- **Open Router API**: Alternative AI provider

## 📞 Support

Untuk dukungan dan pertanyaan:
- Email: support@clarityflow.app
- Documentation: [docs.clarityflow.app](https://docs.clarityflow.app)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**ClarityFlow** - Bring clarity to your workflow with AI-powered task management.
