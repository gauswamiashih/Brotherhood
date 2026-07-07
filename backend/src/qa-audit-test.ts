const BASE_URL = 'http://localhost:5000/api';

async function runQA() {
  console.log('==================================================');
  console.log('STARTING INTEGRATION QA AUDIT TEST PROGRAM');
  console.log('==================================================');

  try {
    // 1. Fetch Categories
    console.log('\n[TEST 1] GET /categories (Public Category Fetching)...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    if (!catRes.ok) throw new Error('Categories fetch failed');
    const categories = await catRes.json() as any[];
    console.log(`PASS: Retrieved ${categories.length} fashion categories.`);

    // 2. Customer Registration / Login
    console.log('\n[TEST 2] POST /auth/google (Customer Login & Signup)...');
    const buyerEmail = `buyer_${Date.now()}@test.com`;
    const buyerLoginRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: buyerEmail, role: 'customer' })
    });
    if (!buyerLoginRes.ok) throw new Error('Customer login failed');
    const buyerAuth = await buyerLoginRes.json() as any;
    const buyerToken = buyerAuth.token;
    console.log(`PASS: Customer registered & authenticated. Token: ${buyerToken.substring(0, 15)}...`);

    // 3. Shop Owner Registration / Login
    console.log('\n[TEST 3] POST /auth/google (Shop Owner Sign Up)...');
    const ownerEmail = `owner_${Date.now()}@test.com`;
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ownerEmail, role: 'owner' })
    });
    if (!ownerLoginRes.ok) throw new Error('Owner signup failed');
    const ownerAuth = await ownerLoginRes.json() as any;
    const ownerToken = ownerAuth.token;
    console.log(`PASS: Boutique owner registered. Token: ${ownerToken.substring(0, 15)}...`);

    // 4. Shop Registration
    console.log('\n[TEST 4] POST /shops (Submit Boutique details)...');
    const shopName = `Elite Couture_${Date.now()}`;
    const registerShopRes = await fetch(`${BASE_URL}/shops`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: shopName,
        ownerName: 'Devang Patel',
        phone: '9876543210',
        email: ownerEmail,
        city: 'Palanpur',
        category: 'Ethnic Wear',
        description: 'Elite hand-crafted ethnic fashion house.',
        logoUrl: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=300',
        coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'
      })
    });
    if (!registerShopRes.ok) {
      const errText = await registerShopRes.text();
      throw new Error(`Shop registration failed: ${errText}`);
    }
    const registeredShop = await registerShopRes.json() as any;
    console.log(`PASS: Shop created under status: ${registeredShop.shop.status}. Shop ID: ${registeredShop.shop.id}`);

    // 5. Admin Approving the Shop
    console.log('\n[TEST 5] PUT /api/admin/shops/:id/status (Admin approval flow)...');
    const adminEmail = 'gauswamiashish760@gmail.com';
    const adminLoginRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: adminEmail, role: 'admin' })
    });
    if (!adminLoginRes.ok) throw new Error('Admin auth failed');
    const adminAuth = await adminLoginRes.json() as any;
    const adminToken = adminAuth.token;

    const approveShopRes = await fetch(`${BASE_URL}/admin/shops/${registeredShop.shop.id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    if (!approveShopRes.ok) throw new Error('Admin failed to approve shop');
    console.log('PASS: Admin approved shop application successfully.');

    // 6. Owner creates Product with Variants & AI copywriting description
    console.log('\n[TEST 6] POST /api/products/generate-description (AI Copywriting)...');
    const aiCopyRes = await fetch(`${BASE_URL}/products/generate-description`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Royal Zardozi Lehenga',
        category: 'Ethnic Wear',
        fabric: 'Banarasi Silk velvet',
        keyFeatures: 'Handwoven gold embroidery, heavy flare'
      })
    });
    if (!aiCopyRes.ok) throw new Error('AI copywriting description failed');
    const aiCopy = await aiCopyRes.json() as any;
    console.log(`PASS: Generated Luxury copy: "${aiCopy.description.substring(0, 50)}..."`);

    console.log('\n[TEST 7] POST /products (Create product with variants)...');
    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Royal Zardozi Lehenga',
        price: 25000,
        stock: 10,
        category: 'Ethnic Wear',
        imageUrl: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=300',
        description: aiCopy.description,
        variants: [
          { size: 'M', color: 'Crimson Red', stock: 5 },
          { size: 'L', color: 'Crimson Red', stock: 5 }
        ]
      })
    });
    if (!createProdRes.ok) throw new Error('Product creation failed');
    const createdProduct = await createProdRes.json() as any;
    console.log(`PASS: Product created. ID: ${createdProduct.id}, variants count: ${createdProduct.variants?.length}`);

    // 7. Customer searches, adds to cart, and checkouts order
    console.log('\n[TEST 8] GET /products (Customer searches products)...');
    const searchRes = await fetch(`${BASE_URL}/products?search=Zardozi`);
    if (!searchRes.ok) throw new Error('Search failed');
    const searchedProducts = await searchRes.json() as any[];
    const matchingProduct = searchedProducts.find(p => p.id === createdProduct.id);
    if (!matchingProduct) throw new Error('Could not find created product in search catalog results');
    console.log(`PASS: Searched and matched product by name token. Price: ₹${matchingProduct.price}`);

    console.log('\n[TEST 9] POST /orders (Complete order inquiry checkout)...');
    const checkoutRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        shopId: registeredShop.shop.id,
        customerName: 'Aria Sharma',
        customerEmail: buyerEmail,
        customerPhone: '9898989898',
        customerAddress: '55, Royal enclave, Palanpur',
        items: [
          {
            id: createdProduct.id,
            name: createdProduct.name,
            price: 25000,
            quantity: 1,
            size: 'M',
            color: 'Crimson Red'
          }
        ],
        totalPrice: 25000
      })
    });
    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      throw new Error(`Order checkout failed: ${errText}`);
    }
    const createdOrder = await checkoutRes.json() as any;
    console.log(`PASS: Order placed successfully under status: ${createdOrder.status}. Order ID: ${createdOrder.id}`);

    // 8. Payment Simulation Sandbox
    console.log('\n[TEST 10] POST /orders/:id/pay (Razorpay Simulation)...');
    const payRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}/pay`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    if (!payRes.ok) throw new Error('Payment confirmation failed');
    const paidOrder = await payRes.json() as any;
    console.log(`PASS: Paid simulated order successfully. New status: ${paidOrder.status}`);

    // 9. Messaging Inbox short-polling
    console.log('\n[TEST 11] POST /messages & GET /messages/history/:id (Customer messages owner)...');
    const sendMessageRes = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        receiverId: ownerAuth.user.id,
        shopId: registeredShop.shop.id,
        content: 'Greetings. Can I get customized fit alterations for my crimson Zardozi Lehenga?'
      })
    });
    if (!sendMessageRes.ok) throw new Error('Sending client message failed');
    console.log('PASS: Client message dispatched to shop owner inbox.');

    const fetchHistoryRes = await fetch(`${BASE_URL}/messages/history/${buyerAuth.user.id}`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (!fetchHistoryRes.ok) throw new Error('Fetching logs failed');
    const history = await fetchHistoryRes.json() as any[];
    console.log(`PASS: Stylist inbox chat logs retrieved. Messages count: ${history.length}`);

    // 10. Stylist advances order to Shipped
    console.log('\n[TEST 12] PUT /orders/:id/status (Boutique owner ships order)...');
    const shipRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        status: 'shipped',
        notes: 'Shipped via premium Palanpur logistics express service.'
      })
    });
    if (!shipRes.ok) throw new Error('Owner failed to update status to shipped');
    const shippedOrder = await shipRes.json() as any;
    console.log(`PASS: Order status advanced to: ${shippedOrder.status}. Logs count: ${shippedOrder.status_history?.length || 0}`);

    // 11. Customer leaves verified purchase review
    console.log('\n[TEST 13] POST /reviews (Client submits product review)...');
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        shopId: registeredShop.shop.id,
        productId: createdProduct.id,
        rating: 5,
        comment: 'Absolutely breathtaking banarasi silk weave and custom boutique alterations fit perfectly!'
      })
    });
    if (!reviewRes.ok) {
      const errText = await reviewRes.text();
      throw new Error(`Review submission failed: ${errText}`);
    }
    const createdReview = await reviewRes.json() as any;
    console.log(`PASS: Client review accepted. Rating: ${createdReview.rating} stars. Comment: "${createdReview.comment}"`);

    // 12. AI Stylist Chatbot advice
    console.log('\n[TEST 14] POST /ai/stylist (Couture AI Stylist advice chat)...');
    const aiStylistRes = await fetch(`${BASE_URL}/ai/stylist`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        message: 'I am attending a traditional sangeet ritual. Recommend me a crimson Banarasi Silk outfit.',
        history: []
      })
    });
    if (!aiStylistRes.ok) throw new Error('AI Stylist failed to respond');
    const aiStylist = await aiStylistRes.json() as any;
    console.log(`PASS: AI Stylist response: "${aiStylist.reply.substring(0, 50)}..."`);
    console.log(`PASS: AI Stylist recommended metadata products matching database inventory: ${aiStylist.products?.length}`);

    console.log('\n==================================================');
    console.log('QA AUDIT SUCCESS: ALL INTEGRATION TESTS PASSED!');
    console.log('==================================================');
    process.exit(0);

  } catch (err: any) {
    console.error('\n==================================================');
    console.error('QA AUDIT FAILURE: CRITICAL INTEGRATION BUG DETECTED');
    console.error(err.message || err);
    console.error('==================================================');
    process.exit(1);
  }
}

runQA();
