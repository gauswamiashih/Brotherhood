import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const useMock = !connectionString || connectionString.trim() === '';

if (useMock) {
  console.log('--------------------------------------------------');
  console.log('WARNING: DATABASE_URL is not set.');
  console.log('ACTIVATING startup sandbox database simulation.');
  console.log('E-Commerce orders, products, and checkout are fully active.');
  console.log('--------------------------------------------------');
}

export const pool = !useMock 
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' || connectionString?.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });
}

// ==========================================
// IN-MEMORY DATABASE STATE (FOR SANDBOX FALLBACK)
// ==========================================
interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'suspended' | 'blocked';
  is_verified: boolean;
  created_at: Date;
}

interface MockShop {
  id: string;
  owner_id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  description: string;
  instagram_url: string;
  logo_url: string;
  cover_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  is_verified: boolean;
  is_founder: boolean;
  created_at: Date;
}

interface MockGallery {
  id: string;
  shop_id: string;
  image_url: string;
  is_pinned: boolean;
  created_at: Date;
}

interface MockProduct {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  description: string;
  created_at: Date;
}

interface MockOrder {
  id: string;
  user_id: string | null;
  shop_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: any[]; // Array of { id, name, price, quantity }
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  status_history?: any[];
  created_at: Date;
}

interface MockReview {
  id: string;
  user_id: string;
  shop_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: Date;
}

interface MockMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  shop_id: string | null;
  content: string;
  is_read: boolean;
  created_at: Date;
}

interface MockFollower {
  id: string;
  user_id: string;
  shop_id: string;
  created_at: Date;
}

interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

const mockCategories = [
  { id: 'c1', name: 'All Wear', slug: 'all-wear' },
  { id: 'c2', name: 'Menswear', slug: 'menswear' },
  { id: 'c3', name: 'Womenswear', slug: 'womenswear' },
  { id: 'c4', name: 'Kids Wear', slug: 'kids-wear' },
  { id: 'c5', name: 'Ethnic Wear', slug: 'ethnic-wear' },
  { id: 'c6', name: 'Footwear', slug: 'footwear' },
  { id: 'c7', name: 'Accessories', slug: 'accessories' }
];

const mockUsers: MockUser[] = [
  {
    id: 'u1',
    email: 'gauswamiashish760@gmail.com',
    name: 'Ashish Gauswami',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'admin',
    status: 'active',
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 'u2',
    email: 'hitesh@gmail.com',
    name: 'Hitesh Kumar',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'owner',
    status: 'active',
    is_verified: true,
    created_at: new Date()
  }
];

const mockShops: MockShop[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    owner_id: 'u1',
    name: 'Brotherhood Clothing',
    owner_name: 'Ashish Gauswami',
    phone: '9664592743',
    email: 'gauswamiashish760@gmail.com',
    city: 'Palanpur',
    category: 'All Wear',
    description: 'Palanpurs ultimate fashion destination. Offering a curated collection of premium designer wear, luxury casuals, and modern streetwear for men, women, and kids.',
    instagram_url: 'https://www.instagram.com/gauswami_8_07_18',
    logo_url: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=300&h=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
    status: 'approved',
    is_verified: true,
    is_founder: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
  },
  {
    id: 's2',
    owner_id: 'u2',
    name: 'Couture Palanpur',
    owner_name: 'Hitesh Kumar',
    phone: '9876543210',
    email: 'hitesh@gmail.com',
    city: 'Palanpur',
    category: 'Menswear',
    description: 'Bespoke suits, premium sherwanis, and casual linen shirts crafted to perfection by local artisans.',
    instagram_url: 'https://instagram.com',
    logo_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&h=150&q=80',
    cover_url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&h=400&q=80',
    status: 'approved',
    is_verified: true,
    is_founder: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  }
];

