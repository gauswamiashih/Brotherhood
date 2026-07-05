# Brotherhood Clothing
## Palanpur's Premium Fashion Marketplace

Brotherhood Clothing is a luxury startup-ready digital marketplace connecting elite fashion boutiques across Palanpur, Gujarat, India. Designed around a **Luxury Dark theme** with Deep Purple and Gold accents, this marketplace delivers a visual experience combining the layout metrics of Instagram shop statistics, elements of Shopify, and the distribution architecture of a multi-vendor marketplace.

---

## 💎 Design System & Identity
- **Colors**: Rich Obsidian Black, Deep Purple gradients (`#090214`, `#120524`, `#1E0B36`), glowing Purple accents (`#5E17EB`), and Metallic Gold typography/borders (`#D4AF37`, `#F3E5AB`).
- **Aesthetics**: Glassmorphism panel styling, rounded corners, micro-interaction scales, premium spacing, and custom-styled scrolling/loading skeletons.
- **Typography**: Outfit (clean Sans for UI and reading) & Playfair Display (luxurious Serif for header highlights).

---

## 🛠️ Technology Stack
- **Frontend**: React (18.3), Vite, TypeScript, TailwindCSS, Framer Motion (premium animations), Lucide React.
- **Backend**: Node.js, Express, TypeScript, Helmet (security headers), CORS, jsonwebtoken, express-rate-limit.
- **Database**: Supabase PostgreSQL (SQL table configurations, triggers, and indices).
- **Authentication**: Secure Google OAuth ID token verification (with developer sandbox bypass).

---

## 📂 Folder Structure

```text
brotherhood2026/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # Postgres connection pool setup
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts     # Approvals, statistics, verification badges
│   │   │   ├── auth.controller.ts      # Google authentication & JWT generation
│   │   │   ├── follow.controller.ts    # Follow stats & toggling
│   │   │   └── shop.controller.ts      # Shop registration & gallery lookbook logic
│   │   ├── middleware/
│   │   │   └── auth.ts                 # JWT extraction, role filters, founder gating
│   │   ├── routes/
│   │   │   └── api.routes.ts           # Mapped backend routes
│   │   └── server.ts                   # Express server config, rate limit, CORS, Helmet
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                            # Backend local variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx              # Sticky glass header, notifications, search
│   │   │   └── Footer.tsx              # Brand coordinates & footer columns
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Google auth client, sandbox simulate, JWT sync
│   │   ├── pages/
│   │   │   ├── Home.tsx                # Hero section, flagships, categories, testimonials
│   │   │   ├── Marketplace.tsx         # Grid search, categories slider, sort parameters
│   │   │   ├── ShopProfile.tsx         # Circular branding, follow controls, lightbox gallery
│   │   │   ├── RegisterShop.tsx        # Multi-section enrollment portal
│   │   │   ├── OwnerDashboard.tsx      # Lookbook management, pins count, stats grid
│   │   │   ├── AdminDashboard.tsx      # Queue actions, audit feed, user directories
│   │   │   └── Login.tsx               # Auth landing & local developer bypass
│   │   ├── services/
│   │   │   └── api.ts                  # Axios configuration with JWT interceptor
│   │   ├── App.tsx                     # Route mappings
│   │   ├── main.tsx                    # React mounting
│   │   └── index.css                   # Global styles & custom scrollbars
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── .env                            # Client local variables
└── supabase/
    └── schema.sql                      # Database schema, indices, constraints, & seed
```

---

