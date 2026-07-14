-- Brotherhood Clothing PostgreSQL Database Schema
-- Designed for Supabase PostgreSQL

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create SHOP CATEGORIES Table
CREATE TABLE IF NOT EXISTS shop_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create USERS Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create SHOPS Table
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Palanpur',
    category VARCHAR(100) NOT NULL REFERENCES shop_categories(name) ON UPDATE CASCADE,
    description TEXT,
    instagram_url TEXT,
    logo_url TEXT,
    cover_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_founder BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create SHOP GALLERY Table
CREATE TABLE IF NOT EXISTS shop_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 10,
    image_url TEXT,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5b. Create PRODUCT VARIANTS Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, size, color)
);

-- 6. Create ORDERS Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of {product_id, name, price, quantity}
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create FOLLOWERS Table
CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, shop_id)
);

-- 8. Create NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create SHOP SETTINGS Table
CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID UNIQUE NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    allow_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    theme_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create ACTIVITY LOGS Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create ADMIN LOGS Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_id UUID,
    target_type VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Optimized Queries
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_is_founder ON shops(is_founder);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shop_gallery_shop_id ON shop_gallery(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_shop_id ON followers(shop_id);

-- TRIGGER to Enforce Max 3 Pinned Images per Shop
CREATE OR REPLACE FUNCTION check_pinned_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_pinned = TRUE THEN
        IF (SELECT COUNT(*) FROM shop_gallery WHERE shop_id = NEW.shop_id AND is_pinned = TRUE) >= 3 THEN
            RAISE EXCEPTION 'A shop can have a maximum of 3 pinned gallery images.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_pinned_limit
BEFORE INSERT OR UPDATE ON shop_gallery
FOR EACH ROW
EXECUTE FUNCTION check_pinned_limit();

-- Pre-seed Initial Data
-- Seed Categories
INSERT INTO shop_categories (name, slug) VALUES
('All Wear', 'all-wear'),
('Menswear', 'menswear'),
('Womenswear', 'womenswear'),
('Kids Wear', 'kids-wear'),
('Ethnic Wear', 'ethnic-wear'),
('Footwear', 'footwear'),
('Accessories', 'accessories')
ON CONFLICT (name) DO NOTHING;

-- Seed Founder User & Founder Shop & Products
DO $$
DECLARE
    founder_user_id UUID := '00000000-0000-0000-0000-000000000001';
    founder_shop_id UUID := '00000000-0000-0000-0000-000000000002';
    p1_id UUID := '00000000-0000-0000-0000-000000000011';
    p2_id UUID := '00000000-0000-0000-0000-000000000012';
    p3_id UUID := '00000000-0000-0000-0000-000000000013';
BEGIN
    -- Insert Admin User (Founder)
    INSERT INTO users (id, email, name, avatar_url, role)
    VALUES (
        founder_user_id,
        'gauswamiashish760@gmail.com',
        'Ashish Gauswami',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        'admin'
    )
    ON CONFLICT (email) DO UPDATE 
    SET role = 'admin', name = 'Ashish Gauswami'
    RETURNING id INTO founder_user_id;

    -- Insert Founder Shop
    INSERT INTO shops (
        id, owner_id, name, owner_name, phone, email, city, category, 
        description, instagram_url, logo_url, cover_url, status, is_verified, is_founder
    )
    VALUES (
        founder_shop_id,
        founder_user_id,
        'Brotherhood Clothing',
        'Ashish Gauswami',
        '9664592743',
        'gauswamiashish760@gmail.com',
        'Palanpur',
        'All Wear',
        'Palanpurs ultimate fashion destination. Offering a curated collection of premium designer wear, luxury casuals, and modern streetwear for men, women, and kids.',
        'https://www.instagram.com/gauswami_8_07_18',
        'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=300&h=300&q=80',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
        'approved',
        TRUE,
        TRUE
    )
    ON CONFLICT (owner_id) DO UPDATE
    SET name = EXCLUDED.name, 
        owner_name = EXCLUDED.owner_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        description = EXCLUDED.description,
        instagram_url = EXCLUDED.instagram_url,
        logo_url = EXCLUDED.logo_url,
        cover_url = EXCLUDED.cover_url,
        status = 'approved',
        is_verified = TRUE,
        is_founder = TRUE;

    -- Insert Shop Settings
    INSERT INTO shop_settings (shop_id, allow_notifications, theme_settings)
    VALUES (
        founder_shop_id,
        TRUE,
        '{"theme": "dark", "primary_color": "gold"}'::jsonb
    )
    ON CONFLICT (shop_id) DO NOTHING;

    -- Insert Pinned Gallery Images for Founder Shop
    INSERT INTO shop_gallery (shop_id, image_url, is_pinned) VALUES
    (founder_shop_id, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&h=600&q=80', TRUE),
    (founder_shop_id, 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&h=600&q=80', TRUE),
    (founder_shop_id, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=600&q=80', TRUE)
    ON CONFLICT DO NOTHING;

    -- Seed Founder Shop Products
    INSERT INTO products (id, shop_id, name, price, stock, image_url, category, description) VALUES
    (p1_id, founder_shop_id, 'Classic Gold Sherwani', 14999.00, 5, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80', 'Ethnic Wear', 'Luxurious gold-threaded wedding sherwani featuring bespoke embroidery.'),
    (p2_id, founder_shop_id, 'Italian Velvet Blazer', 8999.00, 8, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80', 'Menswear', 'Deep royal purple velvet blazer tailored for evening galas.'),
    (p3_id, founder_shop_id, 'Floral Silk Coord Set', 5499.00, 12, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80', 'Womenswear', 'Elegant summer silk floral set, breathable and highly fashionable.')
    ON CONFLICT (id) DO NOTHING;

END $$;

-- 8. Create REVIEWS Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create MESSAGES Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Alter ORDERS Table to add status_history tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- 11. Add allow_email_notifications to USERS
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_email_notifications BOOLEAN NOT NULL DEFAULT TRUE;

-- 12. Create EMAIL SETTINGS Table
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL DEFAULT 'sandbox' CHECK (provider IN ('sandbox', 'smtp', 'resend', 'sendgrid')),
    smtp_host VARCHAR(255),
    smtp_port INT,
    smtp_user VARCHAR(255),
    smtp_pass TEXT,
    smtp_secure BOOLEAN NOT NULL DEFAULT FALSE,
    resend_api_key TEXT,
    sendgrid_api_key TEXT,
    sender_email VARCHAR(255) NOT NULL DEFAULT 'noreply@brotherhood2026.com',
    sender_name VARCHAR(255) NOT NULL DEFAULT 'Brotherhood Clothing',
    enabled_types JSONB NOT NULL DEFAULT '["welcome", "verification", "password_reset", "login_alert", "order_confirmation", "order_status", "wishlist_price_drop", "back_in_stock", "newsletter_confirmation", "contact_response", "account_status", "shop_registration", "shop_status", "new_order", "product_moderation", "low_inventory", "sales_report", "new_review", "new_vendor", "critical_alert", "platform_summary"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default email settings if not present
INSERT INTO email_settings (provider, sender_email, sender_name)
VALUES ('sandbox', 'noreply@brotherhood2026.com', 'Brotherhood Clothing')
ON CONFLICT DO NOTHING;

-- 13. Create EMAIL LOGS Table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    provider_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);

-- 14. Create NEWSLETTER SUBSCRIBERS Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Create CONTACT MESSAGES Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    replied BOOLEAN NOT NULL DEFAULT FALSE,
    reply_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

