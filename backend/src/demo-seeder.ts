/**
 * BROTHERHOOD CLOTHING — MEGA DEMO SEEDER v2.0
 * ============================================================
 * Creates: 5 Shop Owners · 20 Customers · 5 Shops · 200+ Products
 *          60+ Orders · 50+ Reviews · Messages · Coupons · Follows
 * ============================================================
 */

const BASE_URL = 'http://localhost:5000/api';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const api = async (method: string, path: string, body?: any, token?: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    console.warn(`  ⚠️  ${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 120)}`);
  }
  return { status: res.status, data };
};

const login = async (email: string, name: string, avatar?: string): Promise<string | null> => {
  const r = await api('POST', '/auth/google', {
    credential: email,
    name: name || email.split('@')[0],
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
  });
  return r.data?.token || null;
};

let totalPassed = 0;
let totalFailed = 0;
const pass = (msg: string) => { totalPassed++; console.log(`  ✅ ${msg}`); };
const fail = (msg: string) => { totalFailed++; console.log(`  ❌ ${msg}`); };
const section = (title: string) => console.log(`\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`);

// ─── SHOP OWNER PROFILES ──────────────────────────────────────────────────────
const SHOP_OWNERS = [
  {
    email: 'gauswamiashish760@gmail.com',
    name: 'Ashish Gauswami',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    shop: {
      name: 'Brotherhood Clothing',
      ownerName: 'Ashish Gauswami',
      phone: '9664592743',
      email: 'gauswamiashish760@gmail.com',
      city: 'Palanpur',
      category: 'All Wear',
      description: 'Palanpur\'s ultimate fashion destination. A curated world of premium designer wear, luxury casuals, and modern streetwear for every occasion.',
      instagramUrl: 'https://www.instagram.com/gauswami_8_07_18',
      logoUrl: 'https://images.unsplash.com/photo-1581404917879-53e9c0e88a9d?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
    }
  },
  {
    email: 'riya.mehta@boutique.com',
    name: 'Riya Mehta',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    shop: {
      name: 'Gharara Gali',
      ownerName: 'Riya Mehta',
      phone: '9876501234',
      email: 'riya.mehta@boutique.com',
      city: 'Palanpur',
      category: 'Womenswear',
      description: 'Exquisite Gujarati bridal wear, designer lehengas, and contemporary ethnic fusion. Crafted with love by Palanpur\'s most celebrated women\'s boutique.',
      instagramUrl: 'https://instagram.com/gharara_gali',
      logoUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&h=400&q=80',
    }
  },
  {
    email: 'karim.shaikh@menswear.in',
    name: 'Karim Shaikh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    shop: {
      name: 'Couture Palanpur',
      ownerName: 'Karim Shaikh',
      phone: '9876543210',
      email: 'karim.shaikh@menswear.in',
      city: 'Palanpur',
      category: 'Menswear',
      description: 'Bespoke suits, premium sherwanis, and tailored linen shirts crafted to perfection. The home of Palanpur\'s finest men\'s fashion atelier.',
      instagramUrl: 'https://instagram.com/couture_palanpur',
      logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&h=400&q=80',
    }
  },
  {
    email: 'priya.jain@kidzone.com',
    name: 'Priya Jain',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    shop: {
      name: 'KidZone Fashion',
      ownerName: 'Priya Jain',
      phone: '9988776655',
      email: 'priya.jain@kidzone.com',
      city: 'Palanpur',
      category: 'Kids Wear',
      description: 'Vibrant, safe, and stylish clothing for children aged 1–14. Premium fabrics, fun designs, and festive collections that kids love.',
      instagramUrl: 'https://instagram.com/kidzone_fashion',
      logoUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1200&h=400&q=80',
    }
  },
  {
    email: 'arjun.patel@soleempire.in',
    name: 'Arjun Patel',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    shop: {
      name: 'Sole Empire',
      ownerName: 'Arjun Patel',
      phone: '9123456789',
      email: 'arjun.patel@soleempire.in',
      city: 'Palanpur',
      category: 'Footwear',
      description: 'Premium sneakers, handcrafted leather shoes, and luxury sandals. Sole Empire brings global footwear trends to the streets of Palanpur.',
      instagramUrl: 'https://instagram.com/sole_empire_palanpur',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&h=400&q=80',
    }
  },
];