## 🗄️ Database Architecture
The database runs on Supabase PostgreSQL. Below are the key tables defined in [supabase/schema.sql](file:///d:/brotherhood2026/supabase/schema.sql):

1. **`users`**: Authenticated shoppers, shop owners, and administrators.
2. **`shops`**: Boutique profiles containing category, cover banner, description, and status (`pending`, `approved`, `rejected`, `blocked`).
3. **`shop_gallery`**: Boutique lookbook catalog. Contains a trigger constraints function checking and enforcing a maximum of **3 pinned images** per shop profile.
4. **`followers`**: Unique connection table mapping users following shops.
5. **`notifications`**: User alert tracking for approval statuses and follow activities.
6. **`shop_categories`**: Table for system-defined fashion categories (Menswear, Womenswear, Ethnic Wear, etc.).
7. **`shop_settings`**: Preferences for boutiques.
8. **`activity_logs`**: Security tracking for account creations, logins, and registrations.
9. **`admin_logs`**: Auditing trail for admin approvals, verification badge switches, and bans.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file under the `/backend` folder:
```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_jwt_signing_key_secret
GOOGLE_CLIENT_ID=your_google_client_id_from_credentials
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
Create a `.env` file under the `/frontend` folder:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_from_credentials
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL or Supabase account

### Step 1: Clone the repository & Install backend dependencies
```bash
cd backend
npm install
```

### Step 2: Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Run Database Migrations
Copy the SQL content in [supabase/schema.sql](file:///d:/brotherhood2026/supabase/schema.sql) and execute it in your Supabase SQL Editor. This will:
- Set up all tables, foreign keys, triggers, and indices.
- Seed the default categories.
- Pre-register **Ashish Gauswami** (`gauswamiashish760@gmail.com`) as the **Founder Admin** and pre-create the approved, verified, and founder-pinned **"Brotherhood Clothing"** flagship boutique.

### Step 4: Run backend server locally
```bash
cd ../backend
npm run dev
```
*Server will start running on port `5000`.*

### Step 5: Run frontend app locally
```bash
cd ../frontend
npm run dev
```
*Frontend will launch on port `5173`. Open [http://localhost:5173](http://localhost:5173).*

---

## 🔒 Security Practices
- **JWT**: Server verification of headers (`Authorization: Bearer <token>`). Tokens expire in 7 days.
- **Admin Verification Gating**: Custom Express route guards verifying roles + exact founder email check (`gauswamiashish760@gmail.com`).
- **Helmet**: Production-grade HTTP headers to prevent Clickjacking, MIME-type sniffing, and cross-site scripting (XSS).
- **express-rate-limit**: Restricts brute-force hits on API paths (max 200 hits per 15 minutes per IP).
- **Zod Schema Validation**: Request parameter validation on backend controller endpoints.
- **Supabase Integrity**: Cascade deletions, index checks, and strict database triggers.

---

## 📊 API Documentation

### Auth Enpoints
- `POST /api/auth/google`: Exchanges Google credential token for client JWT. If in developer sandbox mode (without key setup), accepts plain email string payload to simulate login.

### Shop Endpoints
- `GET /api/categories`: Returns list of fashion categories.
- `GET /api/shops`: Public. Returns approved boutiques. Sorts: `is_founder DESC` first, then popularity (most followed) or date.
- `GET /api/shops/:id`: Public. Returns details, lookbook gallery list, and follower count.
- `POST /api/shops`: Authenticated. Registers a new pending shop. Automatically upgrades submitter's role to `'owner'`.
- `PUT /api/shops/:id`: Owner Only. Modifies boutique details.
- `POST /api/shops/:id/gallery`: Owner Only. Adds list of image links to portfolio.
- `DELETE /api/shops/:id/gallery/:imageId`: Owner Only. Deletes lookbook image.
- `PUT /api/shops/:id/gallery/:imageId/pin`: Owner Only. Toggles image pin (throws error if > 3 pinned).

### Follow Endpoints
- `POST /api/shops/:id/follow`: Authenticated. Toggles follow state. User cannot follow their own store.
- `GET /api/shops/:id/follow-status`: Checks if user is currently following.
- `GET /api/shops/:id/followers`: Owner/Admin Only. Returns list of followers.

### Admin Endpoints
- `GET /api/admin/shops`: Admin Only. Returns all shops (approved, pending, blocked).
- `PUT /api/admin/shops/:id/status`: Admin Only. Approves, rejects, or blocks store. Downgrades/upgrades roles.
- `PUT /api/admin/shops/:id/verify`: Admin Only. Toggles verified checkmark.
- `PUT /api/admin/shops/:id/founder`: Admin Only. Toggles founder flagship status.
- `DELETE /api/admin/shops/:id`: Admin Only. Deletes shop cascade.
- `GET /api/admin/analytics`: Admin Only. Returns user and follower counts, shop metrics, system activity trails, and admin audit logs.

---

## 🛣️ Future Roadmap
1. **Payments System**: Stripe or Razorpay integration for premium promotions.
2. **Subscription Plans**: Monthly subscription plans for shops to display more images.
3. **Advanced AI Recommendations**: Suggesting shops to buyers based on categories followed.
4. **Push Notifications**: Real-time push alerts on mobile devices.
5. **Mobile Application**: Native React Native / Flutter apps.

---

## 🛡️ License
Licensed under the MIT License.
