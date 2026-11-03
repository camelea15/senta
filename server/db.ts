import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: 'women' | 'men' | 'unisex';
  volume: string;
  price: number; // in DZD
  descriptionFr: string;
  descriptionAr: string;
  topNotesFr: string;
  topNotesAr: string;
  heartNotesFr: string;
  heartNotesAr: string;
  baseNotesFr: string;
  baseNotesAr: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface WilayaDeliveryFee {
  code: string;
  nameFr: string;
  nameAr: string;
  homeFee: number;
  deskFee: number;
  available: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 10) or fixed DZD (e.g. 1000)
  minOrderAmount?: number;
  active: boolean;
  usedCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  volume: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  phoneNumber: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryAddress: string;
  deliveryMethod: 'home' | 'desk';
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  total: number;
  paymentMethod: 'cod'; // Cash On Delivery
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface StoreSettings {
  freeShippingThreshold: number; // e.g. 25000 DZD
  currency: string;
  siteName: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
}

export interface DatabaseSchema {
  adminUser: {
    username: string;
    passwordHash: string;
    salt: string;
  };
  products: Product[];
  wilayas: WilayaDeliveryFee[];
  orders: Order[];
  promos: PromoCode[];
  contacts: ContactMessage[];
  settings: StoreSettings;
}