const mockGallery: MockGallery[] = [
  { id: 'g1', shop_id: '00000000-0000-0000-0000-000000000002', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&h=600&q=80', is_pinned: true, created_at: new Date() },
  { id: 'g2', shop_id: '00000000-0000-0000-0000-000000000002', image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&h=600&q=80', is_pinned: true, created_at: new Date() },
  { id: 'g3', shop_id: '00000000-0000-0000-0000-000000000002', image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=600&q=80', is_pinned: true, created_at: new Date() }
];

const mockProducts: MockProduct[] = [
  {
    id: 'p1',
    shop_id: '00000000-0000-0000-0000-000000000002',
    name: 'Classic Gold Sherwani',
    price: 14999.00,
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
    category: 'Ethnic Wear',
    description: 'Luxurious gold-threaded wedding sherwani featuring bespoke embroidery.',
    created_at: new Date()
  },
  {
    id: 'p2',
    shop_id: '00000000-0000-0000-0000-000000000002',
    name: 'Italian Velvet Blazer',
    price: 8999.00,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
    category: 'Menswear',
    description: 'Deep royal purple velvet blazer tailored for evening galas.',
    created_at: new Date()
  },
  {
    id: 'p3',
    shop_id: '00000000-0000-0000-0000-000000000002',
    name: 'Floral Silk Coord Set',
    price: 5499.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80',
    category: 'Womenswear',
    description: 'Elegant summer silk floral set, breathable and highly fashionable.',
    created_at: new Date()
  },
  {
    id: 'p4',
    shop_id: 's2',
    name: 'Handcrafted Khadi Kurta',
    price: 1999.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=500&q=80',
    category: 'Menswear',
    description: 'Pure Palanpur khadi cotton kurta in ivory white.',
    created_at: new Date()
  }
];

const mockOrders: MockOrder[] = [
  {
    id: 'o1',
    user_id: 'u1',
    shop_id: '00000000-0000-0000-0000-000000000002',
    customer_name: 'Ashish Gauswami',
    customer_email: 'gauswamiashish760@gmail.com',
    customer_phone: '9664592743',
    customer_address: 'Palanpur, Gujarat',
    items: [
      { id: 'p2', name: 'Italian Velvet Blazer', price: 8999.00, quantity: 1 }
    ],
    total_price: 8999.00,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: 'o2',
    user_id: 'u2',
    shop_id: '00000000-0000-0000-0000-000000000002',
    customer_name: 'Hitesh Kumar',
    customer_email: 'hitesh@gmail.com',
    customer_phone: '9876543210',
    customer_address: 'Palanpur Hub',
    items: [
      { id: 'p3', name: 'Floral Silk Coord Set', price: 5499.00, quantity: 2 }
    ],
    total_price: 10998.00,
    status: 'pending',
    created_at: new Date()
  }
];

const mockFollowers: MockFollower[] = [
  { id: 'f1', user_id: 'u1', shop_id: 's2', created_at: new Date() }
];

const mockNotifications: MockNotification[] = [
  { id: 'n1', user_id: 'u1', title: 'System Active', message: 'Welcome to Brotherhood Clothing Admin panel.', is_read: false, created_at: new Date() }
];

const mockActivityLogs: any[] = [];
const mockAdminLogs: any[] = [];

const mockReviews: MockReview[] = [
  {
    id: 'r1',
    user_id: 'u1',
    shop_id: '00000000-0000-0000-0000-000000000002',
    product_id: 'p2',
    rating: 5,
    comment: 'The Italian Velvet Blazer has absolute premium build quality! Highly recommended.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

const mockMessages: MockMessage[] = [
  {
    id: 'm1',
    sender_id: 'u1',
    receiver_id: 'u2',
    shop_id: 's2',
    content: 'Hi! Is the Handcrafted Khadi Kurta available in custom sizes?',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60)
  }
];

// ==========================================
// SIMULATE QUERY PARSING & RUNNING
// ==========================================
const executeSimulatedQuery = (text: string, params: any[] = []): any => {
  const normalizedText = text.replace(/\s+/g, ' ').trim().toLowerCase();

  // Categories query
  if (normalizedText.includes('select * from shop_categories')) {
    return { rows: mockCategories };
  }

  // Users query
  if (normalizedText.includes('select * from users where email =')) {
    const email = params[0].toLowerCase();
    const foundUser = mockUsers.find(u => u.email === email);
    return { rows: foundUser ? [foundUser] : [] };
  }

  // Insert user
  if (normalizedText.includes('insert into users')) {
    const newUser: MockUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      email: params[0],
      name: params[1],
      avatar_url: params[2],
      role: params[3] || 'customer',
      status: params[4] || 'active',
      is_verified: params[5] || false,
      created_at: new Date()
    };
    mockUsers.push(newUser);
    return { rows: [newUser] };
  }

  // Update user role
  if (normalizedText.includes('update users set role =') && !normalizedText.includes('name =')) {
    const role = params[0];
    const id = params[1];
    const uIdx = mockUsers.findIndex(u => u.id === id);
    if (uIdx !== -1) {
      mockUsers[uIdx].role = role;
      return { rows: [mockUsers[uIdx]] };
    }
  }

  // Update user status
  if (normalizedText.includes('update users set status =')) {
    const status = params[0];
    const id = params[1];
    const uIdx = mockUsers.findIndex(u => u.id === id);
    if (uIdx !== -1) {
      mockUsers[uIdx].status = status;
      return { rows: [mockUsers[uIdx]] };
    }
  }

  // Update user verification
  if (normalizedText.includes('update users set is_verified =')) {
    const isVerified = params[0] === true || params[0] === 'true' || params[0] === 1;
    const id = params[1];
    const uIdx = mockUsers.findIndex(u => u.id === id);
    if (uIdx !== -1) {
      mockUsers[uIdx].is_verified = isVerified;
      return { rows: [mockUsers[uIdx]] };
    }
  }

  // Update user (generic)
  if (normalizedText.includes('update users set name =')) {
    const name = params[0];
    const avatar = params[1];
    const role = params[2];
    const id = params[3];
    const uIdx = mockUsers.findIndex(u => u.id === id);
    if (uIdx !== -1) {
      mockUsers[uIdx].name = name;
      mockUsers[uIdx].avatar_url = avatar;
      mockUsers[uIdx].role = role;
      return { rows: [mockUsers[uIdx]] };
    }
  }

  // Get approved shops
  if (normalizedText.includes('from shops s') && normalizedText.includes("s.status = 'approved'")) {
    let resultShops = mockShops.filter(s => s.status === 'approved');
    
    // Search filter
    if (normalizedText.includes('ilike')) {
      const searchVal = params[0]?.replace(/%/g, '')?.toLowerCase();
      if (searchVal) {
        resultShops = resultShops.filter(s => s.name.toLowerCase().includes(searchVal) || s.description.toLowerCase().includes(searchVal));
      }
    }

    // Category filter
    if (normalizedText.includes('category =')) {
      const catVal = params[params.length - 1];
      if (catVal && catVal !== 'All') {
        resultShops = resultShops.filter(s => s.category === catVal);
      }
    }

    const mapped = resultShops.map(s => {
      const fCount = mockFollowers.filter(f => f.shop_id === s.id).length;
      return { ...s, follower_count: fCount };
    });

    if (normalizedText.includes('follower_count desc')) {
      mapped.sort((a, b) => b.follower_count - a.follower_count);
    }
    // Pin founder
    mapped.sort((a, b) => (b.is_founder ? 1 : 0) - (a.is_founder ? 1 : 0));
    return { rows: mapped };
  }

  // Get shop details by ID
  if (normalizedText.includes('from shops s') && normalizedText.includes('s.id = $1')) {
    const shopId = params[0];
    const shop = mockShops.find(s => s.id === shopId);
    if (!shop) return { rows: [] };
    const fCount = mockFollowers.filter(f => f.shop_id === shopId).length;
    return { rows: [{ ...shop, follower_count: fCount }] };
  }

  // Get shop by owner
  if (normalizedText.includes('select * from shops where owner_id =')) {
    const ownerId = params[0];
    const shop = mockShops.find(s => s.owner_id === ownerId);
    return { rows: shop ? [shop] : [] };
  }

  // Register shop
  if (normalizedText.includes('insert into shops')) {
    const newShop: MockShop = {
      id: 's_' + Math.random().toString(36).substr(2, 9),
      owner_id: params[0],
      name: params[1],
      owner_name: params[2],
      phone: params[3],
      email: params[4],
      city: params[5],
      category: params[6],
      description: params[7] || '',
      instagram_url: params[8] || '',
      logo_url: params[9] || 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=300&h=300&q=80',
      cover_url: params[10] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
      status: 'pending',
      is_verified: false,
      is_founder: false,
      created_at: new Date()
    };
    mockShops.push(newShop);
    
    // Update user role to owner
    const uIdx = mockUsers.findIndex(u => u.id === newShop.owner_id);
    if (uIdx !== -1) mockUsers[uIdx].role = 'owner';
    
    return { rows: [newShop] };
  }

  // Update shop details/status
  if (normalizedText.includes('update shops set')) {
    const shopId = params[params.length - 1];
    const sIdx = mockShops.findIndex(s => s.id === shopId);
    if (sIdx !== -1) {
      if (normalizedText.includes('status =')) {
        mockShops[sIdx].status = params[0];
      } else if (normalizedText.includes('is_verified =')) {
        mockShops[sIdx].is_verified = params[0];
      } else if (normalizedText.includes('is_founder =')) {
        mockShops[sIdx].is_founder = params[0];
      } else {
        mockShops[sIdx].name = params[0] || mockShops[sIdx].name;
        mockShops[sIdx].owner_name = params[1] || mockShops[sIdx].owner_name;
        mockShops[sIdx].phone = params[2] || mockShops[sIdx].phone;
        mockShops[sIdx].email = params[3] || mockShops[sIdx].email;
        mockShops[sIdx].city = params[4] || mockShops[sIdx].city;
        mockShops[sIdx].category = params[5] || mockShops[sIdx].category;
        mockShops[sIdx].description = params[6] || mockShops[sIdx].description;
        mockShops[sIdx].instagram_url = params[7] || mockShops[sIdx].instagram_url;
        mockShops[sIdx].logo_url = params[8] || mockShops[sIdx].logo_url;
        mockShops[sIdx].cover_url = params[9] || mockShops[sIdx].cover_url;
      }
      return { rows: [mockShops[sIdx]] };
    }
  }

  // Get gallery items
  if (normalizedText.includes('select * from shop_gallery where shop_id =')) {
    const shopId = params[0];
    const galleryItems = mockGallery.filter(g => g.shop_id === shopId);
    galleryItems.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    return { rows: galleryItems };
  }

  // Add gallery image
  if (normalizedText.includes('insert into shop_gallery')) {
    const newG: MockGallery = {
      id: 'g_' + Math.random().toString(36).substr(2, 9),
      shop_id: params[0],
      image_url: params[1],
      is_pinned: params[2] || false,
      created_at: new Date()
    };
    mockGallery.push(newG);
    return { rows: [newG] };
  }

  // Delete gallery image
  if (normalizedText.includes('delete from shop_gallery')) {
    const id = params[0];
    const shopId = params[1];
    const gIdx = mockGallery.findIndex(g => g.id === id && g.shop_id === shopId);
    if (gIdx !== -1) {
      const removed = mockGallery.splice(gIdx, 1);
      return { rows: removed };
    }
  }

  // Toggle pin gallery image
  if (normalizedText.includes('update shop_gallery set is_pinned =')) {
    const isPinned = params[0];
    const id = params[1];
    const shopId = params[2];
    const gIdx = mockGallery.findIndex(g => g.id === id && g.shop_id === shopId);
    if (gIdx !== -1) {
      mockGallery[gIdx].is_pinned = isPinned;
      return { rows: [mockGallery[gIdx]] };
    }
  }

  // ==========================================
  // E-COMMERCE: PRODUCTS QUERIES
  // ==========================================

  // Select products belonging to a shop or all
  if (normalizedText.includes('from products')) {
    let resultProds = [...mockProducts];

    // Filter by shop
    if (normalizedText.includes('shop_id =')) {
      const shopId = params[0];
      resultProds = resultProds.filter(p => p.shop_id === shopId);
    }

    // Filter by search/category
    const catIdx = normalizedText.indexOf('category =');
    if (catIdx !== -1) {
      const catVal = params[params.length - 1];
      if (catVal && catVal !== 'All') {
        resultProds = resultProds.filter(p => p.category === catVal);
      }
    }

    return { rows: resultProds };
  }

  // Add Product
  if (normalizedText.includes('insert into products')) {
    const newP: MockProduct = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      shop_id: params[0],
      name: params[1],
      price: Number(params[2]),
      stock: Number(params[3] || 10),
      image_url: params[4] || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
      category: params[5] || 'All Wear',
      description: params[6] || '',
      created_at: new Date()
    };
    mockProducts.push(newP);
    return { rows: [newP] };
  }

  // Delete Product
  if (normalizedText.includes('delete from products')) {
    const id = params[0];
    const shopId = params[1];
    const pIdx = mockProducts.findIndex(p => p.id === id && p.shop_id === shopId);
    if (pIdx !== -1) {
      const removed = mockProducts.splice(pIdx, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  // ==========================================
  // E-COMMERCE: ORDERS QUERIES
  // ==========================================

  // Select orders (customer or received by store)
  if (normalizedText.includes('from orders')) {
    let resultOrders = [...mockOrders];

    if (normalizedText.includes('user_id =')) {
      const userId = params[0];
      resultOrders = resultOrders.filter(o => o.user_id === userId);
    } else if (normalizedText.includes('shop_id =')) {
      const shopId = params[0];
      resultOrders = resultOrders.filter(o => o.shop_id === shopId);
    }

    const hydratedOrders = resultOrders.map(o => {
      const shop = mockShops.find(s => s.id === o.shop_id);
      return {
        ...o,
        shop_name: shop ? shop.name : 'Brotherhood Clothing',
        shop_logo: shop ? shop.logo_url : 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=80&h=80&q=80'
      };
    });

    return { rows: hydratedOrders };
  }

  // Place Order
  if (normalizedText.includes('insert into orders')) {
    const newOrder: MockOrder = {
      id: 'o_' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      shop_id: params[1],
      customer_name: params[2],
      customer_email: params[3],
      customer_phone: params[4],
      customer_address: params[5],
      items: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
      total_price: Number(params[7]),
      status: 'pending',
      status_history: [
        { status: 'pending', timestamp: new Date(), notes: 'Order placed by customer.' }
      ],
      created_at: new Date()
    };
    mockOrders.push(newOrder);

    // Alert Notification to shop owner
    const shop = mockShops.find(s => s.id === newOrder.shop_id);
    if (shop) {
      mockNotifications.push({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        user_id: shop.owner_id,
        title: 'New Order Inquiry!',
        message: `Customer ${newOrder.customer_name} placed a new order for ${newOrder.items.length} items. Total: ₹${newOrder.total_price}`,
        is_read: false,
        created_at: new Date()
      });
    }
    return { rows: [newOrder] };
  }

  // Update Order Status
  if (normalizedText.includes('update orders set status =')) {
    const status = params[0];
    const orderId = params[1];
    const oIdx = mockOrders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
      mockOrders[oIdx].status = status;
      
      const prevHistory = mockOrders[oIdx].status_history || [
        { status: 'pending', timestamp: mockOrders[oIdx].created_at, notes: 'Order placed by customer.' }
      ];
      mockOrders[oIdx].status_history = [
        ...prevHistory,
        { status: status, timestamp: new Date(), notes: `Status changed to ${status}.` }
      ];

      // Send alert notification to the customer
      if (mockOrders[oIdx].user_id) {
        mockNotifications.push({
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          user_id: mockOrders[oIdx].user_id!,
          title: `Order Status: ${status.toUpperCase()}`,
          message: `Your order #${orderId.substring(0, 5)} has been updated to "${status}".`,
          is_read: false,
          created_at: new Date()
        });
      }

      return { rows: [mockOrders[oIdx]] };
    }
  }

  // ==========================================
  // FOLLOWERS, LOGS, & ADMIN MODULES
  // ==========================================
  if (normalizedText.includes('select id from followers where user_id =')) {
    const userId = params[0];
    const shopId = params[1];
    const follow = mockFollowers.find(f => f.user_id === userId && f.shop_id === shopId);
    return { rows: follow ? [follow] : [] };
  }
  if (normalizedText.includes('delete from followers')) {
    const userId = params[0];
    const shopId = params[1];
    const fIdx = mockFollowers.findIndex(f => f.user_id === userId && f.shop_id === shopId);
    if (fIdx !== -1) {
      const removed = mockFollowers.splice(fIdx, 1);
      return { rows: removed };
    }
  }
  if (normalizedText.includes('insert into followers')) {
    const newFollow: MockFollower = {
      id: 'f_' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      shop_id: params[1],
      created_at: new Date()
    };
    mockFollowers.push(newFollow);
    return { rows: [newFollow] };
  }
  if (normalizedText.includes('select count(*)::int from followers where shop_id =')) {
    const shopId = params[0];
    const count = mockFollowers.filter(f => f.shop_id === shopId).length;
    return { rows: [{ count }] };
  }
  if (normalizedText.includes('joined users u on f.user_id = u.id') && normalizedText.includes('f.shop_id = $1')) {
    const shopId = params[0];
    const shopFollowers = mockFollowers.filter(f => f.shop_id === shopId);
    const rows = shopFollowers.map(f => {
      const u = mockUsers.find(user => user.id === f.user_id);
      return {
        id: u?.id || 'unknown',
        name: u?.name || 'Customer Profile',
        email: u?.email || 'customer@gmail.com',
        avatar_url: u?.avatar_url || '',
        followed_at: f.created_at
      };
    });
    return { rows };
  }
  if (normalizedText.includes('select * from notifications where user_id =')) {
    const userId = params[0];
    return { rows: mockNotifications.filter(n => n.user_id === userId) };
  }
  if (normalizedText.includes('update notifications set is_read = true')) {
    const id = params[0];
    const userId = params[1];
    const nIdx = mockNotifications.findIndex(n => n.id === id && n.user_id === userId);
    if (nIdx !== -1) mockNotifications[nIdx].is_read = true;
    return { rows: [] };
  }
  if (normalizedText.includes('select count(*)::int from users')) {
    return { rows: [{ count: mockUsers.length }] };
  }
  if (normalizedText.includes('select status, count(*)::int as count from shops')) {
    const counts = { pending: 0, approved: 0, rejected: 0, blocked: 0 };
    mockShops.forEach(s => counts[s.status]++);
    return { rows: Object.entries(counts).map(([status, count]) => ({ status, count })) };
  }
  if (normalizedText.includes('select count(*)::int from followers')) {
    return { rows: [{ count: mockFollowers.length }] };
  }
  if (normalizedText.includes('from shops s join users u on s.owner_id = u.id')) {
    return {
      rows: mockShops.map(s => {
        const u = mockUsers.find(user => user.id === s.owner_id);
        const fCount = mockFollowers.filter(f => f.shop_id === s.id).length;
        return {
          ...s,
          owner_email: u?.email || 'owner@gmail.com',
          owner_account_name: u?.name || 'Owner Profile',
          follower_count: fCount
        };
      })
    };
  }
  if (normalizedText.includes('from users')) {
    return { rows: mockUsers };
  }
  if (normalizedText.includes('from activity_logs')) {
    return { rows: mockActivityLogs };
  }
  if (normalizedText.includes('from admin_logs')) {
    return { rows: mockAdminLogs };
  }
  if (normalizedText.includes('insert into activity_logs')) {
    mockActivityLogs.push({
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      action: params[1],
      details: params[2],
      created_at: new Date()
    });
    return { rows: [] };
  }
  if (normalizedText.includes('insert into admin_logs')) {
    mockAdminLogs.push({
      id: 'al_' + Math.random().toString(36).substr(2, 9),
      admin_id: params[0],
      action: params[1],
      target_id: params[2],
      details: params[3],
      created_at: new Date()
    });
    return { rows: [] };
  }
  if (normalizedText.includes('delete from shops where id =')) {
    const id = params[0];
    const sIdx = mockShops.findIndex(s => s.id === id);
    if (sIdx !== -1) {
      const deleted = mockShops.splice(sIdx, 1);
      const uIdx = mockUsers.findIndex(u => u.id === deleted[0].owner_id);
      if (uIdx !== -1) mockUsers[uIdx].role = 'customer';
      return { rows: deleted };
    }
  }

  // ==========================================
  // PHASE 2: REVIEWS & RATING QUERIES
  // ==========================================
  if (normalizedText.includes('insert into reviews')) {
    const newReview: MockReview = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      user_id: params[0],
      shop_id: params[1],
      product_id: params[2],
      rating: Number(params[3]),
      comment: params[4],
      created_at: new Date()
    };
    mockReviews.push(newReview);
    return { rows: [newReview] };
  }

  if (normalizedText.includes('avg(rating)') && normalizedText.includes('from reviews')) {
    let resReviews = [...mockReviews];
    if (normalizedText.includes('product_id =')) {
      const prodId = params[0];
      resReviews = resReviews.filter(r => r.product_id === prodId);
    } else if (normalizedText.includes('shop_id =')) {
      const shopId = params[0];
      resReviews = resReviews.filter(r => r.shop_id === shopId);
    }
    
    const count = resReviews.length;
    const sum = resReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = count > 0 ? (sum / count).toFixed(1) : '0.0';
    return { rows: [{ avg_rating: avg, review_count: count }] };
  }

  if (normalizedText.includes('select r.*') || (normalizedText.includes('from reviews') && !normalizedText.includes('avg(rating)'))) {
    let resReviews = [...mockReviews];
    if (normalizedText.includes('product_id =')) {
      const prodId = params[0];
      resReviews = resReviews.filter(r => r.product_id === prodId);
    } else if (normalizedText.includes('shop_id =')) {
      const shopId = params[0];
      resReviews = resReviews.filter(r => r.shop_id === shopId);
    }
    
    const rows = resReviews.map(r => {
      const u = mockUsers.find(user => user.id === r.user_id);
      return {
        ...r,
        reviewer_name: u?.name || 'Couture Client',
        reviewer_avatar: u?.avatar_url || ''
      };
    });
    
    rows.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows };
  }

  // ==========================================
  // PHASE 2: CHAT MESSAGING QUERIES
  // ==========================================
  if (normalizedText.includes('insert into messages')) {
    const newMsg: MockMessage = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      sender_id: params[0],
      receiver_id: params[1],
      shop_id: params[2] || null,
      content: params[3],
      is_read: false,
      created_at: new Date()
    };
    mockMessages.push(newMsg);
    return { rows: [newMsg] };
  }

  if (normalizedText.includes('update messages set is_read = true')) {
    const receiver = params[0];
    const sender = params[1];
    mockMessages.forEach(m => {
      if (m.receiver_id === receiver && m.sender_id === sender) {
        m.is_read = true;
      }
    });
    return { rows: [] };
  }

  if (normalizedText.includes('from messages') && normalizedText.includes('sender_id =') && normalizedText.includes('receiver_id =') && !normalizedText.includes('in (select distinct')) {
    const p1 = params[0];
    const p2 = params[1];
    const history = mockMessages.filter(m => 
      (m.sender_id === p1 && m.receiver_id === p2) || 
      (m.sender_id === p2 && m.receiver_id === p1)
    );
    history.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    return { rows: history };
  }

  if (normalizedText.includes('from users u') && normalizedText.includes('in (select distinct case when sender_id =')) {
    const userId = params[0];
    const interlocutors = new Set<string>();
    mockMessages.forEach(m => {
      if (m.sender_id === userId) {
        interlocutors.add(m.receiver_id);
      } else if (m.receiver_id === userId) {
        interlocutors.add(m.sender_id);
      }
    });
    
    const rows = Array.from(interlocutors).map(contactId => {
      const u = mockUsers.find(user => user.id === contactId);
      const chat = mockMessages.filter(m => 
        (m.sender_id === userId && m.receiver_id === contactId) || 
        (m.sender_id === contactId && m.receiver_id === userId)
      );
      chat.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      const lastMsg = chat[0];
      
      const unreadCount = mockMessages.filter(m => 
        m.sender_id === contactId && m.receiver_id === userId && !m.is_read
      ).length;
      
      const shop = mockShops.find(s => s.owner_id === contactId);
      const displayName = shop ? shop.name : (u?.name || 'Customer');
      const displayAvatar = shop ? shop.logo_url : (u?.avatar_url || '');
      
      return {
        id: contactId,
        name: displayName,
        avatar_url: displayAvatar,
        role: u?.role || 'customer',
        last_message: lastMsg ? lastMsg.content : '',
        last_message_time: lastMsg ? lastMsg.created_at : null,
        unread_count: unreadCount
      };
    });
    
    rows.sort((a, b) => {
      const t1 = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
      const t2 = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
      return t2 - t1;
    });
    
    return { rows };
  }

  // Catch-all
  return { rows: [] };
};

export const db = {
  query: async (text: string, params?: any[]) => {
    if (useMock) {
      return executeSimulatedQuery(text, params);
    }
    return pool!.query(text, params);
  },
  getClient: async () => {
    if (useMock) {
      return {
        query: async (text: string, params?: any[]) => executeSimulatedQuery(text, params),
        release: () => {}
      } as any;
    }
    return pool!.connect();
  },
};