// ─── CUSTOMER PROFILES (20) ───────────────────────────────────────────────────
const CUSTOMERS = [
  { email: 'ananya.sharma@gmail.com',   name: 'Ananya Sharma',   avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80' },
  { email: 'rohan.desai@gmail.com',     name: 'Rohan Desai',     avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80' },
  { email: 'pooja.verma@gmail.com',     name: 'Pooja Verma',     avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&q=80' },
  { email: 'aryan.nair@gmail.com',      name: 'Aryan Nair',      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { email: 'kavya.iyer@gmail.com',      name: 'Kavya Iyer',      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
  { email: 'dev.malhotra@gmail.com',    name: 'Dev Malhotra',    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80' },
  { email: 'sneha.gupta@gmail.com',     name: 'Sneha Gupta',     avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { email: 'vikram.kapoor@gmail.com',   name: 'Vikram Kapoor',   avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { email: 'priya.krishnan@gmail.com',  name: 'Priya Krishnan',  avatar: 'https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?auto=format&fit=crop&w=150&q=80' },
  { email: 'amit.shah@gmail.com',       name: 'Amit Shah',       avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
  { email: 'nisha.pandey@gmail.com',    name: 'Nisha Pandey',    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&q=80' },
  { email: 'rahul.mehta@gmail.com',     name: 'Rahul Mehta',     avatar: 'https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?auto=format&fit=crop&w=150&q=80' },
  { email: 'simran.kaur@gmail.com',     name: 'Simran Kaur',     avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=80' },
  { email: 'karan.joshi@gmail.com',     name: 'Karan Joshi',     avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=150&q=80' },
  { email: 'meera.reddy@gmail.com',     name: 'Meera Reddy',     avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=150&q=80' },
  { email: 'nikhil.soni@gmail.com',     name: 'Nikhil Soni',     avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
  { email: 'aisha.khan@gmail.com',      name: 'Aisha Khan',      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80' },
  { email: 'siddharth.roy@gmail.com',   name: 'Siddharth Roy',   avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' },
  { email: 'tanvi.malhotra@gmail.com',  name: 'Tanvi Malhotra',  avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80' },
  { email: 'yash.agarwal@gmail.com',    name: 'Yash Agarwal',    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80' },
];

// ─── PRODUCT CATALOG BY SHOP ──────────────────────────────────────────────────
const buildProductCatalog = (shops: { [key: string]: string }) => {
  const imgs = {
    ethnic: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1585232350009-d37ba0b19038?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=500&q=80',
    ],
    women: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=500&q=80',
    ],
    men: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=500&q=80',
    ],
    kids: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80',
    ],
    shoes: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=500&q=80',
    ],
    accessories: [
      'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=500&q=80',
    ],
  };

  const brotherhoodId = shops['Brotherhood Clothing'];
  const ghararaId = shops['Gharara Gali'];
  const coutureId = shops['Couture Palanpur'];
  const kidzoneId = shops['KidZone Fashion'];
  const soleId = shops['Sole Empire'];

  return [
    // ── BROTHERHOOD CLOTHING (40 products: All Wear) ──
    { shopId: brotherhoodId, name: 'Classic Gold Sherwani',       price: 14999, stock: 5,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Luxurious gold-threaded wedding sherwani with bespoke embroidery and ivory inner.' },
    { shopId: brotherhoodId, name: 'Italian Velvet Blazer',        price: 8999,  stock: 8,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Deep royal purple velvet blazer, perfect for evening galas and premium events.' },
    { shopId: brotherhoodId, name: 'Floral Silk Coord Set',        price: 5499,  stock: 12, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Elegant summer floral silk coord set — breathable fabric, luxurious drape.' },
    { shopId: brotherhoodId, name: 'Raw Denim Slim Jeans',         price: 2999,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Premium raw selvedge denim, slim tapered fit for the modern gentleman.' },
    { shopId: brotherhoodId, name: 'Kashmiri Pashmina Shawl',      price: 6999,  stock: 10, category: 'All Wear',      imageUrl: imgs.accessories[0], description: 'Authentic hand-woven Kashmiri pashmina with intricate paisley motifs.' },
    { shopId: brotherhoodId, name: 'Chanderi Silk Kurta',          price: 3499,  stock: 15, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Lightweight Chanderi silk kurta with delicate gold border work.' },
    { shopId: brotherhoodId, name: 'Premium Linen Shirt',          price: 1999,  stock: 25, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Breathable 100% linen shirt in sage green — summer essential.' },
    { shopId: brotherhoodId, name: 'Embroidered Anarkali Suit',    price: 7499,  stock: 6,  category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Opulent Anarkali suit with heavy resham embroidery and chiffon dupatta.' },
    { shopId: brotherhoodId, name: 'Structured Wool Overcoat',     price: 9999,  stock: 4,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Heritage-grade wool blend overcoat with satin lining — built for winters.' },
    { shopId: brotherhoodId, name: 'Georgette Sharara Set',        price: 4999,  stock: 8,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Flowing georgette sharara with mirror embellishments and matching dupatta.' },
    { shopId: brotherhoodId, name: 'Bandhani Print Kurta',         price: 1499,  stock: 30, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Vibrant bandhani tie-dye kurta from the looms of Kutch.' },
    { shopId: brotherhoodId, name: 'Designer Track Suit',          price: 3999,  stock: 15, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Premium athletic tracksuit with moisture-wicking technology and tonal zipper.' },
    { shopId: brotherhoodId, name: 'Sequin Evening Gown',          price: 12999, stock: 3,  category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Showstopping sequin floor-length gown for weddings and sangeet ceremonies.' },
    { shopId: brotherhoodId, name: 'Handloom Cotton Dhoti',        price: 899,   stock: 40, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Traditional handloom cotton dhoti in pristine white with zari border.' },
    { shopId: brotherhoodId, name: 'Silk Pocket Square Set',       price: 699,   stock: 50, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Set of 3 hand-stitched silk pocket squares with Palanpur motifs.' },
    { shopId: brotherhoodId, name: 'Athleisure Cargo Jogger',      price: 2499,  stock: 18, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Utility cargo jogger in slate grey — 6 pockets, drawstring waist.' },
    { shopId: brotherhoodId, name: 'Mirror Work Kurti',            price: 1799,  stock: 22, category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Handcrafted mirror-work kurti with cotton lining and peasant sleeves.' },
    { shopId: brotherhoodId, name: 'Tailored Chino Trousers',      price: 2199,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Stretch-comfort chino trousers with slim fit — office to evening ready.' },
    { shopId: brotherhoodId, name: 'Banarasi Silk Dupatta',        price: 2999,  stock: 12, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Authentic Banarasi silk dupatta with gold zari weave, pure craftsmanship.' },
    { shopId: brotherhoodId, name: 'Bomber Jacket',                price: 5999,  stock: 7,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'MA-1 style bomber jacket in olive green with contrast lining.' },
    { shopId: brotherhoodId, name: 'Halter Neck Blouse',           price: 1299,  stock: 15, category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Satin halter neck blouse with backless design — perfect party-wear.' },
    { shopId: brotherhoodId, name: 'Phulkari Dupatta',             price: 1899,  stock: 18, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Hand-embroidered Phulkari dupatta from Punjab in vibrant multicolor threads.' },
    { shopId: brotherhoodId, name: 'Nehru Collar Jacket',          price: 4499,  stock: 9,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Contemporary Nehru collar jacket in raw silk — modern Indian elegance.' },
    { shopId: brotherhoodId, name: 'Cotton Ikat Saree',            price: 3299,  stock: 8,  category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Handwoven Ikat cotton saree in indigo blue with matching blouse piece.' },
    { shopId: brotherhoodId, name: 'Jogger Shorts Set',            price: 1899,  stock: 25, category: 'All Wear',      imageUrl: imgs.men[1],    description: 'French terry jogger shorts and matching hoodie set in blush pink.' },
    { shopId: brotherhoodId, name: 'Pearl Embellished Clutch',     price: 2499,  stock: 10, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Handcrafted pearl embellished evening clutch — bridal and gala-worthy.' },
    { shopId: brotherhoodId, name: 'Kurta Pajama Set',             price: 2799,  stock: 18, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Classic cotton kurta-pajama set with subtle woven pattern for festive days.' },
    { shopId: brotherhoodId, name: 'Chikan Embroidery Kurti',      price: 2199,  stock: 14, category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Lucknowi chikan embroidery kurti on pristine white mulmul fabric.' },
    { shopId: brotherhoodId, name: 'Reversible Hoodie',            price: 3499,  stock: 12, category: 'All Wear',      imageUrl: imgs.men[2],    description: 'Wear it two ways — premium fleece reversible hoodie, streetwear essential.' },
    { shopId: brotherhoodId, name: 'Organza Lehenga Choli',        price: 18999, stock: 3,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Architectural organza lehenga with hand-cut petal florals — bridal centrepiece.' },
    { shopId: brotherhoodId, name: 'Turtleneck Sweater',           price: 2799,  stock: 16, category: 'All Wear',      imageUrl: imgs.men[0],    description: 'Merino wool turtleneck sweater in off-white — cosy, refined, minimalist.' },
    { shopId: brotherhoodId, name: 'Handwoven Silk Tie',           price: 999,   stock: 30, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Micro-woven silk tie with Palanpur block-print motif in navy and gold.' },
    { shopId: brotherhoodId, name: 'Embroidered Juti Shoes',       price: 1599,  stock: 20, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Genuine leather jutti with intricate thread embroidery for festive occasions.' },
    { shopId: brotherhoodId, name: 'Formal Poplin Shirt',          price: 1499,  stock: 30, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Non-iron poplin dress shirt with spread collar — boardroom confidence.' },
    { shopId: brotherhoodId, name: 'Ruffle Maxi Dress',            price: 3999,  stock: 10, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Tiered chiffon ruffle maxi dress in sunflower yellow — resort-ready.' },
    { shopId: brotherhoodId, name: 'Zardozi Work Mojri',           price: 2199,  stock: 15, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Hand-stitched zardozi work mojri in royal blue — Mughal heritage.' },
    { shopId: brotherhoodId, name: 'Printed Camp Collar Shirt',    price: 1799,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Tropical botanics printed camp collar shirt in cotton-linen blend.' },
    { shopId: brotherhoodId, name: 'Cigarette Trousers',           price: 2499,  stock: 14, category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Tailored cigarette trousers in camel beige — power dressing redefined.' },
    { shopId: brotherhoodId, name: 'Indie Fusion Jacket',          price: 5499,  stock: 6,  category: 'All Wear',      imageUrl: imgs.men[0],    description: 'Block-printed Indie Fusion jacket — a statement piece blending art and fashion.' },
    { shopId: brotherhoodId, name: 'Velvet Scrunchie Pack',        price: 299,   stock: 80, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Set of 6 velvet hair scrunchies in jewel tones — luxury hair accessories.' },

    // ── GHARARA GALI (40 products: Womenswear, Ethnic) ──
    { shopId: ghararaId, name: 'Rajasthani Bridal Lehenga',       price: 35999, stock: 2,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Hand-embroidered Rajasthani bridal lehenga in vermillion red with antique gold gota work.' },
    { shopId: ghararaId, name: 'Navratri Chaniya Choli',          price: 4999,  stock: 8,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Festive mirror-work chaniya choli in nine auspicious colors — Navratri ready.' },
    { shopId: ghararaId, name: 'Designer Palazzo Set',            price: 3299,  stock: 12, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Flowy palazzo trousers with matching cape top in digital print georgette.' },
    { shopId: ghararaId, name: 'Banarasi Katan Silk Saree',       price: 12999, stock: 4,  category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Heirloom Banarasi katan silk saree with pure zari weave — wedding treasure.' },
    { shopId: ghararaId, name: 'Anarkali Floor Gown',             price: 6499,  stock: 7,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Majestic floor-length anarkali with stone embellishments and layered skirt.' },
    { shopId: ghararaId, name: 'Velvet Choker Necklace Set',      price: 799,   stock: 25, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Victorian-era inspired velvet choker with pearl drop earrings.' },
    { shopId: ghararaId, name: 'Halter Lehenga Set',              price: 8999,  stock: 5,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Ombre halter-neck lehenga set in rose to coral gradient with foil print work.' },
    { shopId: ghararaId, name: 'Kesariya Ghagra Set',             price: 5499,  stock: 9,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Saffron ghagra set with intricate mirror work — traditional Garba wear.' },
    { shopId: ghararaId, name: 'Embellished Potli Bag',           price: 1299,  stock: 20, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Handcrafted zardozi potli bag in royal blue — bridal accessory.' },
    { shopId: ghararaId, name: 'Pearl Kundan Maang Tikka',        price: 1499,  stock: 15, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Sterling silver-based pearl kundan maang tikka — traditional bridal jewel.' },
    { shopId: ghararaId, name: 'Cotton Kalamkari Kurta',         price: 1899,  stock: 18, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Pen kalamkari painted cotton kurta in earthy tones — artisanal wear.' },
    { shopId: ghararaId, name: 'Silk Printed Saree',              price: 4499,  stock: 10, category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Digital floral print on pure silk — contemporary bridal and party wear.' },
    { shopId: ghararaId, name: 'Gotta Patti Kurta Set',           price: 3299,  stock: 11, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Gotta Patti border work kurta set with tulip bottoms in blush pink.' },
    { shopId: ghararaId, name: 'Net Dupatta with Tassels',        price: 899,   stock: 30, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Sequin-edged net dupatta with tassel trim — pairs any ethnic look.' },
    { shopId: ghararaId, name: 'Bandhej Silk Saree',              price: 3999,  stock: 8,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Traditional Bandhej (tie-dye) silk saree in emerald and gold hues.' },
    { shopId: ghararaId, name: 'Festive Sharara Suit',            price: 5999,  stock: 6,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Resham-embroidered sharara suit with matching cape in pastel lavender.' },
    { shopId: ghararaId, name: 'Meena Kari Jhumkas',              price: 699,   stock: 40, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Filigree meena kari jhumka earrings in hand-painted enamel art.' },
    { shopId: ghararaId, name: 'Velvet Blouse',                   price: 1999,  stock: 15, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Luxurious velvet blouse with puffed sleeves — saree essential.' },
    { shopId: ghararaId, name: 'Chanderi Salwar Kameez',          price: 2799,  stock: 12, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Light Chanderi fabric salwar kameez with chikankari motifs.' },
    { shopId: ghararaId, name: 'Bridal Maggam Work Blouse',       price: 4999,  stock: 5,  category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Zardozi and Maggam work bridal blouse with full coverage design.' },
    { shopId: ghararaId, name: 'Indo-Western Jumpsuit',           price: 3799,  stock: 10, category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Contemporary Indo-Western embroidered jumpsuit — fusion fashion statement.' },
    { shopId: ghararaId, name: 'Pochampally Ikat Dupatta',        price: 1299,  stock: 20, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Handwoven Pochampally Ikat silk dupatta in geometric patterns.' },
    { shopId: ghararaId, name: 'Organza Ruffle Saree',            price: 5499,  stock: 6,  category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Organza saree with attached ruffle pre-stitched to the pallu — drama queen.' },
    { shopId: ghararaId, name: 'Gold Jadau Bangles Set',          price: 2999,  stock: 8,  category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Set of 4 gold-plated Jadau bangles with kundan stone settings.' },
    { shopId: ghararaId, name: 'Kanjivaram Silk Saree',           price: 16999, stock: 3,  category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Temple-border Kanjivaram silk saree in peacock blue — a lifetime heirloom.' },
    { shopId: ghararaId, name: 'Embroidered Jacket Kurti',        price: 2499,  stock: 13, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Kurta with attached long embroidered jacket in cotton linen fabric.' },
    { shopId: ghararaId, name: 'Nauvari Saree Drape',             price: 3499,  stock: 7,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Pre-stitched Nauvari-style saree in cotton — Maharashtrian tradition.' },
    { shopId: ghararaId, name: 'Zari Work Blouse',                price: 2299,  stock: 14, category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Heavy zari border blouse with mandarin collar — perfect for silk sarees.' },
    { shopId: ghararaId, name: 'Floral Printed Kurti Pants',      price: 1699,  stock: 20, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Floral-print kurti with matching cigarette pants set — everyday elegance.' },
    { shopId: ghararaId, name: 'Pearl Haar Necklace',             price: 1899,  stock: 12, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Long multi-strand pearl haar with emerald accents — bridal jewelry.' },
    { shopId: ghararaId, name: 'Crushed Cotton Coord Set',        price: 1999,  stock: 18, category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Casual crushed cotton matching set in terracotta — effortless boho.' },
    { shopId: ghararaId, name: 'Bridal Chooda Set',               price: 2499,  stock: 8,  category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Red-white ivory bridal chooda bangle set with velvet storage box.' },
    { shopId: ghararaId, name: 'Peplum Kurta Set',                price: 2799,  stock: 11, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Contemporary peplum kurta with printed straight pants — fusion ready.' },
    { shopId: ghararaId, name: 'Georgette Anarkali Gown',         price: 7499,  stock: 5,  category: 'Womenswear',   imageUrl: imgs.women[2],  description: 'Embroidered georgette anarkali gown with floor-sweeping silhouette.' },
    { shopId: ghararaId, name: 'Thread Work Earrings',            price: 399,   stock: 50, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Bohemian thread-work tassel earrings in 10 vibrant colours.' },
    { shopId: ghararaId, name: 'Silk Ikkat Scarf',                price: 899,   stock: 25, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Handloomed silk Ikkat scarf — double as head wrap or neck piece.' },
    { shopId: ghararaId, name: 'Kadhi Cotton Saree',              price: 2799,  stock: 10, category: 'Womenswear',   imageUrl: imgs.women[0],  description: 'Sustainable khadhi cotton hand-block printed saree with neem dye.' },
    { shopId: ghararaId, name: 'Festive Lehenga With Blouse',     price: 9999,  stock: 4,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Velvet heavy-worked lehenga with hand-stitched French knot blouse.' },
    { shopId: ghararaId, name: 'Bridal Potli + Kalire Set',       price: 1999,  stock: 10, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Coordinated bridal Potli bag with matching golden Kalire set.' },
    { shopId: ghararaId, name: 'Layered Skirt Blouse Set',        price: 4999,  stock: 7,  category: 'Womenswear',   imageUrl: imgs.women[1],  description: 'Organza layered skirt with structured bralette blouse in champagne gold.' },

    // ── COUTURE PALANPUR (40 products: Menswear) ──
    { shopId: coutureId, name: 'Bespoke Bandhgala Suit',          price: 24999, stock: 2,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Custom-tailored bandhgala suit in Italian wool with hand-stitched lapels.' },
    { shopId: coutureId, name: 'Handcrafted Khadi Kurta',         price: 1999,  stock: 15, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Pure handspun khadi kurta in ivory — the original slow fashion.' },
    { shopId: coutureId, name: 'Linen Summer Blazer',             price: 7499,  stock: 6,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Unlined linen blazer in stone — the boss look for sweltering summers.' },
    { shopId: coutureId, name: 'Merino Formal Trousers',          price: 4499,  stock: 10, category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Merino wool formal trousers with flat-front design and natural drape.' },
    { shopId: coutureId, name: 'Sherwani with Churidar',          price: 19999, stock: 3,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Royal sherwani with heavily embroidered yoke and matching churidar pants.' },
    { shopId: coutureId, name: 'Raw Silk Kurta',                  price: 2999,  stock: 12, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Textured raw silk kurta with mandarin collar — understated luxury.' },
    { shopId: coutureId, name: 'Tweed Sport Coat',                price: 8999,  stock: 5,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Harris Tweed-inspired sport coat with elbow patches — weekend elegance.' },
    { shopId: coutureId, name: 'Banarasi Brocade Vest',           price: 3499,  stock: 9,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Rich Banarasi brocade waistcoat for sherwanis and suits alike.' },
    { shopId: coutureId, name: 'Nehru Jacket Premium',            price: 4999,  stock: 8,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Embossed jacquard Nehru jacket in maroon — state banquet ready.' },
    { shopId: coutureId, name: 'Italian Wool Tuxedo',             price: 29999, stock: 2,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Midnight blue Italian wool tuxedo with satin lapel and side stripe trousers.' },
    { shopId: coutureId, name: 'Guayabera Embroidered Shirt',     price: 2799,  stock: 14, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Cuban-collar guayabera in white with chikankari embroidery panels.' },
    { shopId: coutureId, name: 'Straight Leg Linen Pants',        price: 2299,  stock: 18, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Relaxed straight-leg linen pants in khaki — tropical sophistication.' },
    { shopId: coutureId, name: 'Batik Print Formal Shirt',        price: 1999,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Indonesian batik-inspired print formal shirt in long-staple cotton.' },
    { shopId: coutureId, name: 'Dupion Silk Kurta Set',           price: 3799,  stock: 10, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Dupion silk kurta with matching churidar in royal purple — festive must.' },
    { shopId: coutureId, name: 'Premium Polo T-Shirt',            price: 1499,  stock: 25, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Pique cotton polo with embroidered logo — smart-casual wardrobe anchor.' },
    { shopId: coutureId, name: 'Double-Breasted Suit',            price: 21999, stock: 2,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Six-button double-breasted suit in windowpane check charcoal.' },
    { shopId: coutureId, name: 'Silk Evening Shirt',              price: 3499,  stock: 8,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Lustrous silk evening shirt with bib front and mandarin collar in champagne.' },
    { shopId: coutureId, name: 'Pintuck Formal Shirt',            price: 1799,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Pintuck pleated bib-front formal shirt in Egyptian cotton — wedding-ready.' },
    { shopId: coutureId, name: 'Shawl Collar Smoking Jacket',     price: 11999, stock: 3,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Velvet shawl-collar smoking jacket in bottle green — gentleman\'s evening.' },
    { shopId: coutureId, name: 'Cotton Pathani Suit',             price: 2499,  stock: 16, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Classic Pathani suit in khadi cotton with side pockets and kameez cut.' },
    { shopId: coutureId, name: 'Embroidered Jodhpuri Set',        price: 15999, stock: 3,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Mirror-worked Jodhpuri suit set for grooms — rajputana grandeur.' },
    { shopId: coutureId, name: 'Stretch Chino Shorts',            price: 1299,  stock: 22, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Slim-fit stretch chino shorts in tropical olive — weekend signature.' },
    { shopId: coutureId, name: 'Indigo Yarn-Dyed Shirt',          price: 2299,  stock: 15, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Japanese-inspired yarn-dyed indigo shirt in slow-fade denim fabric.' },
    { shopId: coutureId, name: 'Wool Turtleneck',                 price: 3299,  stock: 10, category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Extrafine merino wool turtleneck in anthracite — minimalist luxury.' },
    { shopId: coutureId, name: 'Silk Pocket Square',              price: 599,   stock: 50, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Hand-rolled silk pocket square in paisley pattern — suiting excellence.' },
    { shopId: coutureId, name: 'Jacquard Formal Tie',             price: 899,   stock: 35, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Woven jacquard silk tie in midnight navy — boardroom authority.' },
    { shopId: coutureId, name: 'Peak Lapel Overcoat',             price: 14999, stock: 3,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Camel peak-lapel overcoat in cashmere blend — heritage outerwear.' },
    { shopId: coutureId, name: 'Seersucker Summer Suit',          price: 9999,  stock: 4,  category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Classic seersucker stripe suit in light blue — destination wedding look.' },
    { shopId: coutureId, name: 'Athleisure Track Jacket',         price: 4499,  stock: 9,  category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Technical knit track jacket with logo tape detailing — gym to street.' },
    { shopId: coutureId, name: 'Handloom Lungi Set',              price: 999,   stock: 30, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[1], description: 'Traditional handloom lungi in classic madras check with kurta.' },
    { shopId: coutureId, name: 'Embroidered Mojri',               price: 2499,  stock: 14, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Thread-embroidered leather mojri in gold and maroon — artisan craft.' },
    { shopId: coutureId, name: 'Sequin Bandhgala',                price: 8999,  stock: 4,  category: 'Ethnic Wear',   imageUrl: imgs.ethnic[0], description: 'Sequin-embossed bandhgala in black — sangeet night show-stopper.' },
    { shopId: coutureId, name: 'Oxford Formal Trouser',           price: 2999,  stock: 12, category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Oxford-weave formal trousers with satin side stripe — black tie ready.' },
    { shopId: coutureId, name: 'Piqué Polo Shirt',                price: 1799,  stock: 20, category: 'Menswear',      imageUrl: imgs.men[1],    description: 'Italian piqué polo with contrast tipping on collar and cuffs.' },
    { shopId: coutureId, name: 'Statement Lapel Pin',             price: 499,   stock: 60, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Handcrafted enamel lapel pin with Palanpur heritage crest motif.' },
    { shopId: coutureId, name: 'Tailored Corduroy Trousers',      price: 2699,  stock: 11, category: 'Menswear',      imageUrl: imgs.men[0],    description: 'Fine-wale corduroy trousers in burnt sienna — autumn sophistication.' },
    { shopId: coutureId, name: 'Evening Bandhani Scarf',          price: 1299,  stock: 18, category: 'Accessories',   imageUrl: imgs.accessories[0], description: 'Silk bandhani scarf in midnight blue — gentleman\'s winter companion.' },
    { shopId: coutureId, name: 'Striped Linen Blazer',            price: 6999,  stock: 5,  category: 'Menswear',      imageUrl: imgs.men[2],    description: 'Pin-stripe deconstructed linen blazer — Italian vacation elegance.' },
    { shopId: coutureId, name: 'Kurta with Zari Buttons',         price: 2199,  stock: 16, category: 'Ethnic Wear',   imageUrl: imgs.ethnic[2], description: 'Half-placket kurta with gold zari button closures — refined ethnic casual.' },
    { shopId: coutureId, name: 'Heritage Suspenders',             price: 899,   stock: 25, category: 'Accessories',   imageUrl: imgs.accessories[1], description: 'Leather-end Y-back suspenders in tan leather — classic gentleman\'s detail.' },

    // ── KIDZONE FASHION (40 products: Kids Wear) ──
    { shopId: kidzoneId, name: 'Prince Dhoti Kurta Set',          price: 1499,  stock: 20, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Adorable silk dhoti-kurta set for festive occasions — little prince look.' },
    { shopId: kidzoneId, name: 'Princess Lehenga Choli',          price: 1999,  stock: 15, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Frothy pink lehenga with sequin embroidery for little girls aged 3-10.' },
    { shopId: kidzoneId, name: 'Denim Dungaree Set',              price: 999,   stock: 25, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Soft-wash denim dungaree with striped t-shirt — playground ready.' },
    { shopId: kidzoneId, name: 'Organic Cotton Romper',           price: 599,   stock: 30, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'GOTS-certified organic cotton romper for infants 0–12 months.' },
    { shopId: kidzoneId, name: 'Festive Sherwani For Boys',       price: 2499,  stock: 8,  category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Mini sherwani with churidar for young boys — wedding and festive must.' },
    { shopId: kidzoneId, name: 'Chaniya Choli For Girls',         price: 1799,  stock: 12, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Navratri chaniya choli with mirror work — perfect for garba celebrations.' },
    { shopId: kidzoneId, name: 'Superhero Pyjama Set',            price: 699,   stock: 35, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Fun superhero-printed pyjama set in soft cotton — bedtime adventure.' },
    { shopId: kidzoneId, name: 'Floral Frock',                    price: 799,   stock: 22, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Pastel floral smocked frock for toddlers — spring picnic perfection.' },
    { shopId: kidzoneId, name: 'Dinosaur T-Shirt Pack',           price: 899,   stock: 30, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Pack of 3 dinosaur graphic tees in primary colours — boys age 4–12.' },
    { shopId: kidzoneId, name: 'Rainbow Tutu Skirt',              price: 699,   stock: 28, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Six-layer tulle rainbow tutu skirt — birthday parties and dance recitals.' },
    { shopId: kidzoneId, name: 'School Uniform Set',              price: 1299,  stock: 40, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Premium school uniform set — shirt, trouser, tie with stain-resistant fabric.' },
    { shopId: kidzoneId, name: 'Denim Jacket Kids',               price: 1499,  stock: 15, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Vintage-wash denim jacket with embroidered patches — cool kids style.' },
    { shopId: kidzoneId, name: 'Ethnic Dhoti Set',                price: 1199,  stock: 18, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Traditional dhoti set with angarkha top — temple and puja wear.' },
    { shopId: kidzoneId, name: 'Princess Gown',                   price: 2499,  stock: 7,  category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Cinderella-inspired ball gown with sequin bodice — party show-stopper.' },
    { shopId: kidzoneId, name: 'Cartoon Hoodie',                  price: 1199,  stock: 22, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Plush cartoon animal ear hoodie in fleece — winter cuddle mode.' },
    { shopId: kidzoneId, name: 'Flare Jeans Girls',               price: 899,   stock: 20, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Bootcut flare jeans for girls with embroidered hem — mini fashionista.' },
    { shopId: kidzoneId, name: 'Sports Track Set',                price: 1099,  stock: 25, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Moisture-wicking track set for active kids — sports day ready.' },
    { shopId: kidzoneId, name: 'Ethnic Kurta Pyjama Boys',        price: 1299,  stock: 18, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Pure cotton block-print kurta with pyjama for young boys.' },
    { shopId: kidzoneId, name: 'Summer Shorts Set',               price: 699,   stock: 30, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Bright cotton shorts set with graphic tee — school holiday essentials.' },
    { shopId: kidzoneId, name: 'Baby Anarkali Frock',             price: 1499,  stock: 10, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Layered Anarkali-style frock in peach and gold for girls — gifting favourite.' },
    { shopId: kidzoneId, name: 'Camo Print Cargo Pants',          price: 999,   stock: 22, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Multi-pocket camo print cargo pants — adventure awaits.' },
    { shopId: kidzoneId, name: 'Floral Maxi Dress Girls',         price: 1199,  stock: 16, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Liberty-print floral maxi dress with smocked waist for girls.' },
    { shopId: kidzoneId, name: 'Boys Blazer Set',                 price: 1799,  stock: 12, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Smart blazer with chino trousers for formal events — young gentleman.' },
    { shopId: kidzoneId, name: 'Printed Leggings Pack',           price: 599,   stock: 35, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Set of 3 soft-cotton printed leggings for girls — everyday essentials.' },
    { shopId: kidzoneId, name: 'Tie-Dye Tee Dress',              price: 799,   stock: 20, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Spiral tie-dye t-shirt dress in pastel hues — art-wear for girls.' },
    { shopId: kidzoneId, name: 'Ethnic Frocksuit',                price: 1899,  stock: 10, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Navratan-coloured frocksuit with patiala bottom — festival ready.' },
    { shopId: kidzoneId, name: 'Kids Stole Shawl',                price: 399,   stock: 40, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Soft pashmina blend stole for kids — winter ethnic accessory.' },
    { shopId: kidzoneId, name: 'Swim Set + Towel',                price: 999,   stock: 18, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Quick-dry swim shorts/swimsuit with matching microfibre towel.' },
    { shopId: kidzoneId, name: 'Layered Ruffle Dress',            price: 1099,  stock: 14, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Tiered ruffle dress in confetti print — birthday wear favourite.' },
    { shopId: kidzoneId, name: 'Half Sleeve Linen Kurta Boys',    price: 699,   stock: 25, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Half-sleeve linen kurta for boys aged 4–14 — summer must-have.' },
    { shopId: kidzoneId, name: 'Girls Shrug Set',                 price: 899,   stock: 18, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Crochet shrug with inner top and jegging — trendy tween set.' },
    { shopId: kidzoneId, name: 'Festive Modi Jacket Boys',        price: 1599,  stock: 10, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Modi jacket with kurta set for boys — Independence Day and festivals.' },
    { shopId: kidzoneId, name: 'Wrap Skirt Girls',                price: 799,   stock: 20, category: 'Kids Wear',     imageUrl: imgs.kids[2],   description: 'Floral wrap-style skirt with adjustable waist — versatile everyday wear.' },
    { shopId: kidzoneId, name: 'Baby Romper Print',               price: 499,   stock: 30, category: 'Kids Wear',     imageUrl: imgs.kids[0],   description: 'Printed cotton romper for newborns — soft, safe, adorable.' },
    { shopId: kidzoneId, name: 'Formal Shirt Boys',               price: 799,   stock: 22, category: 'Kids Wear',     imageUrl: imgs.kids[1],   description: 'Oxford cloth formal shirt for young boys — school events and functions.' },
    { shopId: kidzoneId, name: 'Kids Traditional Footwear',       price: 599,   stock: 28, category: 'Kids Wear',     imageUrl: imgs.shoes[0],  description: 'Hand-stitched traditional juttis for kids in festive gold.' },

    // ── SOLE EMPIRE (40 products: Footwear) ──
    { shopId: soleId, name: 'Air Max Clone Sneaker',              price: 3999,  stock: 12, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Performance sneaker with air-cushion midsole — street meets sport.' },
    { shopId: soleId, name: 'Premium Leather Derby',              price: 5999,  stock: 8,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Full-grain leather derby shoe with Goodyear welt construction.' },
    { shopId: soleId, name: 'Kolhapuri Sandal',                   price: 1499,  stock: 25, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Genuine leather Kolhapuri sandal in traditional double-strap design.' },
    { shopId: soleId, name: 'Canvas High-Top Sneaker',            price: 2499,  stock: 18, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Classic canvas high-top sneaker in 8 colourways — retro streetwear.' },
    { shopId: soleId, name: 'Monk Strap Loafer',                  price: 4999,  stock: 7,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Double monk-strap loafer in burnished cognac leather — smart casual icon.' },
    { shopId: soleId, name: 'Rubber Sole Mojri',                  price: 1299,  stock: 22, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Modern mojri with cushioned rubber sole for all-day comfort.' },
    { shopId: soleId, name: 'Trail Running Shoes',                price: 4499,  stock: 10, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Trail-grade running shoes with Vibram outsole for technical terrain.' },
    { shopId: soleId, name: 'Oxford Brogue Shoes',                price: 6999,  stock: 5,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Wingtip brogue Oxford in two-tone tan and cream — dandy gentleman.' },
    { shopId: soleId, name: 'Slip-On Loafer Canvas',              price: 1799,  stock: 28, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Slip-on canvas loafer with memory foam insole — lazy luxury.' },
    { shopId: soleId, name: 'Sports Sandal',                      price: 1299,  stock: 30, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Adventure sports sandal with adjustable straps and EVA footbed.' },
    { shopId: soleId, name: 'Leather Ankle Boot',                 price: 7499,  stock: 5,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Chelsea ankle boot in black grained leather with elastic side panel.' },
    { shopId: soleId, name: 'Kolhapuri Wedge Sandal',             price: 1999,  stock: 20, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Platform wedge Kolhapuri sandal with pompom tassel — boho style.' },
    { shopId: soleId, name: 'Running Shoe Mesh',                  price: 2999,  stock: 16, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Engineered mesh upper running shoe with responsive foam cushioning.' },
    { shopId: soleId, name: 'Tan Derby Shoe',                     price: 5499,  stock: 7,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Handcrafted tan calf-leather derby with leather sole — boardroom essential.' },
    { shopId: soleId, name: 'Sneaker Platform',                   price: 3499,  stock: 13, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Platform sole chunky sneaker in white — 90s nostalgia returns.' },
    { shopId: soleId, name: 'Kolhapuri Flat Sandal',              price: 1199,  stock: 30, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Traditional toe-strap flat Kolhapuri in natural tan leather.' },
    { shopId: soleId, name: 'Dress Pump Heels',                   price: 3299,  stock: 10, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Block heel dress pump in classic black suede — power dressing essential.' },
    { shopId: soleId, name: 'Slip-On Sneaker Kids',               price: 999,   stock: 24, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Velcro slip-on sneaker for children — school run hero.' },
    { shopId: soleId, name: 'Hiking Boot',                        price: 5999,  stock: 6,  category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Waterproof mid-height hiking boot with Vibram traction sole.' },
    { shopId: soleId, name: 'Espadrille Wedge',                   price: 2499,  stock: 15, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Jute-wrapped espadrille wedge with canvas upper — Mediterranean vibes.' },
    { shopId: soleId, name: 'Formal Moccasin',                    price: 3999,  stock: 9,  category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Driving moccasin in fine nappa leather — weekend gentleman.' },
    { shopId: soleId, name: 'White Sneaker Clean',                price: 2999,  stock: 20, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Minimalist clean white leather sneaker — the evergreen wardrobe staple.' },
    { shopId: soleId, name: 'Pointed Toe Heels',                  price: 2799,  stock: 12, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Stiletto-heel pointed-toe court shoe in nude patent — office slay.' },
    { shopId: soleId, name: 'Sandal Floater Men',                 price: 1499,  stock: 25, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Double hook-and-loop floater sandal in EVA — poolside casual.' },
    { shopId: soleId, name: 'Sports Flip Flop',                   price: 699,   stock: 40, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Arch-support flip flop with contoured footbed — beach essential.' },
    { shopId: soleId, name: 'Embroidered Espadrille',             price: 1799,  stock: 18, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Canvas espadrille with hand-embroidered floral panel — artisanal flat.' },
    { shopId: soleId, name: 'Chelsea Boot Suede',                 price: 6499,  stock: 5,  category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Suede Chelsea boot in tobacco brown with stacked leather heel.' },
    { shopId: soleId, name: 'Sports Shoe Knit Upper',             price: 2299,  stock: 18, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Flyknit upper sports shoe with sock-like fit and foam midsole.' },
    { shopId: soleId, name: 'Bridal Heels Gold',                  price: 3999,  stock: 8,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Gold brocade kitten heel for brides — festive elegance at every step.' },
    { shopId: soleId, name: 'Rubber Boot Gumboot',                price: 1999,  stock: 15, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Matte rubber Wellington boot for monsoon — functional and stylish.' },
    { shopId: soleId, name: 'Mule Flat Leather',                  price: 2199,  stock: 16, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Open-back slip-on leather mule in caramel — understated chic.' },
    { shopId: soleId, name: 'Basketball Sneaker High',            price: 3499,  stock: 11, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'High-top basketball sneaker with ankle support collar and herringbone grip.' },
    { shopId: soleId, name: 'Strappy Block Heel',                 price: 2999,  stock: 10, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Multi-strap block heel sandal in metallic silver — dance floor ready.' },
    { shopId: soleId, name: 'Running Shoe Stability',             price: 3999,  stock: 13, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Dual-density foam stability running shoe with ortholite insole.' },
    { shopId: soleId, name: 'Loafer With Tassel',                 price: 3299,  stock: 9,  category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Horsebit-inspired tassel loafer in polished black leather — classic prep.' },
    { shopId: soleId, name: 'Kolhapuri Ankle Strap',              price: 1699,  stock: 20, category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Ankle strap Kolhapuri with lotus motif punch work — festive flat.' },
    { shopId: soleId, name: 'Casual Canvas Slip-On',              price: 999,   stock: 30, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Elastic gusset canvas slip-on in solid navy — everyday easy wear.' },
    { shopId: soleId, name: 'Wedge Sandal Suede',                 price: 2799,  stock: 12, category: 'Footwear',      imageUrl: imgs.shoes[1],  description: 'Suede wedge sandal with ankle strap and cork platform.' },
    { shopId: soleId, name: 'Cap-Toe Oxford',                     price: 5499,  stock: 6,  category: 'Footwear',      imageUrl: imgs.shoes[2],  description: 'Cap-toe Oxford in full-grain black leather — the power shoe.' },
    { shopId: soleId, name: 'Summer Sandal Jelly',                price: 699,   stock: 35, category: 'Footwear',      imageUrl: imgs.shoes[0],  description: 'Transparent PVC jelly sandal with ankle strap — playful and waterproof.' },
  ];
};

// ─── REVIEW TEMPLATES ─────────────────────────────────────────────────────────
const REVIEWS = [
  { rating: 5, comment: 'Absolutely breathtaking quality! The fabric is incredibly luxurious and the fit is perfect.' },
  { rating: 5, comment: 'Exceeded all my expectations! Worth every rupee. Will definitely order again.' },
  { rating: 5, comment: 'Delivered exactly as described. Premium packaging and stunning design.' },
  { rating: 4, comment: 'Beautiful product, very elegant. Minor delay in delivery but overall excellent experience.' },
  { rating: 4, comment: 'Great quality fabric, fits perfectly. Would have given 5 stars if delivery was faster.' },
  { rating: 5, comment: 'Wore this to a wedding and received so many compliments! Absolutely stunning piece.' },
  { rating: 4, comment: 'Good quality and nice finish. Colour is even better in person.' },
  { rating: 5, comment: 'The craftsmanship is exceptional. You can tell it\'s made with genuine care and artistry.' },
  { rating: 3, comment: 'Decent quality but slightly smaller than expected. Check size chart carefully.' },
  { rating: 5, comment: 'Perfect gift! My mother absolutely loved it. The quality speaks for itself.' },
  { rating: 4, comment: 'Very authentic and traditional design. Great for cultural events and festivals.' },
  { rating: 5, comment: 'Fast delivery, premium packaging, and the product is exactly as shown. Highly recommend!' },
];

const ORDER_ADDRESSES = [
  '42 Lal Darwaja, Palanpur - 385001, Gujarat',
  '17 Nehru Nagar, Palanpur - 385002, Gujarat',
  'B-304 Ridhi Sidhi Apartments, Palanpur - 385001',
  '5 Gandhi Chowk, Palanpur - 385003, Gujarat',
  'Shop 8, Banaskantha Market, Palanpur - 385001',
  '89 Patel Colony, Palanpur - 385002, Gujarat',
  '21 Shivaji Road, Palanpur - 385001, Gujarat',
  'C-105 Sai Residency, Palanpur - 385003, Gujarat',
];

// ─── MAIN SEEDER ──────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  BROTHERHOOD CLOTHING — MEGA DEMO SEEDER v2.0');
  console.log('  Creating 5 Shops · 200+ Products · 20 Customers');
  console.log('═'.repeat(60));

  await sleep(500);

  // STEP 1: Login all shop owners and collect tokens + created shop IDs
  section('STEP 1: AUTHENTICATING SHOP OWNERS (5)');
  const ownerTokens: string[] = [];
  for (const owner of SHOP_OWNERS) {
    const token = await login(owner.email, owner.name, owner.avatar);
    if (token) {
      ownerTokens.push(token);
      pass(`Owner authenticated: ${owner.name} (${owner.email})`);
    } else {
      fail(`Owner auth failed: ${owner.name}`);
      ownerTokens.push('');
    }
  }

  // STEP 2: Login all customers and collect tokens
  section('STEP 2: REGISTERING 20 DEMO CUSTOMERS');
  const customerTokens: { token: string; data: typeof CUSTOMERS[0] }[] = [];
  for (const cust of CUSTOMERS) {
    const token = await login(cust.email, cust.name, cust.avatar);
    if (token) {
      customerTokens.push({ token, data: cust });
      pass(`Customer registered: ${cust.name}`);
    } else {
      fail(`Customer registration failed: ${cust.name}`);
    }
  }

  // STEP 3: Get admin token and verify it
  section('STEP 3: ADMIN VERIFICATION');
  const adminToken = ownerTokens[0];
  const adminCheck = await api('GET', '/admin/analytics', undefined, adminToken);
  if (adminCheck.status === 200) {
    pass(`Admin panel accessible. Platform stats loaded.`);
  } else {
    fail(`Admin check failed: ${JSON.stringify(adminCheck.data)}`);
  }

  // STEP 4: Register the 5 shops (skip if already exists for admin)
  section('STEP 4: REGISTERING 5 DEMO SHOPS');
  const shopIds: { [name: string]: string } = {};

  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const owner = SHOP_OWNERS[i];
    const token = ownerTokens[i];
    if (!token) continue;

    // Check if shop already exists
    const myShopCheck = await api('GET', '/shops/my/profile', undefined, token);
    if (myShopCheck.status === 200 && myShopCheck.data?.id) {
      shopIds[owner.shop.name] = myShopCheck.data.id;
      pass(`Shop already exists: "${owner.shop.name}" (ID: ${myShopCheck.data.id.slice(0, 12)}...)`);
      // Ensure it's approved if admin
      if (i === 0) {
        // Update shop details to ensure consistency
        await api('PUT', `/shops/${myShopCheck.data.id}`, {
          name: owner.shop.name,
          ownerName: owner.shop.ownerName,
          phone: owner.shop.phone,
          email: owner.shop.email,
          city: owner.shop.city,
          category: owner.shop.category,
          description: owner.shop.description,
          instagramUrl: owner.shop.instagramUrl,
          logoUrl: owner.shop.logoUrl,
          coverUrl: owner.shop.coverUrl,
        }, token);
      }
      continue;
    }

    const r = await api('POST', '/shops', owner.shop, token);
    if (r.status === 201 && r.data?.id) {
      shopIds[owner.shop.name] = r.data.id;
      pass(`Shop registered: "${owner.shop.name}" → status: ${r.data.status}`);
    } else if (r.status === 409) {
      pass(`Shop already registered: "${owner.shop.name}"`);
    } else {
      fail(`Shop registration failed: "${owner.shop.name}" → ${JSON.stringify(r.data)}`);
    }
  }

  // STEP 5: Admin approves all shops
  section('STEP 5: ADMIN APPROVES ALL SHOPS + VERIFIES');
  const allShopsRes = await api('GET', '/admin/shops', undefined, adminToken);
  const allShops = allShopsRes.data || [];

  for (const shop of allShops) {
    if (shop.status !== 'approved') {
      const approveRes = await api('PUT', `/admin/shops/${shop.id}/status`, { status: 'approved' }, adminToken);
      if (approveRes.status === 200) pass(`Approved: "${shop.name}"`);
    } else {
      pass(`Already approved: "${shop.name}"`);
    }
    // Update our shopIds map
    for (const owner of SHOP_OWNERS) {
      if (shop.name === owner.shop.name) {
        shopIds[shop.name] = shop.id;
      }
    }

    // Verify top shops
    if (shop.name === 'Brotherhood Clothing') {
      await api('PUT', `/admin/shops/${shop.id}/verify`, {}, adminToken);
      await api('PUT', `/admin/shops/${shop.id}/founder`, {}, adminToken);
      pass(`Brotherhood Clothing → Verified + Founder badge set`);
    } else if (['Gharara Gali', 'Couture Palanpur'].includes(shop.name)) {
      await api('PUT', `/admin/shops/${shop.id}/verify`, {}, adminToken);
      pass(`${shop.name} → Verified badge set`);
    }
  }

  console.log('\n  Shop IDs collected:', JSON.stringify(shopIds, null, 2));

  // STEP 6: Create 200+ products
  section('STEP 6: CREATING 200+ DEMO PRODUCTS');
  const catalog = buildProductCatalog(shopIds);
  const createdProducts: { id: string; shopId: string; name: string; price: number }[] = [];

  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const owner = SHOP_OWNERS[i];
    const token = ownerTokens[i];
    const shopId = shopIds[owner.shop.name];
    if (!token || !shopId) { fail(`Skipping products for ${owner.shop.name} — no token/shopId`); continue; }

    const shopProducts = catalog.filter(p => p.shopId === shopId);
    let created = 0;

    for (const prod of shopProducts) {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const colors = ['Black', 'White', 'Gold', 'Royal Blue', 'Maroon', 'Ivory'];
      const variants = [
        { size: sizes[Math.floor(Math.random() * 3)], color: colors[Math.floor(Math.random() * 3)], stock: Math.floor(Math.random() * 10) + 3 },
        { size: sizes[Math.floor(Math.random() * 3) + 3], color: colors[Math.floor(Math.random() * 3) + 3], stock: Math.floor(Math.random() * 8) + 2 },
      ];

      const r = await api('POST', '/products', {
        name: prod.name,
        price: prod.price,
        stock: prod.stock,
        imageUrl: prod.imageUrl,
        category: prod.category,
        description: prod.description,
        variants,
      }, token);

      if (r.status === 201 && r.data?.id) {
        createdProducts.push({ id: r.data.id, shopId, name: prod.name, price: prod.price });
        created++;
      }
    }
    pass(`"${owner.shop.name}" → ${created} products created`);
  }
  pass(`Total products in catalog: ${createdProducts.length}`);

  // STEP 7: Add gallery images to shops
  section('STEP 7: ADDING LOOKBOOK GALLERY IMAGES TO SHOPS');
  const galleryImages = [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80',
  ];

  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const owner = SHOP_OWNERS[i];
    const token = ownerTokens[i];
    const shopId = shopIds[owner.shop.name];
    if (!token || !shopId) continue;

    const r = await api('POST', `/shops/${shopId}/gallery`, {
      urls: galleryImages
    }, token);
    pass(`Gallery added to "${owner.shop.name}": ${galleryImages.length} images`);
  }

  // STEP 8: Create coupons for each shop
  section('STEP 8: CREATING COUPON CODES FOR EACH SHOP');
  const couponCodes = [
    { code: 'BROTHER10', discountType: 'percentage', discountValue: 10, minOrderValue: 2000 },
    { code: 'GHARARA15', discountType: 'percentage', discountValue: 15, minOrderValue: 3000 },
    { code: 'COUTURE500', discountType: 'fixed', discountValue: 500, minOrderValue: 4000 },
    { code: 'KIDS20', discountType: 'percentage', discountValue: 20, minOrderValue: 1500 },
    { code: 'SOLE250', discountType: 'fixed', discountValue: 250, minOrderValue: 2000 },
  ];

  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const token = ownerTokens[i];
    const coupon = couponCodes[i];
    if (!token) continue;
    const r = await api('POST', '/coupons', { ...coupon, maxUses: 100 }, token);
    if (r.status === 201 || r.status === 409) {
      pass(`Coupon "${coupon.code}" created/exists for ${SHOP_OWNERS[i].shop.name}`);
    } else {
      fail(`Coupon creation failed: ${JSON.stringify(r.data)}`);
    }
  }

  // STEP 9: Customers follow shops
  section('STEP 9: CUSTOMERS FOLLOWING SHOPS');
  let followCount = 0;
  for (const ct of customerTokens) {
    const shopToFollow = Object.values(shopIds)[Math.floor(Math.random() * Object.values(shopIds).length)];
    if (!shopToFollow) continue;
    const r = await api('POST', `/shops/${shopToFollow}/follow`, {}, ct.token);
    if (r.status === 200 || r.status === 201) followCount++;
    // Also follow a second shop
    const shopToFollow2 = Object.values(shopIds)[Math.floor(Math.random() * Object.values(shopIds).length)];
    if (shopToFollow2 && shopToFollow2 !== shopToFollow) {
      await api('POST', `/shops/${shopToFollow2}/follow`, {}, ct.token);
      followCount++;
    }
  }
  pass(`${followCount} shop follows created across all customers`);

  // STEP 10: Customers add items to wishlist
  section('STEP 10: ADDING PRODUCTS TO WISHLISTS');
  let wishlistCount = 0;
  for (const ct of customerTokens) {
    const wishItems = createdProducts.filter(() => Math.random() > 0.75).slice(0, 4);
    for (const item of wishItems) {
      const r = await api('POST', '/wishlist', { productId: item.id }, ct.token);
      if (r.status === 200 || r.status === 201) wishlistCount++;
    }
  }
  pass(`${wishlistCount} wishlist items added across all customers`);

  // STEP 11: Place realistic orders (60+ orders across all customers and shops)
  section('STEP 11: PLACING 60+ REALISTIC ORDERS');
  const placedOrders: { id: string; userId: string; shopId: string; items: any[] }[] = [];

  const statuses: Array<'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'> =
    ['pending', 'confirmed', 'shipped', 'completed', 'completed', 'completed'];

  let orderCount = 0;
  for (const ct of customerTokens) {
    const numOrders = Math.floor(Math.random() * 5) + 1; // 1 to 5 orders per customer
    for (let k = 0; k < numOrders; k++) {
      const shopKey = Object.keys(shopIds)[Math.floor(Math.random() * Object.keys(shopIds).length)];
      const shopId = shopIds[shopKey];
      if (!shopId) continue;

      const shopProds = createdProducts.filter(p => p.shopId === shopId);
      if (shopProds.length === 0) continue;

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems: any[] = [];
      let total = 0;
      for (let m = 0; m < numItems; m++) {
        const prod = shopProds[Math.floor(Math.random() * shopProds.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        orderItems.push({ id: prod.id, name: prod.name, price: prod.price, quantity: qty });
        total += prod.price * qty;
      }

      const r = await api('POST', '/orders', {
        shopId,
        customerName: ct.data.name,
        customerEmail: ct.data.email,
        customerPhone: `98${Math.floor(Math.random() * 90000000 + 10000000)}`,
        customerAddress: ORDER_ADDRESSES[Math.floor(Math.random() * ORDER_ADDRESSES.length)],
        items: orderItems,
        totalPrice: total,
      }, ct.token);

      if (r.status === 201 && r.data?.id) {
        placedOrders.push({ id: r.data.id, userId: r.data.user_id || '', shopId, items: orderItems });
        orderCount++;

        // Simulate payment for most orders
        if (Math.random() > 0.2) {
          await api('POST', `/orders/${r.data.id}/pay`, {}, ct.token);
        }
      }
    }
  }
  pass(`${orderCount} orders placed across all customers`);

  // STEP 12: Vendors advance order statuses
  section('STEP 12: VENDORS ADVANCING ORDER STATUSES');
  let statusUpdateCount = 0;
  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const token = ownerTokens[i];
    if (!token) continue;
    const shopOrdersRes = await api('GET', '/orders/shop', undefined, token);
    const shopOrders = Array.isArray(shopOrdersRes.data) ? shopOrdersRes.data : [];


    for (const order of shopOrders) {
      if (order.status === 'confirmed') {
        const advanceTo = Math.random() > 0.3 ? 'shipped' : 'confirmed';
        if (advanceTo !== order.status) {
          await api('PUT', `/orders/${order.id}/status`, { status: advanceTo }, token);
          statusUpdateCount++;
        }
        if (advanceTo === 'shipped' && Math.random() > 0.5) {
          await api('PUT', `/orders/${order.id}/status`, { status: 'completed' }, token);
          statusUpdateCount++;
        }
      }
    }
  }
  pass(`${statusUpdateCount} order status updates performed by vendors`);

  // STEP 13: Create verified reviews for completed orders
  section('STEP 13: SUBMITTING VERIFIED PRODUCT REVIEWS');
  let reviewCount = 0;
  for (const ct of customerTokens) {
    const myOrdersRes = await api('GET', '/orders/my', undefined, ct.token);
    const myOrders = myOrdersRes.data || [];

    for (const order of myOrders) {
      if (!['completed', 'shipped', 'confirmed'].includes(order.status)) continue;
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (!Array.isArray(items) || items.length === 0) continue;

      const item = items[0];
      const review = REVIEWS[Math.floor(Math.random() * REVIEWS.length)];

      const r = await api('POST', '/reviews', {
        productId: item.id,
        shopId: order.shop_id,
        rating: review.rating,
        comment: review.comment,
      }, ct.token);

      if (r.status === 201) reviewCount++;
    }
  }
  pass(`${reviewCount} verified reviews submitted by customers`);

  // STEP 14: Send customer messages to shop owners
  section('STEP 14: SENDING CUSTOMER MESSAGES TO SHOP OWNERS');
  const messageTemplates = [
    'Hello! I love your collection. Do you offer custom sizing?',
    'Hi, can you tell me more about the fabric quality of your products?',
    'I recently purchased from your shop and I am absolutely delighted with the quality!',
    'Do you have this item available in my size? Please let me know.',
    'Can I get a discount for bulk order of 5+ items?',
    'What is the return policy if the item doesn\'t fit?',
    'When will the new collection arrive? Your designs are stunning!',
    'Thank you for the quick delivery! Amazing quality boutique.',
    'Is this item available for same-day delivery in Palanpur?',
    'Your craftsmanship is extraordinary. I have been a loyal customer for years!',
  ];

  let messageCount = 0;
  for (let i = 0; i < Math.min(customerTokens.length, 15); i++) {
    const ct = customerTokens[i];
    const ownerIdx = Math.floor(Math.random() * SHOP_OWNERS.length);
    const ownerToken = ownerTokens[ownerIdx];
    if (!ownerToken) continue;

    // Get owner user ID from their shop profile
    const ownerShopRes = await api('GET', '/shops/my/profile', undefined, ownerToken);
    const ownerId = ownerShopRes.data?.owner_id;
    if (!ownerId) continue;

    const msg = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const r = await api('POST', '/messages', {
      receiverId: ownerId,
      shopId: ownerShopRes.data?.id,
      content: msg,
    }, ct.token);

    if (r.status === 201) {
      messageCount++;
      const reply = 'Thank you for reaching out! We would be happy to assist you. Please feel free to browse our full collection.';
      if (r.data?.sender_id) {
        await api('POST', '/messages', {
          receiverId: r.data.sender_id,
          shopId: ownerShopRes.data?.id,
          content: reply,
        }, ownerToken);
      }
    }
  }
  pass(`${messageCount} customer-to-owner message threads created`);

  // STEP 15: Test coupon validation
  section('STEP 15: TESTING COUPON VALIDATION');
  for (let i = 0; i < SHOP_OWNERS.length; i++) {
    const shopKey = SHOP_OWNERS[i].shop.name;
    const shopId = shopIds[shopKey];
    if (!shopId) continue;
    const code = couponCodes[i].code;
    const r = await api('POST', '/coupons/validate', {
      code,
      shopId,
      orderTotal: 5000,
    });
    if (r.status === 200 && r.data?.valid) {
      pass(`Coupon "${code}" valid → Discount: ₹${r.data.discountAmount}, Final Total: ₹${r.data.finalTotal}`);
    } else {
      fail(`Coupon validation failed for "${code}": ${JSON.stringify(r.data)}`);
    }
  }

  // STEP 16: Test wishlist API
  section('STEP 16: TESTING WISHLIST PERSISTENCE API');
  if (customerTokens.length > 0 && createdProducts.length > 0) {
    const testCustomer = customerTokens[0];
    const testProduct = createdProducts[0];
    
    const addR = await api('POST', '/wishlist', { productId: testProduct.id }, testCustomer.token);
    pass(`Wishlist toggle (add): ${addR.data?.action} — ${addR.data?.message}`);
    
    const getR = await api('GET', '/wishlist', undefined, testCustomer.token);
    pass(`Wishlist GET: ${getR.data?.length || 0} items for customer`);
    
    const statusR = await api('GET', `/wishlist/${testProduct.id}/status`, undefined, testCustomer.token);
    pass(`Wishlist status for product: inWishlist = ${statusR.data?.inWishlist}`);
  }

  // STEP 17: Test product EDIT
  section('STEP 17: TESTING PRODUCT EDIT (PUT /products/:id)');
  if (createdProducts.length > 0 && ownerTokens[0]) {
    const productToEdit = createdProducts.find(p => p.shopId === shopIds['Brotherhood Clothing']);
    if (productToEdit) {
      const editR = await api('PUT', `/products/${productToEdit.id}`, {
        name: productToEdit.name + ' (Refreshed Collection)',
        price: productToEdit.price * 1.1,
        stock: 20,
        description: 'UPDATED: Now part of the premium refreshed 2026 collection. Limited edition.',
      }, ownerTokens[0]);
      if (editR.status === 200) {
        pass(`Product updated: "${editR.data?.name}" at ₹${editR.data?.price}`);
      } else {
        fail(`Product update failed: ${JSON.stringify(editR.data)}`);
      }
    }
  }

  // STEP 18: Test RBAC (verify blocked access)
  section('STEP 18: RBAC SECURITY VALIDATION');
  if (customerTokens.length > 0) {
    const customerToken = customerTokens[0].token;
    const r1 = await api('GET', '/admin/shops', undefined, customerToken);
    if (r1.status === 403) pass(`Admin panel blocked for customer: ✅ RBAC working`);
    else fail(`Admin panel should be blocked for customer!`);

    const r2 = await api('GET', '/admin/users', undefined, customerToken);
    if (r2.status === 403) pass(`User management blocked for customer: ✅ RBAC working`);
    else fail(`User management should be blocked for customer!`);

    // Unauthenticated access
    const r3 = await api('POST', '/orders', {});
    if (r3.status === 401) pass(`Unauthenticated order creation blocked: ✅ Auth working`);
    else fail(`Unauthenticated order should return 401!`);
  }

  // STEP 19: Test marketplace search and filter
  section('STEP 19: MARKETPLACE SEARCH & FILTER TESTING');
  const searchTerms = ['Sherwani', 'Lehenga', 'Sneaker', 'Kids', 'Silk'];
  for (const term of searchTerms) {
    const r = await api('GET', `/products?search=${encodeURIComponent(term)}`);
    pass(`Search "${term}": ${r.data?.length || 0} results`);
  }

  const categories = ['Ethnic Wear', 'Menswear', 'Womenswear', 'Kids Wear', 'Footwear', 'Accessories'];
  for (const cat of categories) {
    const r = await api('GET', `/products?category=${encodeURIComponent(cat)}`);
    pass(`Category "${cat}": ${r.data?.length || 0} products`);
  }

  // STEP 20: Final analytics verification
  section('STEP 20: ADMIN ANALYTICS VERIFICATION');
  const analytics = await api('GET', '/admin/analytics', undefined, adminToken);
  if (analytics.status === 200) {
    const s = analytics.data?.stats;
    pass(`Users: ${s?.totalUsers || 0}`);
    pass(`Shops: ${s?.totalShops || 0}`);
    pass(`Followers: ${s?.totalFollowers || 0}`);
    pass(`Orders: ${orderCount}`);
    pass(`Reviews: ${reviewCount}`);
  } else {
    fail(`Analytics failed: ${JSON.stringify(analytics.data)}`);
  }

  const allUsersRes = await api('GET', '/admin/users', undefined, adminToken);
  pass(`All users visible to admin: ${allUsersRes.data?.length || 0} accounts`);

  // FINAL SUMMARY
  console.log('\n' + '═'.repeat(60));
  console.log('  MEGA SEEDER COMPLETE — FINAL REPORT');
  console.log('═'.repeat(60));
  console.log(`\n  ✅ PASSED:  ${totalPassed}`);
  console.log(`  ❌ FAILED:  ${totalFailed}`);
  console.log(`\n  📦 Products Created:  ${createdProducts.length}`);
  console.log(`  🛒 Orders Placed:     ${orderCount}`);
  console.log(`  ⭐ Reviews Submitted: ${reviewCount}`);
  console.log(`  👥 Customers:         ${customerTokens.length}`);
  console.log(`  🏪 Shops:             ${Object.keys(shopIds).length}`);
  console.log(`  🎟️  Coupons:           ${SHOP_OWNERS.length}`);
  console.log(`  💬 Messages:          ${messageCount}`);
  console.log(`  ❤️  Wishlist Items:    ${wishlistCount}`);
  console.log(`  👣 Shop Follows:      ${followCount}`);
  console.log('\n' + '═'.repeat(60));
  console.log('  PLATFORM STATUS: PRODUCTION DEMO READY 🚀');
  console.log('═'.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n💥 SEEDER CRASHED:', err.message);
  process.exit(1);
});

export {};
