export const DEMO_PASSWORD = "JuriReverseTutor2026!";

export const DEMO_USERS = [
  {
    email: "juri1@demo.reversetutor.id",
    displayName: "Naya Putri",
    profileInsights: [
      {
        title: "Kamu kuat mengingat definisi",
        description:
          "Di beberapa topik, kamu bisa menyebutkan konsep inti dengan tepat sebelum masuk ke penjelasan yang lebih panjang.",
        type: "kekuatan",
      },
      {
        title: "Contoh konkret masih sering tertinggal",
        description:
          "Penjelasanmu sudah punya arah, tetapi biasanya berhenti sebelum menghubungkan konsep dengan situasi sehari-hari.",
        type: "kelemahan",
      },
      {
        title: "Hubungan sebab-akibat mulai konsisten",
        description:
          "Kamu semakin sering menjelaskan bukan hanya apa yang terjadi, tetapi juga kenapa perubahan itu bisa terjadi.",
        type: "kekuatan",
      },
      {
        title: "Istilah teknis kadang belum kamu uraikan",
        description:
          "Saat memakai istilah baru, coba tambahkan arti singkat dengan kata-katamu sendiri agar penjelasanmu lebih utuh.",
        type: "kelemahan",
      },
    ],
    topics: [
      {
        title: "Hukum Newton dan Gaya",
        createdDaysAgo: 16,
        lastAccessedDaysAgo: 0,
        material: `Hukum Newton menjelaskan hubungan antara gaya, massa, dan gerak benda. Hukum pertama Newton menyatakan bahwa sebuah benda akan tetap diam atau bergerak lurus dengan kecepatan konstan jika resultan gaya yang bekerja padanya sama dengan nol. Sifat benda yang cenderung mempertahankan keadaan geraknya ini disebut kelembaman atau inersia.
Hukum kedua Newton menyatakan bahwa percepatan sebuah benda berbanding lurus dengan resultan gaya yang bekerja padanya dan berbanding terbalik dengan massa benda. Hubungan ini dirumuskan sebagai resultan gaya sama dengan massa dikali percepatan. Semakin besar gaya, semakin besar percepatan; semakin besar massa, semakin kecil percepatan untuk gaya yang sama.
Hukum ketiga Newton menyatakan bahwa setiap gaya aksi menimbulkan gaya reaksi yang besarnya sama tetapi arahnya berlawanan. Gaya aksi dan gaya reaksi bekerja pada dua benda yang berbeda, sehingga keduanya tidak saling menghilangkan.
Dalam kehidupan sehari-hari, gaya gesek bekerja berlawanan dengan arah gerak benda dan dipengaruhi oleh kekasaran permukaan serta gaya normal. Gaya berat adalah gaya gravitasi yang bekerja pada massa benda dan besarnya bergantung pada percepatan gravitasi setempat. Contoh penerapan hukum Newton antara lain mendorong meja, pengereman mobil, dan dorongan roket saat lepas landas.`,
        sessions: [
          { mode: "qa", daysAgo: 16 },
          { mode: "ringkasan", daysAgo: 12 },
          { mode: "kuis", daysAgo: 12, resultSummary: { correct: 3, total: 5 } },
          { mode: "reverse_bot", daysAgo: 8 },
          { mode: "reverse_bot", daysAgo: 1 },
        ],
        map: [
          {
            subTopic: "Hukum pertama Newton",
            score: 82,
            note: "Sudah bisa menjelaskan inersia dengan contoh sehari-hari.",
            updatedDaysAgo: 1,
          },
          {
            subTopic: "Hukum kedua Newton",
            score: 74,
            note: "Rumus dan hubungan gaya-massa-percepatan sudah tepat.",
            updatedDaysAgo: 1,
          },
          {
            subTopic: "Hukum ketiga Newton",
            score: 58,
            note: "Masih tertukar saat menjelaskan mengapa aksi-reaksi tidak saling menghilangkan.",
            updatedDaysAgo: 1,
          },
          {
            subTopic: "Gaya gesek dan gaya berat",
            score: 46,
            note: "Perlu latihan membedakan arah gaya gesek dan pengaruh gaya normal.",
            updatedDaysAgo: 1,
          },
        ],
        history: {
          "Hukum pertama Newton": [
            { score: 45, daysAgo: 8 },
            { score: 66, daysAgo: 4 },
            { score: 82, daysAgo: 1 },
          ],
          "Hukum kedua Newton": [
            { score: 52, daysAgo: 8 },
            { score: 74, daysAgo: 1 },
          ],
          "Hukum ketiga Newton": [
            { score: 40, daysAgo: 8 },
            { score: 58, daysAgo: 1 },
          ],
          "Gaya gesek dan gaya berat": [
            { score: 38, daysAgo: 8 },
            { score: 46, daysAgo: 1 },
          ],
        },
      },
      {
        title: "Sistem Pernapasan Manusia",
        createdDaysAgo: 11,
        lastAccessedDaysAgo: 0,
        material: `Sistem pernapasan manusia bertugas memasukkan oksigen ke dalam tubuh dan mengeluarkan karbon dioksida. Udara masuk melalui hidung, lalu melewati faring, laring, trakea, dan bronkus. Bronkus bercabang menjadi bronkiolus yang berakhir pada kantung-kantung kecil bernama alveolus.
Di alveolus terjadi pertukaran gas. Dinding alveolus sangat tipis dan dikelilingi banyak kapiler darah, sehingga oksigen dapat berdifusi dari udara ke darah dan karbon dioksida bergerak sebaliknya untuk dikeluarkan saat ekspirasi.
Mekanisme inspirasi dan ekspirasi melibatkan diafragma dan otot antar tulang rusuk. Saat inspirasi, diafragma berkontraksi dan mendatar sehingga volume rongga dada membesar dan tekanan udara di dalam paru-paru menurun. Udara dari luar kemudian masuk. Saat ekspirasi, diafragma relaksasi dan melengkung ke atas sehingga volume rongga dada mengecil dan udara terdorong keluar.
Gangguan pada sistem pernapasan antara lain asma, bronkitis, pneumonia, dan tuberkulosis. Asma menyebabkan penyempitan saluran napas, sedangkan pneumonia disebabkan infeksi yang membuat alveolus terisi cairan sehingga pertukaran gas terganggu.`,
        sessions: [
          { mode: "qa", daysAgo: 10 },
          { mode: "ringkasan", daysAgo: 7 },
          { mode: "reverse_bot", daysAgo: 3 },
          { mode: "reverse_bot", daysAgo: 0 },
        ],
        map: [
          {
            subTopic: "Jalur udara pernapasan",
            score: 88,
            note: "Runtut menyebutkan jalur dari hidung sampai alveolus.",
            updatedDaysAgo: 0,
          },
          {
            subTopic: "Mekanisme inspirasi dan ekspirasi",
            score: 64,
            note: "Hubungan diafragma, volume, dan tekanan sudah mulai benar.",
            updatedDaysAgo: 0,
          },
          {
            subTopic: "Pertukaran gas di alveolus",
            score: 42,
            note: "Belum bisa menjelaskan arah difusi oksigen dan karbon dioksida.",
            updatedDaysAgo: 0,
          },
          {
            subTopic: "Gangguan sistem pernapasan",
            score: 71,
            note: "Contoh asma dan pneumonia dijelaskan dengan tepat.",
            updatedDaysAgo: 0,
          },
        ],
        history: {
          "Jalur udara pernapasan": [
            { score: 60, daysAgo: 7 },
            { score: 75, daysAgo: 3 },
            { score: 88, daysAgo: 0 },
          ],
          "Mekanisme inspirasi dan ekspirasi": [
            { score: 35, daysAgo: 7 },
            { score: 48, daysAgo: 3 },
            { score: 64, daysAgo: 0 },
          ],
          "Pertukaran gas di alveolus": [
            { score: 52, daysAgo: 3 },
            { score: 42, daysAgo: 0 },
          ],
          "Gangguan sistem pernapasan": [
            { score: 55, daysAgo: 3 },
            { score: 71, daysAgo: 0 },
          ],
        },
      },
      {
        title: "Pergerakan Nasional Indonesia",
        createdDaysAgo: 15,
        lastAccessedDaysAgo: 4,
        material: `Pergerakan nasional Indonesia tumbuh pada awal abad ke-20 sebagai bentuk perlawanan terhadap penjajahan yang tidak lagi bersifat kedaerahan. Organisasi modern pertama adalah Budi Utomo yang berdiri pada 20 Mei 1908 dan bergerak di bidang pendidikan. Setelah itu muncul Sarekat Islam yang berawal dari pedagang batik dan berkembang menjadi organisasi massa, serta Indische Partij yang menuntut kesetaraan hak bagi seluruh golongan.
Peran pers sangat penting dalam menyebarkan gagasan kebangsaan. Surat kabar seperti De Express dan Medan Prijaji menjadi alat komunikasi yang membangun kesadaran bersama, meskipun banyak yang kemudian diberedel pemerintah kolonial.
Puncak kesadaran pemuda terjadi pada Kongres Pemuda II, 28 Oktober 1928, yang menghasilkan Sumpah Pemuda: satu tanah air, satu bangsa, dan satu bahasa, yaitu Indonesia. Peristiwa ini menjadi fondasi persatuan yang melampaui batas daerah dan organisasi.
Setelah masa pendudukan Jepang, kesempatan politik terbuka lebih luas. Para pemimpin memanfaatkan organisasi bentukan Jepang untuk menyiapkan kemerdekaan. Pada 17 Agustus 1945, Indonesia memproklamasikan kemerdekaannya.`,
        sessions: [
          { mode: "qa", daysAgo: 14 },
          { mode: "ringkasan", daysAgo: 9 },
          { mode: "reverse_bot", daysAgo: 5 },
        ],
        map: [
          {
            subTopic: "Organisasi pergerakan awal",
            score: 78,
            note: "Bisa menyebutkan Budi Utomo, Sarekat Islam, dan Indische Partij beserta tujuannya.",
            updatedDaysAgo: 5,
          },
          {
            subTopic: "Peran pers dan kesadaran nasional",
            score: 66,
            note: "Perlu contoh konkret surat kabar dan isu yang diperjuangkan.",
            updatedDaysAgo: 5,
          },
          {
            subTopic: "Sumpah Pemuda 1928",
            score: 72,
            note: "Isi Sumpah Pemuda sudah hafal, konteks Kongres Pemuda II belum lengkap.",
            updatedDaysAgo: 5,
          },
        ],
        history: {
          "Organisasi pergerakan awal": [
            { score: 58, daysAgo: 5 },
            { score: 78, daysAgo: 5 },
          ],
          "Peran pers dan kesadaran nasional": [
            { score: 44, daysAgo: 5 },
            { score: 66, daysAgo: 5 },
          ],
          "Sumpah Pemuda 1928": [
            { score: 55, daysAgo: 5 },
            { score: 72, daysAgo: 5 },
          ],
        },
      },
      {
        title: "Turunan Fungsi Aljabar",
        createdDaysAgo: 6,
        lastAccessedDaysAgo: 6,
        material: `Turunan fungsi aljabar mengukur perubahan sesaat dari nilai fungsi terhadap perubahan variabelnya. Secara konseptual, turunan didefinisikan sebagai limit dari kemiringan garis secan ketika jarak antara dua titik mendekati nol.
Ada beberapa aturan dasar yang sering dipakai. Aturan pangkat menyatakan bahwa turunan dari x pangkat n adalah n dikali x pangkat n minus satu. Turunan jumlah atau selisih fungsi sama dengan jumlah atau selisih turunan masing-masing fungsi. Untuk perkalian dua fungsi digunakan aturan hasil kali, sedangkan untuk pembagian digunakan aturan hasil bagi.
Jika fungsi tersusun dari fungsi lain, kita memakai aturan rantai. Misalnya turunan dari fungsi dalam bentuk pangkat dari fungsi lain dihitung dengan menurunkan bagian luar lalu dikalikan turunan bagian dalam.
Aplikasi turunan antara lain menentukan gradien garis singgung, mencari nilai maksimum dan minimum suatu fungsi, serta menganalisis laju perubahan pada masalah nyata seperti kecepatan dan biaya marginal.`,
        sessions: [
          { mode: "qa", daysAgo: 6 },
          { mode: "kuis", daysAgo: 6, resultSummary: { correct: 4, total: 5 } },
        ],
        map: [],
        history: {},
      },
    ],
  },
  {
    email: "juri2@demo.reversetutor.id",
    displayName: "Bima Saputra",
    profileInsights: null,
    topics: [
      {
        title: "Hukum Newton dan Gaya",
        createdDaysAgo: 7,
        lastAccessedDaysAgo: 1,
        material: `Hukum Newton menjadi dasar mekanika klasik. Hukum pertama menjelaskan kelembaman: benda tetap diam atau bergerak lurus beraturan jika tidak ada resultan gaya. Hukum kedua menghubungkan gaya, massa, dan percepatan melalui rumus resultan gaya sama dengan massa dikali percepatan. Hukum ketiga menegaskan bahwa gaya aksi dan reaksi selalu berpasangan, sama besar, berlawanan arah, dan bekerja pada dua benda berbeda.
Contoh soal yang sering muncul adalah menentukan percepatan balok yang ditarik dengan gaya tertentu di atas permukaan kasar. Langkahnya: gambarkan gaya-gaya yang bekerja, uraikan pada sumbu horizontal dan vertikal, lalu gunakan hukum kedua Newton. Gaya gesek kinetis dihitung dari koefisien gesek dikali gaya normal. Jika gaya tarik lebih besar dari gaya gesek, balok mengalami percepatan searah gaya tarik.`,
        sessions: [
          { mode: "qa", daysAgo: 5 },
          { mode: "reverse_bot", daysAgo: 2 },
        ],
        map: [
          {
            subTopic: "Hukum kedua Newton",
            score: 55,
            note: "Rumus sudah dipakai, tetapi satuan gaya dan massa sering tertukar.",
            updatedDaysAgo: 2,
          },
          {
            subTopic: "Hukum ketiga Newton",
            score: 48,
            note: "Perlu contoh pasangan aksi-reaksi yang bekerja pada dua benda berbeda.",
            updatedDaysAgo: 2,
          },
        ],
        history: {
          "Hukum kedua Newton": [
            { score: 40, daysAgo: 2 },
            { score: 55, daysAgo: 2 },
          ],
          "Hukum ketiga Newton": [
            { score: 35, daysAgo: 2 },
            { score: 48, daysAgo: 2 },
          ],
        },
      },
      {
        title: "Ekosistem dan Rantai Makanan",
        createdDaysAgo: 4,
        lastAccessedDaysAgo: 0,
        material: `Ekosistem adalah kesatuan antara makhluk hidup dan lingkungannya yang saling berinteraksi. Di dalam ekosistem terjadi aliran energi dan daur materi. Energi masuk melalui produsen, yaitu tumbuhan hijau yang berfotosintesis mengubah energi cahaya menjadi energi kimia.
Energi kemudian berpindah ke konsumen primer (herbivora), konsumen sekunder (karnivora kecil), dan seterusnya. Pengurai seperti bakteri dan jamur menguraikan sisa makhluk hidup menjadi zat hara yang dapat dipakai produsen kembali. Karena energi hilang di setiap tingkat, piramida energi makin sempit ke atas.
Rantai makanan menggambarkan perpindahan energi secara linear, sedangkan jaring-jaring makanan menunjukkan hubungan yang lebih kompleks. Keseimbangan ekosistem dapat terganggu jika salah satu populasi hilang, misalnya ketika predator puncak diburu secara berlebihan sehingga populasi herbivora meledak dan vegetasi berkurang.`,
        sessions: [
          { mode: "qa", daysAgo: 3 },
          { mode: "reverse_bot", daysAgo: 1 },
        ],
        map: [
          {
            subTopic: "Produsen dan konsumen",
            score: 80,
            note: "Bisa menjelaskan peran produsen dan tingkatan konsumen dengan runtut.",
            updatedDaysAgo: 1,
          },
          {
            subTopic: "Aliran energi dan piramida",
            score: 62,
            note: "Sudah paham energi berkurang tiap tingkat, belum bisa menjelaskan alasannya.",
            updatedDaysAgo: 1,
          },
          {
            subTopic: "Pengurai dan keseimbangan ekosistem",
            score: 50,
            note: "Perlu contoh kasus ketidakseimbangan ekosistem.",
            updatedDaysAgo: 1,
          },
        ],
        history: {
          "Produsen dan konsumen": [{ score: 80, daysAgo: 1 }],
          "Aliran energi dan piramida": [{ score: 62, daysAgo: 1 }],
          "Pengurai dan keseimbangan ekosistem": [{ score: 50, daysAgo: 1 }],
        },
      },
    ],
  },
];
