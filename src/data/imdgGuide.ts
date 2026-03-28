/**
 * IMDG Code — Dangerous Goods Reference Guide
 *
 * Comprehensive data for all 9 IMO hazard classes.
 * All content in Turkish with standard English technical terms preserved.
 */

export interface ImdgSubclass {
  code: string;
  name: string;
  description: string;
}

export interface ImdgClass {
  classNumber: string;
  name: string;
  symbol: string;
  color: string;
  severity: "critical" | "high" | "medium";
  definition: string;
  subclasses: ImdgSubclass[];
  stowage: string[];
  fireResponse: string[];
  spillResponse: string[];
  ppe: string[];
  incompatible: string[];
  placardInfo: string;
  holdPreparation: string[];
}

export const imdgClasses: ImdgClass[] = [
  // ── Class 1: Explosives ─────────────────────────────────────────────────
  {
    classNumber: "1",
    name: "Patlayıcılar",
    symbol: "\u{1F4A5}",
    color: "#ef4444",
    severity: "critical",
    definition:
      "Kimyasal reaksiyon sonucu gaz, ısı ve basınç üreterek patlama yapabilen katı veya sıvı maddeler ya da bu maddelerin karışımları. Ateşleme tertibatları ve piroteknik maddeler de bu sınıfa dahildir.",
    subclasses: [
      {
        code: "1.1",
        name: "Kütlesel patlama tehlikesi",
        description: "Tüm yükün anlık olarak patlaması riski taşıyan maddeler (TNT, dinamit).",
      },
      {
        code: "1.2",
        name: "Saçılma tehlikesi",
        description: "Kütlesel patlama riski olmayan ancak parça saçılma tehlikesi bulunan maddeler.",
      },
      {
        code: "1.3",
        name: "Yangın ve küçük patlama tehlikesi",
        description: "Yangın riski taşıyan, sınırlı patlama veya saçılma etkisi olan maddeler (roket motorları).",
      },
      {
        code: "1.4",
        name: "Düşük tehlike",
        description: "Ateşleme durumunda yalnızca ambalaj içinde sınırlı etki gösteren maddeler (küçük mühimmat).",
      },
      {
        code: "1.5",
        name: "Kütlesel patlama tehlikeli — düşük hassasiyet",
        description: "Kütlesel patlama tehlikesi olan ancak taşıma sırasında başlatılma olasılığı çok düşük maddeler.",
      },
      {
        code: "1.6",
        name: "Çok düşük hassasiyet",
        description: "Kütlesel patlama tehlikesi olmayan, son derece düşük hassasiyetli maddeler.",
      },
    ],
    stowage: [
      "Isı kaynaklarından ve doğrudan güneş ışığından uzak tutulmalıdır.",
      "Ateşleyiciler (detonators) ana patlayıcı maddelerden fiziksel olarak ayrı depolanmalıdır.",
      "Güverte üstü veya güverte altı istifleme, alt sınıfa göre IMDG Kod'a uygun yapılmalıdır.",
      "Diğer tehlikeli yüklerden en az 12 metre ayrılma mesafesi sağlanmalıdır.",
      "Elektrik tesisatı kıvılcım çıkarmayan (ex-proof) tipte olmalıdır.",
      "Ambar kapakları sızdırmaz ve güvenli kilitlenebilir olmalıdır.",
    ],
    fireResponse: [
      "Su spreyi (water spray) ile soğutma yapılmalıdır.",
      "Köpük (foam) KULLANILMAMALIDIR — patlayıcı maddelerde etkisizdir.",
      "Mümkünse bölgeyi tahliye edin, uzaktan müdahale edin.",
      "Alt sınıf 1.1 ve 1.5 için yangına müdahale yerine tahliye önceliklidir.",
      "Bitişik ambarlar ve yapılar su spreyi ile soğutulmalıdır.",
    ],
    spillResponse: [
      "Dökülen malzemeye dokunmayın — darbeye hassas olabilir.",
      "Elektrikli ekipman kullanmayın, statik elektrik oluşumunu önleyin.",
      "Döküntü alanını derhal izole edin ve yetkililere bildirin.",
      "Patlayıcı maddeyi toplamak için yalnızca antistatik, kıvılcım çıkarmayan aletler kullanın.",
    ],
    ppe: [
      "Tam koruyucu elbise (full protective suit)",
      "Antistatik iş ayakkabısı",
      "Yüz siperi ve koruyucu gözlük",
      "Yangın müdahalesinde ısıya dayanıklı eldiven",
      "Gerektiğinde bağımsız solunum cihazı (SCBA)",
    ],
    incompatible: [
      "Tüm yanıcı maddeler (Class 3, 4)",
      "Oksitleyiciler (Class 5)",
      "Korozif maddeler (Class 8)",
      "Radyoaktif maddeler (Class 7)",
      "Ateşleyici düzenekler (farklı alt sınıf patlayıcılar ile karışık yüklenmez)",
    ],
    placardInfo:
      "Turuncu renkli placard üzerinde patlama sembolü. Alt sınıfa göre uyumluluk grubu harfi (A-S) belirtilir. UN numarası ve alt sınıf numarası etiket üzerinde yer almalıdır.",
    holdPreparation: [
      "Ambar tamamen temizlenmeli, kuru ve toz/kir kalıntısından arındırılmalıdır.",
      "Tüm elektrik tesisatı kontrol edilmeli, ex-proof olmalıdır.",
      "Sintine pompaları ve drenaj sistemleri test edilmelidir.",
      "Ambar içi sıcaklık izleme sistemi kurulmalıdır.",
      "Dunnage malzemesi yanmaz veya alev geciktirici olmalıdır.",
    ],
  },

  // ── Class 2: Gases ──────────────────────────────────────────────────────
  {
    classNumber: "2",
    name: "Gazlar",
    symbol: "\u{1F4A8}",
    color: "#ef4444",
    severity: "critical",
    definition:
      "50°C'de buhar basıncı 300 kPa'dan fazla olan veya 20°C'de ve standart atmosfer basıncında tamamen gaz halinde bulunan maddeler. Basınçlı, sıvılaştırılmış, soğutularak sıvılaştırılmış veya çözünmüş halde taşınırlar.",
    subclasses: [
      {
        code: "2.1",
        name: "Yanıcı gazlar",
        description: "Hava ile karışımı %13 veya altında yanabilen gazlar (propan, bütan, hidrojen, LPG).",
      },
      {
        code: "2.2",
        name: "Yanıcı olmayan, zehirli olmayan gazlar",
        description: "Boğucu veya oksitleyici gazlar (azot, argon, karbondioksit, oksijen).",
      },
      {
        code: "2.3",
        name: "Zehirli gazlar",
        description: "Solunduğunda sağlığa ciddi zarar veren veya ölüme yol açabilen gazlar (klor, amonyak, fosgen).",
      },
    ],
    stowage: [
      "Havalandırmalı alanlarda depolanmalıdır — kapalı alanlarda gaz birikimi önlenmeli.",
      "Isı kaynaklarından ve doğrudan güneş ışığından uzak tutulmalıdır.",
      "Tüpler ve tanklar devrilmeye karşı sabitlenmelidir.",
      "Yanıcı gazlar (2.1) güverte üstü istifleme gerektirebilir.",
      "Zehirli gazlar (2.3) diğer tüm yüklerden ayrı tutulmalıdır.",
      "Tüp vanaları koruyucu kapaklar ile korunmalıdır.",
    ],
    fireResponse: [
      "Yanmakta olan gaz kaynağı kapatılamazsa su spreyi ile soğutma yapılmalıdır.",
      "Tüp/tank üzerine kesinlikle su sıkılmamalıdır — basınç artışı ile BLEVE riski oluşabilir.",
      "Mümkünse gaz vanasını kapatarak kaynağı kesin.",
      "Çevredeki tüp/tankları su spreyi ile soğutun.",
      "Zehirli gaz sızıntısında rüzgar üstü yönde konumlanın.",
    ],
    spillResponse: [
      "Sızıntı bölgesini derhal tahliye edin.",
      "Tüm ateşleme kaynaklarını ortadan kaldırın (yanıcı gazlar için).",
      "Sızıntı noktasından rüzgar üstü yönde durun.",
      "Zehirli gaz sızıntısında bağımsız solunum cihazı (SCBA) olmadan müdahale etmeyin.",
      "Gaz dedektörleri ile ortam sürekli izlenmelidir.",
    ],
    ppe: [
      "Tam yüz maskesi veya SCBA (zehirli gazlar için zorunlu)",
      "Kimyasal koruyucu elbise (zehirli/korozif gazlar için)",
      "Antistatik iş kıyafeti ve ayakkabı (yanıcı gazlar için)",
      "Koruyucu eldiven (soğutulmuş gazlar için kriyojenik eldiven)",
    ],
    incompatible: [
      "Patlayıcılar (Class 1)",
      "Yanıcı sıvılar (Class 3) — yanıcı gazlarla bir arada bulunmamalı",
      "Oksitleyiciler (Class 5) — yanıcı gazlarla bir arada bulunmamalı",
      "Korozif maddeler (Class 8)",
    ],
    placardInfo:
      "Alt sınıf 2.1: Kırmızı zemin üzerinde alev sembolü. Alt sınıf 2.2: Yeşil zemin üzerinde gaz tüpü. Alt sınıf 2.3: Beyaz zemin üzerinde kurukafa ve çapraz kemik sembolü.",
    holdPreparation: [
      "Ambar havalandırma sistemi kontrol edilmeli ve tam kapasitede çalıştığı doğrulanmalıdır.",
      "Gaz dedektörleri kurulmalı ve kalibre edilmelidir.",
      "Ambar içi tüm elektrik tesisatı ex-proof olmalıdır.",
      "Sintine sistemleri test edilmeli ve sızdırmazlık kontrol edilmelidir.",
      "Acil tahliye prosedürleri mürettebata bildirilmelidir.",
    ],
  },

  // ── Class 3: Flammable Liquids ──────────────────────────────────────────
  {
    classNumber: "3",
    name: "Yanıcı Sıvılar",
    symbol: "\u{1F525}",
    color: "#ef4444",
    severity: "high",
    definition:
      "Parlama noktası (flash point) 60°C veya altında olan sıvılar veya yüksek sıcaklıkta sıvı halde taşınan ve yanıcı buhar üreten maddeler. Deniz taşımacılığında en sık karşılaşılan tehlikeli yük sınıfıdır.",
    subclasses: [
      {
        code: "PG I",
        name: "Yüksek tehlike",
        description: "Parlama noktası <23°C ve kaynama noktası ≤35°C (dietil eter, karbon disülfür).",
      },
      {
        code: "PG II",
        name: "Orta tehlike",
        description: "Parlama noktası <23°C ve kaynama noktası >35°C (benzin, aseton, toluen).",
      },
      {
        code: "PG III",
        name: "Düşük tehlike",
        description: "Parlama noktası ≥23°C ve ≤60°C (dizel yakıt, gazyağı, boya tineri).",
      },
    ],
    stowage: [
      "Serin ve iyi havalandırılmış alanlarda depolanmalıdır.",
      "Tüm ateşleme kaynaklarından uzak tutulmalıdır.",
      "Güverte üstü istifleme tercih edilir — güverte altı durumunda mekanik havalandırma zorunludur.",
      "Doğrudan güneş ışığından korunmalıdır.",
      "Elektrik tesisatı ex-proof olmalıdır.",
      "Taşma önleme (overflow prevention) tedbirleri alınmalıdır.",
      "Tank gereksinimleri: paslanmaz çelik veya uygun iç kaplama (epoksi/fenolik).",
    ],
    fireResponse: [
      "Alkole dayanıklı köpük (AFFF) veya kuru kimyevi toz ile söndürme.",
      "Yanan sıvıya kesinlikle SU SIKILMAMALIdır — sıçrama ve yayılma riski.",
      "Bitişik yapıları ve tankları su spreyi ile soğutun.",
      "Geri çekilemiyorsanız yanı başındaki kapları soğutmaya devam edin.",
      "Buhar yoğunluğu havadan ağırdır — alçak alanlarda birikim tehlikesi.",
    ],
    spillResponse: [
      "Tüm ateşleme kaynaklarını ortadan kaldırın.",
      "Döküntüyü kum, toprak veya uygun absorban malzeme ile çevreleyerek sınırlayın.",
      "Sıvının denize, kanalizasyona veya kapalı alanlara ulaşmasını engelleyin.",
      "Buhar oluşumunu azaltmak için köpük örtüsü uygulayın.",
      "Antistatik ekipman kullanın — statik boşalma ile tutuşma riski vardır.",
    ],
    ppe: [
      "Kimyasal dayanımlı koruyucu elbise",
      "Antistatik iş ayakkabısı ve eldiven",
      "Buhar maskesi veya SCBA (kapalı alanlarda)",
      "Koruyucu gözlük veya yüz siperi",
      "Yangın müdahalesinde ısıya dayanıklı tam koruyucu donanım",
    ],
    incompatible: [
      "Oksitleyiciler (Class 5) — şiddetli reaksiyon riski",
      "Patlayıcılar (Class 1)",
      "Korozif maddeler (Class 8) — bazı asitler reaksiyona girebilir",
      "Radyoaktif maddeler (Class 7)",
      "Yanıcı katılar (Class 4) — özellikle su-reaktif maddeler",
    ],
    placardInfo:
      "Kırmızı zemin üzerinde alev sembolü. UN numarası ve ambalaj grubu (PG I/II/III) belirtilir. Parlama noktası etiket üzerinde yer almalıdır.",
    holdPreparation: [
      "Ambar tamamen temizlenmeli ve kurutulmalıdır.",
      "Havalandırma sistemi tam kapasitede çalışır durumda olmalıdır.",
      "Tüm elektrik tesisatı ex-proof kontrol edilmelidir.",
      "Sintine sistemleri test edilmeli, sızdırmazlık doğrulanmalıdır.",
      "Yangın söndürme ekipmanı (köpük, kuru toz) hazır ve erişilebilir olmalıdır.",
      "Tank kaplaması yükle uyumlu olmalıdır (paslanmaz çelik veya epoksi kaplama önerilir).",
      "Statik topraklama (grounding) bağlantıları kontrol edilmelidir.",
    ],
  },

  // ── Class 4: Flammable Solids ───────────────────────────────────────────
  {
    classNumber: "4",
    name: "Yanıcı Katılar",
    symbol: "\u{1F9F1}",
    color: "#f59e0b",
    severity: "high",
    definition:
      "Sürtünme ile kolayca tutuşabilen katı maddeler, kendiliğinden yanmaya eğilimli maddeler ve su ile temas ettiğinde yanıcı gaz üreten maddeler.",
    subclasses: [
      {
        code: "4.1",
        name: "Yanıcı katılar",
        description: "Sürtünme veya kısa süreli ateşle tutuşabilen katılar, kendinden reaksiyona giren maddeler (kükürt, naftalin, kibrit).",
      },
      {
        code: "4.2",
        name: "Kendiliğinden yanmaya yatkın maddeler",
        description: "Hava ile temas ettiğinde 5 dakika içinde tutuşabilen maddeler (beyaz fosfor, aktif karbon, yağlı kumaşlar).",
      },
      {
        code: "4.3",
        name: "Su ile temas edince yanıcı gaz çıkaran maddeler",
        description: "Su ile tepkimeye girerek yanıcı hidrojen gazı üreten maddeler (sodyum, kalsiyum, çinko tozu).",
      },
    ],
    stowage: [
      "Kuru ve serin alanlarda depolanmalıdır.",
      "Isı kaynaklarından ve doğrudan güneş ışığından uzak tutulmalıdır.",
      "Alt sınıf 4.2: hava geçirmez ambalajlarda, inert atmosfer altında saklanmalıdır.",
      "Alt sınıf 4.3: su geçirmez ambalajlarda, nemden korunarak depolanmalıdır.",
      "Oksitleyici maddelerden ayrı tutulmalıdır.",
    ],
    fireResponse: [
      "Alt sınıf 4.1: su spreyi veya kuru kimyevi toz ile söndürme.",
      "Alt sınıf 4.2: kuru kum veya kuru kimyevi toz — su kullanılabilir ancak dikkatli olunmalıdır.",
      "Alt sınıf 4.3: SU KESİNLİKLE KULLANILMAMALIDIR — kuru kum, kuru toz veya özel D sınıfı söndürücü kullanılmalıdır.",
      "Metal yangınlarında standart söndürücüler etkisizdir.",
    ],
    spillResponse: [
      "Alt sınıf 4.1: döküleni kuru, temiz bir şekilde toplayın.",
      "Alt sınıf 4.2: havaya maruz kalan malzemeyi hızla kapatın veya inert ortamda toplayın.",
      "Alt sınıf 4.3: suyla temastan kesinlikle kaçının — kuru toplama yapın.",
      "Toz formundaki maddelerde kıvılcım önlemi alın.",
    ],
    ppe: [
      "Tam koruyucu elbise",
      "Solunum koruyucu (toz maskesi veya SCBA)",
      "Koruyucu gözlük ve eldiven",
      "Alt sınıf 4.2 için ısıya dayanıklı eldiven",
      "Alt sınıf 4.3 için su geçirmez koruyucu donanım",
    ],
    incompatible: [
      "Oksitleyiciler (Class 5) — tüm alt sınıflar için",
      "Su ve nemli ortamlar — alt sınıf 4.3 için kritik",
      "Asitler ve korozif maddeler (Class 8)",
      "Yanıcı sıvılar (Class 3)",
    ],
    placardInfo:
      "Alt sınıf 4.1: Kırmızı-beyaz dikey çizgili zemin üzerinde alev sembolü. Alt sınıf 4.2: Üst yarısı beyaz, alt yarısı kırmızı zemin üzerinde alev sembolü. Alt sınıf 4.3: Mavi zemin üzerinde alev sembolü.",
    holdPreparation: [
      "Ambar tamamen kuru olmalıdır — özellikle alt sınıf 4.3 için kritik.",
      "Sintine kuyuları kontrol edilmeli, su birikintisi olmamalıdır.",
      "Havalandırma, alt sınıf 4.2 için kontrollü hava sirkülasyonu sağlamalıdır.",
      "Dunnage malzemesi kuru ve yanmaz olmalıdır.",
      "Nem sensörleri kurulması önerilir.",
    ],
  },

  // ── Class 5: Oxidizers & Organic Peroxides ──────────────────────────────
  {
    classNumber: "5",
    name: "Oksitleyiciler ve Organik Peroksitler",
    symbol: "\u{2622}\uFE0F",
    color: "#f59e0b",
    severity: "high",
    definition:
      "Oksitleyici maddeler, başka maddelerin yanmasını hızlandıran veya başlatan oksijen açığa çıkaran maddelerdir. Organik peroksitler ise termal olarak kararsız, ısı, sürtünme veya darbe ile patlayabilen organik bileşiklerdir.",
    subclasses: [
      {
        code: "5.1",
        name: "Oksitleyici maddeler",
        description: "Kendileri yanıcı olmasa da diğer maddelerin yanmasını destekleyen veya başlatan maddeler (amonyum nitrat, hidrojen peroksit, potasyum permanganat).",
      },
      {
        code: "5.2",
        name: "Organik peroksitler",
        description: "Termal olarak kararsız, kendiliğinden bozunabilen ve patlayıcı özellik gösterebilen organik bileşikler (benzoil peroksit, metil etil keton peroksit).",
      },
    ],
    stowage: [
      "Tüm yanıcı maddelerden ayrı tutulmalıdır.",
      "Serin ve iyi havalandırılmış alanlarda depolanmalıdır.",
      "Organik peroksitler (5.2) sıcaklık kontrolü altında taşınmalıdır (SADT limitlerine uygun).",
      "Asitler ve alkalilerden uzak tutulmalıdır.",
      "Ambalajlar hasar görmemiş ve sızdırmaz olmalıdır.",
      "Doğrudan güneş ışığından korunmalıdır.",
    ],
    fireResponse: [
      "Bol su ile soğutma — oksitleyiciler yangını şiddetlendirir.",
      "Kuru kimyevi toz veya CO₂ küçük yangınlarda kullanılabilir.",
      "Organik peroksit yangınlarında SU SPREYI en etkili yöntemdir.",
      "Bitişik konteyner ve yapıları su ile soğutun.",
      "Amonyum nitrat yangınlarında tahliye önceliklidir — patlama riski.",
    ],
    spillResponse: [
      "Döküntüyü yanıcı maddelerden uzak tutun.",
      "Organik malzeme (ahşap, kağıt, kumaş) ile temastan kaçının.",
      "Döküntüyü bol su ile seyreltebilirsiniz (suda çözünür maddeler için).",
      "Metal aletler yerine plastik veya ahşap aletler kullanın (kıvılcım önlemi).",
    ],
    ppe: [
      "Tam koruyucu elbise",
      "Koruyucu gözlük ve yüz siperi",
      "Kimyasal dayanımlı eldiven",
      "Solunum koruyucu (toz/buhar maruziyeti varsa)",
    ],
    incompatible: [
      "Yanıcı sıvılar (Class 3)",
      "Yanıcı katılar (Class 4)",
      "Organik maddeler genel olarak",
      "Asitler (reaksiyon ile oksijen salınımı)",
      "Metal tozları",
    ],
    placardInfo:
      "Alt sınıf 5.1: Sarı zemin üzerinde alev ve daire (O) sembolü. Alt sınıf 5.2: Üst yarısı kırmızı, alt yarısı sarı zemin üzerinde alev sembolü.",
    holdPreparation: [
      "Ambar tamamen temizlenmeli — organik kalıntı (yağ, tahıl artığı vb.) bırakılmamalıdır.",
      "Havalandırma tam kapasitede çalışmalıdır.",
      "Organik peroksitler için sıcaklık izleme sistemi kurulmalıdır.",
      "Yangın söndürme ekipmanı hazır ve erişilebilir olmalıdır.",
      "Dunnage malzemesi yanmaz tipte olmalıdır.",
    ],
  },

  // ── Class 6: Toxic & Infectious ─────────────────────────────────────────
  {
    classNumber: "6",
    name: "Zehirli ve Bulaşıcı Maddeler",
    symbol: "\u2620\uFE0F",
    color: "#f59e0b",
    severity: "high",
    definition:
      "Yutulma, solunma veya cilt teması yoluyla ciddi sağlık sorunlarına veya ölüme yol açabilen maddeler (zehirli) ve canlı mikroorganizmalar veya toksinleri içeren bulaşıcı maddeler.",
    subclasses: [
      {
        code: "6.1",
        name: "Zehirli maddeler",
        description: "Yutulma, solunma veya cilt emilimi yoluyla ölüme veya ciddi yaralanmaya neden olabilen maddeler (siyanür, pestisitler, arsenik bileşikleri).",
      },
      {
        code: "6.2",
        name: "Bulaşıcı maddeler",
        description: "İnsan veya hayvanlarda hastalığa neden olabilecek patojen mikroorganizma içeren maddeler (klinik atıklar, tanı numuneleri).",
      },
    ],
    stowage: [
      "Gıda maddelerinden ve yem ürünlerinden tamamen ayrı tutulmalıdır.",
      "İyi havalandırılmış alanlarda depolanmalıdır.",
      "Sızdırmaz ambalajlarda, dik pozisyonda istiflenmelidir.",
      "Bulaşıcı maddeler (6.2) özel UN onaylı ambalajlarda taşınmalıdır.",
      "Dökülme durumunda kontaminasyonu sınırlamak için secondary containment önerilir.",
    ],
    fireResponse: [
      "Su spreyi, kuru kimyevi toz veya CO₂ ile söndürme.",
      "Zehirli duman ve buhar oluşumuna karşı SCBA zorunludur.",
      "Kontamine su akışını kontrol altına alın — denize ulaşmasını engelleyin.",
      "Yangın sonrası dekontaminasyon prosedürü uygulanmalıdır.",
    ],
    spillResponse: [
      "Koruyucu ekipman olmadan döküntü alanına yaklaşmayın.",
      "Sıvı döküntüleri absorban malzeme ile toplayın.",
      "Kontamine alanı işaretleyin ve izole edin.",
      "Bulaşıcı madde döküntüsünde dezenfeksiyon protokolü uygulayın.",
      "Kontamine atıklar özel tehlikeli atık kaplarında bertaraf edilmelidir.",
    ],
    ppe: [
      "Tam kimyasal koruyucu elbise (Level B veya C)",
      "SCBA veya uygun filtreli solunum maskesi",
      "Çift kat nitril veya butil eldiven",
      "Koruyucu gözlük veya tam yüz siperi",
      "Kullanım sonrası dekontaminasyon prosedürü zorunludur",
    ],
    incompatible: [
      "Gıda maddeleri ve hayvan yemleri",
      "Oksitleyiciler (Class 5) — bazı zehirli maddeler için",
      "Asitler (Class 8) — zehirli gaz salınımı riski",
      "Yanıcı maddeler (Class 3, 4)",
    ],
    placardInfo:
      "Alt sınıf 6.1: Beyaz zemin üzerinde kurukafa ve çapraz kemik sembolü. Alt sınıf 6.2: Beyaz zemin üzerinde biyotehlike (biohazard) sembolü, \"INFECTIOUS SUBSTANCE\" yazısı.",
    holdPreparation: [
      "Ambar tamamen temizlenmeli ve dezenfekte edilmelidir.",
      "Havalandırma sistemi kontrol edilmeli ve tam kapasitede çalışmalıdır.",
      "Sızdırmaz zemin kaplaması veya örtü uygulanmalıdır.",
      "Dekontaminasyon ekipmanı hazır bulundurulmalıdır.",
      "Mürettebat maruziyet izleme prosedürü hakkında bilgilendirilmelidir.",
    ],
  },

  // ── Class 7: Radioactive ───────────────────────────────────────────────
  {
    classNumber: "7",
    name: "Radyoaktif Maddeler",
    symbol: "\u2622\uFE0F",
    color: "#ef4444",
    severity: "critical",
    definition:
      "Spesifik aktivitesi 70 kBq/kg'dan fazla olan ve iyonlaştırıcı radyasyon yayan maddeler. Taşıma indeksi (Transport Index — TI) ve yüzey doz oranına göre kategorize edilir.",
    subclasses: [
      {
        code: "Cat. I",
        name: "Beyaz-I",
        description: "Yüzey doz oranı ≤0.005 mSv/h, Transport Index = 0. En düşük radyasyon seviyesi.",
      },
      {
        code: "Cat. II",
        name: "Sarı-II",
        description: "Yüzey doz oranı ≤0.5 mSv/h, Transport Index ≤1. Orta radyasyon seviyesi.",
      },
      {
        code: "Cat. III",
        name: "Sarı-III",
        description: "Yüzey doz oranı ≤2 mSv/h, Transport Index ≤10. Yüksek radyasyon seviyesi.",
      },
    ],
    stowage: [
      "Transport Index (TI) toplamına göre ayrılma mesafeleri hesaplanmalıdır.",
      "Geliştirilmemiş fotoğrafik filmlerden en az belirtilen mesafede tutulmalıdır.",
      "Mürettebat yaşam alanlarından maksimum uzaklıkta istiflenmelidir.",
      "Aynı araçtaki toplam TI, belirlenen sınırları aşmamalıdır.",
      "Koliler 'bu taraf yukarı' işaretlerine uygun şekilde yerleştirilmelidir.",
    ],
    fireResponse: [
      "Normal söndürme yöntemleri uygulanabilir (su, köpük, CO₂).",
      "Radyoaktif maddeyle doğrudan temastan kaçının.",
      "Kontamine suyun kontrolsüz akışını engelleyin.",
      "Yangın sonrası radyasyon ölçümü yapılmalıdır.",
      "Müdahale personeli dozimetre taşımalıdır.",
    ],
    spillResponse: [
      "Döküntü alanını derhal izole edin ve işaretleyin.",
      "Radyasyon yetkili otoritesine bildirin — zorunlu bildirim.",
      "Koruyucu ekipman olmadan müdahale etmeyin.",
      "Kontamine alanı minimumda tutun — yayılmayı önleyin.",
      "Maruz kalan personelin dozimetrik değerlendirmesi yapılmalıdır.",
    ],
    ppe: [
      "Kişisel dozimetre (TLD veya elektronik dozimetre) zorunlu",
      "Tam koruyucu elbise ve tek kullanımlık tulum",
      "Çift kat eldiven",
      "Solunum koruyucu (kontaminasyon riski varsa)",
      "Maruz kalma süresi ALARA prensibi ile minimum tutulmalıdır",
    ],
    incompatible: [
      "Patlayıcılar (Class 1)",
      "Korozif maddeler (Class 8) — ambalaj bütünlüğünü tehdit edebilir",
      "Geliştirilmemiş fotoğrafik malzemeler",
      "Canlı hayvan ve gıda maddeleri — mesafe koşulu",
    ],
    placardInfo:
      "Kategori I: Tamamen beyaz zemin, trefoil (radyasyon) sembolü. Kategori II-III: Üst yarısı sarı, alt yarısı beyaz zemin, trefoil sembolü. Transport Index ve içerik/aktivite bilgisi etiket üzerinde belirtilmelidir.",
    holdPreparation: [
      "Ambar zemini düzgün ve temiz olmalıdır.",
      "Radyasyon ölçüm cihazları hazır bulundurulmalıdır.",
      "Mürettebat maruz kalma süreleri planlanmalı ve kayıt altına alınmalıdır.",
      "Ayrılma mesafesi tabloları hazır bulundurulmalıdır.",
      "Yetkili otoriteye önceden bildirim yapılmalıdır.",
    ],
  },

  // ── Class 8: Corrosives ─────────────────────────────────────────────────
  {
    classNumber: "8",
    name: "Aşındırıcılar",
    symbol: "\u{1F9EA}",
    color: "#f59e0b",
    severity: "medium",
    definition:
      "Canlı doku ile temas ettiğinde ciddi hasar veren veya sızıntı durumunda diğer yükleri veya taşıma aracını fiziksel olarak hasar verecek şekilde aşındıran maddeler. Asitler ve bazlar bu sınıfa dahildir.",
    subclasses: [
      {
        code: "8 (asit)",
        name: "Asidik korozifler",
        description: "pH değeri düşük, metal ve dokuyu aşındıran asitler (sülfürik asit, hidroklorik asit, nitrik asit).",
      },
      {
        code: "8 (baz)",
        name: "Bazik (alkali) korozifler",
        description: "pH değeri yüksek, dokuyu eritebilen bazlar (sodyum hidroksit, potasyum hidroksit, amonyak çözeltisi).",
      },
    ],
    stowage: [
      "Sızdırmaz ikincil muhafaza (secondary containment) zorunludur.",
      "Asitler ve bazlar birbirinden ayrı tutulmalıdır.",
      "Metal konteynerler korozif madde ile uyumlu malzemeden olmalıdır.",
      "Tank kaplaması korozif madde ile kimyasal uyumlu olmalıdır (paslanmaz çelik, PTFE veya uygun polimer kaplama).",
      "Gıda maddelerinden ayrı tutulmalıdır.",
      "Ambalajlar dik pozisyonda, devrilmeye karşı sabitlenmelidir.",
    ],
    fireResponse: [
      "Su spreyi ile soğutma — ancak su ile reaksiyona giren korozifler için dikkatli olunmalıdır.",
      "Kuru kimyevi toz kullanılabilir.",
      "Korozif buhar solunmamalıdır — SCBA zorunludur.",
      "Kontamine suyun denize veya kanalizasyona ulaşmasını engelleyin.",
    ],
    spillResponse: [
      "Koruyucu ekipman olmadan yaklaşmayın.",
      "Asit döküntüsünü soda (sodyum bikarbonat) ile nötralize edebilirsiniz.",
      "Baz döküntüsünü seyreltik asit ile nötralize edebilirsiniz.",
      "Döküntüyü absorban malzeme ile toplayın, uygun şekilde bertaraf edin.",
      "Metal yüzeylerdeki korozif kalıntıları bol su ile yıkayın.",
    ],
    ppe: [
      "Asit/baz dayanımlı kimyasal koruyucu elbise",
      "Yüz siperi ve sıçrama korumalı gözlük",
      "Kimyasal dayanımlı eldiven (nitril veya butil kauçuk)",
      "Kimyasal dayanımlı çizme",
      "Solunum koruyucu (buhar oluşumu varsa)",
    ],
    incompatible: [
      "Patlayıcılar (Class 1)",
      "Yanıcı maddeler (Class 3, 4) — bazı asitler reaksiyona girebilir",
      "Oksitleyiciler (Class 5) — özellikle asitlerle",
      "Zehirli maddeler (Class 6) — zehirli gaz salınımı riski",
      "Asitler ve bazlar birbirleriyle",
      "Metaller — korozyon ve hidrojen gazı oluşumu",
    ],
    placardInfo:
      "Üst yarısı beyaz, alt yarısı siyah zemin üzerinde sıvı damlasının metal yüzeyi ve eli aşındırma sembolü. UN numarası ve madde adı belirtilir.",
    holdPreparation: [
      "Ambar kaplaması korozif yükle kimyasal uyumlu olmalıdır.",
      "Sintine kuyuları ve drenaj sistemi korozife dayanıklı olmalıdır.",
      "İkincil muhafaza (drip trays veya bunding) hazırlanmalıdır.",
      "Nötralizasyon malzemeleri (soda, kireç) hazır bulundurulmalıdır.",
      "Havalandırma sistemi buhar tahliyesi sağlamalıdır.",
    ],
  },

  // ── Class 9: Miscellaneous ──────────────────────────────────────────────
  {
    classNumber: "9",
    name: "Diğer Tehlikeli Maddeler",
    symbol: "\u26A0\uFE0F",
    color: "#6B7280",
    severity: "medium",
    definition:
      "Diğer sınıflara girmeyen ancak taşıma sırasında tehlike arz eden maddeler. Çevreye zararlı maddeler, yüksek sıcaklıkta taşınan maddeler, lityum piller ve genetiği değiştirilmiş organizmalar bu sınıfa dahildir.",
    subclasses: [
      {
        code: "M1",
        name: "Çevreye zararlı maddeler",
        description: "Deniz kirliliğine neden olabilen maddeler (marine pollutant) — özel ambalaj ve işaretleme gerektirir.",
      },
      {
        code: "M2",
        name: "Yüksek sıcaklıkta taşınan maddeler",
        description: "Sıvı halde ≥100°C veya katı halde ≥240°C'de taşınan maddeler (erimiş kükürt, sıcak asfalt).",
      },
      {
        code: "M3",
        name: "Lityum piller",
        description: "Lityum iyon ve lityum metal piller — termal kaçak (thermal runaway) riski taşır.",
      },
    ],
    stowage: [
      "Madde türüne göre özel gereksinimler değişir.",
      "Çevreye zararlı maddeler: sızdırmaz ambalaj ve deniz kirliliği işareti zorunludur.",
      "Lityum piller: kısa devre korumalı, sıcaklık kontrolü altında, yanıcı maddelerden ayrı.",
      "Yüksek sıcaklık maddeleri: ısı yalıtımlı tank/konteyner, temas riski olan yüklerden ayrı.",
      "Genetiği değiştirilmiş organizmalar: yetkili otorite onayı gerektirir.",
    ],
    fireResponse: [
      "Madde türüne uygun söndürücü seçilmelidir.",
      "Lityum pil yangınlarında: bol su ile soğutma — termal kaçağı kontrol altına almak için.",
      "Yüksek sıcaklık maddeleri: su spreyi ile soğutma, ancak sıçrama riskine dikkat.",
      "Çevreye zararlı madde yangınında kontamine suyun denize ulaşması engellenmelidir.",
    ],
    spillResponse: [
      "Çevreye zararlı madde döküntüsünde denize ulaşımı engelleyin — çevre mevzuatı bildirimi zorunludur.",
      "Lityum pil hasarında: pili izole edin, su ile soğutun, kısa devreyi önleyin.",
      "Yüksek sıcaklık maddeleri: yanık riski — yaklaşmayın, soğumasını bekleyin.",
      "Uygun absorban malzeme ile döküntüyü sınırlayın ve toplayın.",
    ],
    ppe: [
      "Madde türüne uygun koruyucu ekipman",
      "Yüksek sıcaklık maddeleri: ısıya dayanıklı tam koruyucu",
      "Çevreye zararlı maddeler: kimyasal koruyucu elbise",
      "Lityum pil müdahalesinde yangın söndürme donanımı",
      "Minimum: koruyucu gözlük, eldiven, koruyucu ayakkabı",
    ],
    incompatible: [
      "Madde türüne göre değişir — SDS (Safety Data Sheet) referans alınmalıdır.",
      "Lityum piller: su-reaktif maddeler (Class 4.3) ile ayrı tutulmalı",
      "Çevreye zararlı maddeler: gıda ve yem ürünlerinden ayrı",
      "Yüksek sıcaklık maddeleri: yanıcı ve düşük erime noktalı maddelerden ayrı",
    ],
    placardInfo:
      "Beyaz zemin üzerinde, üst yarısında yedi dikey siyah çizgi sembolü. Çevreye zararlı maddeler için ek olarak marine pollutant (balık ve ağaç) işareti eklenir. UN numarası ve madde adı belirtilir.",
    holdPreparation: [
      "Madde türüne göre ambar hazırlığı farklılık gösterir.",
      "Çevreye zararlı maddeler: sızdırmazlık kontrolleri yapılmalı, sintine tahliyesi çevre mevzuatına uygun olmalıdır.",
      "Lityum piller: yangın algılama ve söndürme sistemi kontrol edilmeli.",
      "Yüksek sıcaklık maddeleri: ısı yalıtımı kontrol edilmeli, bitişik yapılar korunmalıdır.",
      "İlgili SDS dokümanları gemide hazır bulundurulmalıdır.",
    ],
  },
];

/** Lookup an IMDG class by its class number string (e.g. "3", "Class 3"). */
export function getImdgClass(hazardClass: string): ImdgClass | undefined {
  const num = hazardClass.replace("Class ", "");
  return imdgClasses.find((c) => c.classNumber === num);
}