// 58 Algerian Wilayas data
export const INITIAL_WILAYAS: WilayaDeliveryFee[] = [
  { code: '01', nameFr: 'Adrar', nameAr: 'أدرار', homeFee: 950, deskFee: 650, available: true },
  { code: '02', nameFr: 'Chlef', nameAr: 'الشلف', homeFee: 600, deskFee: 400, available: true },
  { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', homeFee: 750, deskFee: 500, available: true },
  { code: '04', nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', homeFee: 650, deskFee: 450, available: true },
  { code: '05', nameFr: 'Batna', nameAr: 'باتنة', homeFee: 650, deskFee: 450, available: true },
  { code: '06', nameFr: 'Béjaïa', nameAr: 'بجاية', homeFee: 600, deskFee: 400, available: true },
  { code: '07', nameFr: 'Biskra', nameAr: 'بسكرة', homeFee: 750, deskFee: 500, available: true },
  { code: '08', nameFr: 'Béchar', nameAr: 'بشار', homeFee: 950, deskFee: 650, available: true },
  { code: '09', nameFr: 'Blida', nameAr: 'البليدة', homeFee: 500, deskFee: 350, available: true },
  { code: '10', nameFr: 'Bouira', nameAr: 'البويرة', homeFee: 550, deskFee: 350, available: true },
  { code: '11', nameFr: 'Tamanrasset', nameAr: 'تمنراست', homeFee: 1200, deskFee: 850, available: true },
  { code: '12', nameFr: 'Tébessa', nameAr: 'تبسة', homeFee: 700, deskFee: 450, available: true },
  { code: '13', nameFr: 'Tlemcen', nameAr: 'تلمسان', homeFee: 650, deskFee: 450, available: true },
  { code: '14', nameFr: 'Tiaret', nameAr: 'تيارت', homeFee: 650, deskFee: 450, available: true },
  { code: '15', nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', homeFee: 550, deskFee: 350, available: true },
  { code: '16', nameFr: 'Alger', nameAr: 'الجزائر', homeFee: 400, deskFee: 250, available: true },
  { code: '17', nameFr: 'Djelfa', nameAr: 'الجلفة', homeFee: 750, deskFee: 500, available: true },
  { code: '18', nameFr: 'Jijel', nameAr: 'جيجل', homeFee: 650, deskFee: 450, available: true },
  { code: '19', nameFr: 'Sétif', nameAr: 'سطيف', homeFee: 600, deskFee: 400, available: true },
  { code: '20', nameFr: 'Saïda', nameAr: 'سعيدة', homeFee: 700, deskFee: 450, available: true },
  { code: '21', nameFr: 'Skikda', nameAr: 'سكيكدة', homeFee: 650, deskFee: 450, available: true },
  { code: '22', nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', homeFee: 650, deskFee: 450, available: true },
  { code: '23', nameFr: 'Annaba', nameAr: 'عنابة', homeFee: 650, deskFee: 450, available: true },
  { code: '24', nameFr: 'Guelma', nameAr: 'قالمة', homeFee: 650, deskFee: 450, available: true },
  { code: '25', nameFr: 'Constantine', nameAr: 'قسنطينة', homeFee: 600, deskFee: 400, available: true },
  { code: '26', nameFr: 'Médéa', nameAr: 'المدية', homeFee: 550, deskFee: 350, available: true },
  { code: '27', nameFr: 'Mostaganem', nameAr: 'مستغانم', homeFee: 600, deskFee: 400, available: true },
  { code: '28', nameFr: "M'Sila", nameAr: 'المسيلة', homeFee: 700, deskFee: 450, available: true },
  { code: '29', nameFr: 'Mascara', nameAr: 'معسكر', homeFee: 650, deskFee: 450, available: true },
  { code: '30', nameFr: 'Ouargla', nameAr: 'ورقلة', homeFee: 850, deskFee: 600, available: true },
  { code: '31', nameFr: 'Oran', nameAr: 'وهران', homeFee: 600, deskFee: 400, available: true },
  { code: '32', nameFr: 'El Bayadh', nameAr: 'البيض', homeFee: 850, deskFee: 600, available: true },
  { code: '33', nameFr: 'Illizi', nameAr: 'إليزي', homeFee: 1200, deskFee: 850, available: true },
  { code: '34', nameFr: 'Bordj Bou Arreridj', nameAr: 'برج بوعريريج', homeFee: 600, deskFee: 400, available: true },
  { code: '35', nameFr: 'Boumerdès', nameAr: 'بومرداس', homeFee: 450, deskFee: 300, available: true },
  { code: '36', nameFr: 'El Tarf', nameAr: 'الطارف', homeFee: 700, deskFee: 450, available: true },
  { code: '37', nameFr: 'Tindouf', nameAr: 'تندوف', homeFee: 1200, deskFee: 850, available: true },
  { code: '38', nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', homeFee: 650, deskFee: 450, available: true },
  { code: '39', nameFr: 'El Oued', nameAr: 'الوادي', homeFee: 850, deskFee: 600, available: true },
  { code: '40', nameFr: 'Khenchela', nameAr: 'خنشلة', homeFee: 700, deskFee: 450, available: true },
  { code: '41', nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', homeFee: 700, deskFee: 450, available: true },
  { code: '42', nameFr: 'Tipaza', nameAr: 'تيبازة', homeFee: 500, deskFee: 350, available: true },
  { code: '43', nameFr: 'Mila', nameAr: 'ميلة', homeFee: 650, deskFee: 450, available: true },
  { code: '44', nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', homeFee: 600, deskFee: 400, available: true },
  { code: '45', nameFr: 'Naâma', nameAr: 'النعامة', homeFee: 900, deskFee: 600, available: true },
  { code: '46', nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', homeFee: 650, deskFee: 450, available: true },
  { code: '47', nameFr: 'Ghardaïa', nameAr: 'غرداية', homeFee: 850, deskFee: 600, available: true },
  { code: '48', nameFr: 'Relizane', nameAr: 'غليزان', homeFee: 650, deskFee: 450, available: true },
  { code: '49', nameFr: 'Timimoun', nameAr: 'تيميمون', homeFee: 1100, deskFee: 750, available: true },
  { code: '50', nameFr: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', homeFee: 1300, deskFee: 900, available: true },
  { code: '51', nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', homeFee: 800, deskFee: 550, available: true },
  { code: '52', nameFr: 'Béni Abbès', nameAr: 'بني عباس', homeFee: 1100, deskFee: 750, available: true },
  { code: '53', nameFr: 'In Salah', nameAr: 'عين صالح', homeFee: 1200, deskFee: 850, available: true },
  { code: '54', nameFr: 'In Guezzam', nameAr: 'عين قزام', homeFee: 1300, deskFee: 900, available: true },
  { code: '55', nameFr: 'Touggourt', nameAr: 'تقرت', homeFee: 850, deskFee: 600, available: true },
  { code: '56', nameFr: 'Djanet', nameAr: 'جانت', homeFee: 1300, deskFee: 900, available: true },
  { code: '57', nameFr: "El M'Ghair", nameAr: 'المغير', homeFee: 850, deskFee: 600, available: true },
  { code: '58', nameFr: 'El Meniaa', nameAr: 'المنيعة', homeFee: 950, deskFee: 650, available: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: "Éclat d'Or",
    nameAr: "إشراقة الذهب",
    category: 'women',
    volume: '100 ml',
    price: 8500,
    descriptionFr: "Un sillage floral sophistiqué aux notes solaires et élégantes, sublimé par un cœur d'oranger lumineux et de jasmin précieux sur lit d'ambre chaleureux.",
    descriptionAr: "عطر زهري راقٍ بنفحات دافئة وأنيقة، تبرز فيه روائح زهر البرتقال والياسمين الثمين على قاعدة عنبرية دافئة.",
    topNotesFr: "Fleur d'oranger de Méditerranée, Mandarine jaune",
    topNotesAr: "زهر البرتقال المتوسطي، اليوسفي الأصفر",
    heartNotesFr: "Jasmin sambac, Gardénia solaire, Rose de Mai",
    heartNotesAr: "ياسمين سامباك، غاردينيا مضيئة، ورد مايو",
    baseNotesFr: "Ambre solaire, Bois de santal crémeux, Vanille Bourbon",
    baseNotesAr: "عنبر دافئ، خشب صندل كريمي، فانيليا بوربون",
    image: '/src/assets/images/perfume_eclat_dor_1793742299864.jpg',
    inStock: true,
    stockQuantity: 24,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-02',
    name: "Oud Royal",
    nameAr: "عود ملكي",
    category: 'men',
    volume: '100 ml',
    price: 10500,
    descriptionFr: "Une création boisée majestueuse au caractère oriental profond, associant le bois de oud rare, l'encens mystique et le cuir ambré d'une tenue exceptionnelle.",
    descriptionAr: "عطر خشبي فخم بطابع شرقي عميق، يجمع بين خشب العود النادر والبخور الأسطوري والجلد العنبري بثبات استثنائي.",
    topNotesFr: "Cardamome verte, Safran d'Orient, Bergamote",
    topNotesAr: "حب الهيل الأخضر، زعفران شرقي، برغموت",
    heartNotesFr: "Oud du Cambodge, Bois de cèdre de l'Atlas, Patchouli",
    heartNotesAr: "عود كمبودي، خشب أرز الأطلس، باتشولي",
    baseNotesFr: "Ambre gris, Cuir de Cordoue, Fève tonka grillée",
    baseNotesAr: "عنبر رمادي، جلد فاخر، حبوب التونكا المحمصة",
    image: '/src/assets/images/perfume_oud_royal_1793742301993.jpg',
    inStock: true,
    stockQuantity: 18,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-03',
    name: "Rose Velours",
    nameAr: "ورد مخملي",
    category: 'women',
    volume: '50 ml',
    price: 7900,
    descriptionFr: "Une fragrance de rose délicate et romantique, caressée d'un velouté poudré d'iris et de muscs blancs soyeux à la grâce intemporelle.",
    descriptionAr: "عطر ورد رقيق ورومانسي مفعم بلمسات مخملية بودرية من السوسن ونفحات المسك الأبيض الحريري.",
    topNotesFr: "Pétales de rose de Damas, Litchi givré",
    topNotesAr: "بتلات ورد دمشقي، ليتشي مثلج",
    heartNotesFr: "Absolu de rose centifolia, Iris de Florence, Pivoine",
    heartNotesAr: "خلاصة الورد الجوري، سوسن فلورنسا، الفاوانيا",
    baseNotesFr: "Musc blanc poudré, Bois de cèdre doux, Ambrette",
    baseNotesAr: "مسك أبيض بودري، خشب الأرز الهادئ، عنبريت",
    image: '/src/assets/images/perfume_rose_velours_1793742303084.jpg',
    inStock: true,
    stockQuantity: 30,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-04',
    name: "Nuit Ambrée",
    nameAr: "ليلة عنبرية",
    category: 'unisex',
    volume: '100 ml',
    price: 9200,
    descriptionFr: "Une sensualité magnétique fusionnant un ambre chaleureux, des volutes de vanille épicée et des résines précieuses pour une signature nocturne inoubliable.",
    descriptionAr: "جاذبية حسية آسرة تمزج بين العنبر الدافئ، خفقات الفانيليا الحارة والراتنجات الثمينة لتوقيع ليلي لا يُنسى.",
    topNotesFr: "Cannelle de Ceylan, Poivre rose, Noix de muscade",
    topNotesAr: "قرفة سيلانية، فلفل وردي، جوزة الطيب",
    heartNotesFr: "Résine de benjoin, Ambre doré, Bois de gaïac",
    heartNotesAr: "راتنج البنزوين، عنبر ذهبي، خشب الغاياك",
    baseNotesFr: "Vanille noire de Madagascar, Fève tonka, Labdanum",
    baseNotesAr: "فانيليا مدغشقر السوداء، حبوب التونكا، لابدانيوم",
    image: '/src/assets/images/perfume_nuit_ambree_1793742302871.jpg',
    inStock: true,
    stockQuantity: 22,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-05',
    name: "Citrus Élégance",
    nameAr: "أناقة الحمضيات",
    category: 'men',
    volume: '100 ml',
    price: 7200,
    descriptionFr: "Une envolée pétillante de fraîcheur méditerranéenne aux notes vibrantes d'agrumes nobles sublimée par un fond de vétiver boisé et de mousse de chêne.",
    descriptionAr: "انطلاقة منعشة وفاخرة بلمسات حمضية مشرقة، تتألق بعبير البرغموت والليمون الفاخر على قاعدة من نجيل الهند وخشب البلوط.",
    topNotesFr: "Bergamote de Calabre, Pamplemousse rose, Cédrat",
    topNotesAr: "برغموت كالابريا، جريب فروت وردي، كباد",
    heartNotesFr: "Géranium bourbon, Poivre du Sichuan, Romarin sauvage",
    heartNotesAr: "إبرة الراعي، فلفل سيتشوان، إكليل الجبل البري",
    baseNotesFr: "Vétiver d'Haïti, Mousse de chêne, Musc minéral",
    baseNotesAr: "نجيل الهند الهايتي، طحلب السنديان، مسك معدني",
    image: '/src/assets/images/perfume_citrus_elegance_1793742304791.jpg',
    inStock: true,
    stockQuantity: 28,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-06',
    name: "Santal Mystique",
    nameAr: "صندل أسطوري",
    category: 'unisex',
    volume: '100 ml',
    price: 9800,
    descriptionFr: "Un accord boisé noble et contemplatif où le bois de santal crémeux s'harmonise avec l'encens sacré et une touche de cardamome épicée.",
    descriptionAr: "تناغم خشبي مهيب يجمع بين خشب الصندل الكريمي الساحر وبخور اللبان العطري مع لمسة من الهيل الملكي.",
    topNotesFr: "Cardamome noire, Gingembre frais, Cyprès",
    topNotesAr: "هيل أسود، زنجبيل طازج، سرو",
    heartNotesFr: "Santal d'Australie crémeux, Iris poudré, Papyrus",
    heartNotesAr: "صندل أسترالي كريمي، سوسن بودري، بردي",
    baseNotesFr: "Encens d'Oman, Bois de cèdre, Musc blanc velouté",
    baseNotesAr: "لبان عماني، خشب الأرز، مسك أبيض مخملي",
    image: '/src/assets/images/perfume_santal_mystique_1793742305628.jpg',
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-07',
    name: "Fleur de Soie",
    nameAr: "زهرة الحرير",
    category: 'women',
    volume: '50 ml',
    price: 8200,
    descriptionFr: "Une fragrance florale délicate et lumineuse au raffinement féminin exceptionnel, rappelant la texture soyeuse d'une mousseline précieuse.",
    descriptionAr: "عطر زهري رقيق ومشرق بأنوثة راقية واستثنائية، يجسد الملمس الانسيابي الحريري لأرقى الأقمشة الفاخرة.",
    topNotesFr: "Magnolia blanc, Poire williams, Fleur de pommier",
    topNotesAr: "ماغنوليا بيضاء، إجاص ويليامز، زهر التفاح",
    heartNotesFr: "Fleur de cerisier, Tubéreuse blanche, Muguet doux",
    heartNotesAr: "أزهار الكرز، مسك الروم الأبيض، زنبق الوادي",
    baseNotesFr: "Bois blanc lustré, Ambre blanc, Soie musquée",
    baseNotesAr: "أخشاب بيضاء نقية، عنبر أبيض، مسك الحرير",
    image: '/src/assets/images/perfume_fleur_de_soie_1793742306098.jpg',
    inStock: true,
    stockQuantity: 20,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-08',
    name: "Azur Intense",
    nameAr: "أزور إنتنس",
    category: 'men',
    volume: '100 ml',
    price: 8900,
    descriptionFr: "Une eau de parfum marine vivifiante à la fraîcheur intense et minérale, évoquant la force du vent méditerranéen sur les falaises côtières.",
    descriptionAr: "ماء عطر بحري منعش ينبض بالقوة والحيوية ونفحات البحر الأطلسي العميقة على الشواطئ الصخرية.",
    topNotesFr: "Brise marine ozonique, Citron vert des Caraïbes, Menthe fraîche",
    topNotesAr: "نسيم بحري نقي، ليمون أخضر، نعناع منعش",
    heartNotesFr: "Sauge sclarée, Lavande maritime, Cardamome verte",
    heartNotesAr: "مرمية، خزامى بحرية، حب الهيل الأخضر",
    baseNotesFr: "Bois flotté, Ambre gris marin, Cèdre bleu",
    baseNotesAr: "أخشاب بحرية طافية، عنبر بحري، أرز أزرق",
    image: '/src/assets/images/perfume_azur_intense_1793742307243.jpg',
    inStock: true,
    stockQuantity: 25,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-09',
    name: "Vanille Noire",
    nameAr: "فانيليا سوداء",
    category: 'women',
    volume: '100 ml',
    price: 8600,
    descriptionFr: "Une création gourmande somptueuse sublimée par la gousse noire de Madagascar, réchauffée de touches liquoreuses et de bois nobles.",
    descriptionAr: "ابتكار عطري فاخر دافئ يتألق بفانيليا مدغشقر السوداء المحاطة بلمسات ناعمة من الكراميل والأخشاب الثمينة.",
    topNotesFr: "Amande amère, Fleur d'amandier, Praline douce",
    topNotesAr: "لوز مر، زهر اللوز، حلوى البرالين الناعمة",
    heartNotesFr: "Absolu de vanille noire, Orchidée vanille, Héliotrope",
    heartNotesAr: "مستخلص الفانيليا السوداء، أوركيد الفانيليا، الهليوتروب",
    baseNotesFr: "Fève tonka torréfiée, Bois de santal, Musc doré",
    baseNotesAr: "تونكا محمصة، خشب الصندل، مسك ذهبي",
    image: '/src/assets/images/perfume_vanille_noire_1793742307698.jpg',
    inStock: true,
    stockQuantity: 19,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    name: "Musc Blanc",
    nameAr: "مسك أبيض",
    category: 'unisex',
    volume: '100 ml',
    price: 7500,
    descriptionFr: "Un accord pur, cotonneux et intemporel qui enveloppe le corps d'une aura propre et raffinée, d'une douceur absolue.",
    descriptionAr: "عطر نقي، قطني وخالد يغلف الجسم بهالة صافية وأنيقة من الانتعاش والنعومة الفائقة.",
    topNotesFr: "Fleurs de coton, Aldéhydes blancs, Bergamote pure",
    topNotesAr: "زهور القطن، ألدهيدات بيضاء، برغموت نقي",
    heartNotesFr: "Musc blanc pur, Jasmin d'eau, Fleur de lin",
    heartNotesAr: "مسك أبيض صافٍ، ياسمين مائي، زهر الكتان",
    baseNotesFr: "Bois de cachemire, Muscs soyeux, Ambrette minérale",
    baseNotesAr: "خشب الكشمير، مسك حريري، عنبريت ناعم",
    image: '/src/assets/images/perfume_musc_blanc_1793742307870.jpg',
    inStock: true,
    stockQuantity: 32,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_PROMOS: PromoCode[] = [
  { id: 'promo-1', code: 'SENTA10', type: 'percentage', value: 10, minOrderAmount: 8000, active: true, usedCount: 14 },
  { id: 'promo-2', code: 'BIENVENUE', type: 'fixed', value: 1000, minOrderAmount: 12000, active: true, usedCount: 8 },
  { id: 'promo-3', code: 'VIP2026', type: 'percentage', value: 15, minOrderAmount: 18000, active: true, usedCount: 5 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    reference: 'SN-260101',
    customerName: 'Yacine Bensalem',
    phoneNumber: '0550123456',
    wilayaCode: '16',
    wilayaName: 'Alger',
    commune: 'Hydra',
    deliveryAddress: 'Résidence Les Pins, Bâtiment B, Apt 14',
    deliveryMethod: 'home',
    deliveryFee: 400,
    items: [
      {
        productId: 'prod-02',
        productName: 'Oud Royal',
        productNameAr: 'عود ملكي',
        volume: '100 ml',
        price: 10500,
        quantity: 1,
        image: '/src/assets/images/perfume_oud_royal_1793742301993.jpg',
      },
    ],
    subtotal: 10500,
    discountAmount: 0,
    total: 10900,
    paymentMethod: 'cod',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord-1002',
    reference: 'SN-260102',
    customerName: 'Amira Cherif',
    phoneNumber: '0661789012',
    wilayaCode: '31',
    wilayaName: 'Oran',
    commune: 'Akid Lotfi',
    deliveryAddress: 'Boulevard du Millénium, Villa 45',
    deliveryMethod: 'home',
    deliveryFee: 600,
    items: [
      {
        productId: 'prod-01',
        productName: "Éclat d'Or",
        productNameAr: "إشراقة الذهب",
        volume: '100 ml',
        price: 8500,
        quantity: 1,
        image: '/src/assets/images/perfume_eclat_dor_1793742299864.jpg',
      },
      {
        productId: 'prod-03',
        productName: 'Rose Velours',
        productNameAr: 'ورد مخملي',
        volume: '50 ml',
        price: 7900,
        quantity: 1,
        image: '/src/assets/images/perfume_rose_velours_1793742303084.jpg',
      },
    ],
    subtotal: 16400,
    discountAmount: 1000,
    promoCode: 'BIENVENUE',
    total: 16000,
    paymentMethod: 'cod',
    status: 'preparing',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 / 2).toISOString(),
  },
  {
    id: 'ord-1003',
    reference: 'SN-260103',
    customerName: 'Karim Mebarki',
    phoneNumber: '0770345678',
    wilayaCode: '25',
    wilayaName: 'Constantine',
    commune: 'Zouaghi',
    deliveryAddress: 'Cité Belle Vue, Bureau Yalidine Zouaghi',
    deliveryMethod: 'desk',
    deliveryFee: 400,
    items: [
      {
        productId: 'prod-04',
        productName: 'Nuit Ambrée',
        productNameAr: 'ليلة عنبرية',
        volume: '100 ml',
        price: 9200,
        quantity: 1,
        image: '/src/assets/images/perfume_nuit_ambree_1793742302871.jpg',
      },
    ],
    subtotal: 9200,
    discountAmount: 0,
    total: 9600,
    paymentMethod: 'cod',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Salt & Hash helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading DB file, seeding fresh defaults:', e);
    }

    // Default seed
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultHash = hashPassword('SentaAdmin2026!', defaultSalt);

    const initialData: DatabaseSchema = {
      adminUser: {
        username: 'admin@senta.dz',
        passwordHash: defaultHash,
        salt: defaultSalt,
      },
      products: INITIAL_PRODUCTS,
      wilayas: INITIAL_WILAYAS,
      orders: INITIAL_ORDERS,
      promos: INITIAL_PROMOS,
      contacts: [],
      settings: {
        freeShippingThreshold: 22000,
        currency: 'DZD',
        siteName: 'SENTA.DZ',
        supportPhone: '+213 550 00 26 26',
        supportEmail: 'contact@senta.dz',
        whatsappNumber: '+213550002626',
      },
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving database:', e);
    }
  }

  private save() {
    this.saveData(this.data);
  }

  // --- Auth ---
  verifyAdmin(username: string, password: string):boolean {
    if (username.toLowerCase() !== this.data.adminUser.username.toLowerCase()) {
      return false;
    }
    const checkHash = hashPassword(password, this.data.adminUser.salt);
    return crypto.timingSafeEqual(
      Buffer.from(checkHash, 'utf-8'),
      Buffer.from(this.data.adminUser.passwordHash, 'utf-8')
    );
  }

  changeAdminPassword(newPassword: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(newPassword, salt);
    this.data.adminUser.salt = salt;
    this.data.adminUser.passwordHash = hash;
    this.save();
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.save();
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const len = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createOrder(orderData: Omit<Order, 'id' | 'reference' | 'createdAt' | 'updatedAt'>): Order {
    const refNum = Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      reference: `SN-${refNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Decrement stock
    for (const item of newOrder.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (prod.stockQuantity === 0) {
          prod.inStock = false;
        }
      }
    }

    // Increment promo usage
    if (newOrder.promoCode) {
      const promo = this.data.promos.find((p) => p.code.toUpperCase() === newOrder.promoCode?.toUpperCase());
      if (promo) {
        promo.usedCount += 1;
      }
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Wilayas ---
  getWilayas(): WilayaDeliveryFee[] {
    return this.data.wilayas;
  }

  updateWilayaFee(code: string, updates: Partial<WilayaDeliveryFee>): WilayaDeliveryFee | null {
    const wilaya = this.data.wilayas.find((w) => w.code === code);
    if (!wilaya) return null;
    Object.assign(wilaya, updates);
    this.save();
    return wilaya;
  }

  // --- Promos ---
  getPromos(): PromoCode[] {
    return this.data.promos;
  }

  validatePromo(code: string, cartTotal: number): { valid: boolean; discount: number; message?: string } {
    const promo = this.data.promos.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!promo || !promo.active) {
      return { valid: false, discount: 0, message: 'Code promo invalide ou expiré' };
    }
    if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Commande minimum de ${promo.minOrderAmount.toLocaleString()} DZD requise pour ce code`,
      };
    }
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.round((cartTotal * promo.value) / 100);
    } else {
      discount = Math.min(cartTotal, promo.value);
    }
    return { valid: true, discount };
  }

  addPromo(promo: Omit<PromoCode, 'id' | 'usedCount'>): PromoCode {
    const newPromo: PromoCode = {
      ...promo,
      code: promo.code.trim().toUpperCase(),
      id: `promo-${Date.now()}`,
      usedCount: 0,
    };
    this.data.promos.unshift(newPromo);
    this.save();
    return newPromo;
  }

  togglePromo(id: string): PromoCode | null {
    const p = this.data.promos.find((item) => item.id === id);
    if (!p) return null;
    p.active = !p.active;
    this.save();
    return p;
  }

  deletePromo(id: string): boolean {
    const len = this.data.promos.length;
    this.data.promos = this.data.promos.filter((p) => p.id !== id);
    if (this.data.promos.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Contacts ---
  addContact(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.contacts.unshift(newMsg);
    this.save();
    return newMsg;
  }

  getContacts(): ContactMessage[] {
    return this.data.contacts;
  }

  markContactRead(id: string): void {
    const msg = this.data.contacts.find((c) => c.id === id);
    if (msg) {
      msg.read = true;
      this.save();
    }
  }

  // --- Settings ---
  getSettings(): StoreSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Stats ---
  getStats() {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter((o) => o.status === 'delivered').length;
    const pendingOrders = this.data.orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
    const totalRevenue = this.data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue,
      totalProducts: this.data.products.length,
      lowStockProducts: this.data.products.filter((p) => p.stockQuantity <= 5).length,
    };
  }
}

export const db = new Database();
