const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// Serve the frontend (public/index.html) before the JSON "/" route below,
// so visiting the site in a browser shows the Ruchi web UI instead of raw JSON.
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3005;

// Mock data
const restaurants = [
  { id: 1, name: "White Horse Family Restaurant", cuisine: "North-indian", "South-indian", "chinese", rating: 4.3 },
  { id: 2, name: "RAW06", cuisine: "North-indian", "South-indian", "chinese", rating: 4.5 },
  { id: 3, name: "Domino's Pizza", cuisine: "Fast Food", rating: 4.1 }
];

const menus = {
  1: [{ item: "Chicken kasturi", price: 250 }, { item: "Chicken Fried Rice", price: 180 }],[{ item: "Chicken Biryani", price:220 }, { item: "Ghee Rice", price:160 }],
  2: [{ item: "Chicken kasturi", price: 250 }, { item: "Chicken Fried Rice", price: 180 }],[{ item: "Chicken Biryani", price:220 }, { item: "Ghee Rice", price:160 }],
  3: [{ item: "Margherita Pizza", price: 249 }, { item: "Farmhouse Pizza", price: 399 }],[{ item: "Paneer Pizza", price: 249 }, { item: "Chicken maxx Pizza", price: 399 }]
};

const DELIVERY_FEE = 25;
const PAYMENT_METHODS = ['cod', 'upi', 'card'];

// Simulated order lifecycle. Each stage advances automatically after
// STAGE_DELAY_MS, so the frontend can poll GET /orders/:id and watch an
// order move through real stages instead of it staying stuck at "placed".
const STATUS_FLOW = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STAGE_DELAY_MS = 6000;

let orders = [];
let orderIdCounter = 1;

function advanceOrder(order) {
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return;
  order.status = STATUS_FLOW[currentIndex + 1];
  order.statusHistory.push({ status: order.status, at: new Date().toISOString() });
  if (order.status !== 'delivered') {
    setTimeout(() => advanceOrder(order), STAGE_DELAY_MS);
  }
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Zomato Clone API running' });
});

app.get('/restaurants', (req, res) => {
  res.json(restaurants);
});

app.get('/restaurants/:id/menu', (req, res) => {
  const menu = menus[req.params.id];
  if (!menu) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(menu);
});

app.post('/orders', (req, res) => {
  const { restaurantId, items, deliveryAddress, phone, paymentMethod } = req.body;

  const restaurant = restaurants.find(r => r.id === Number(restaurantId));
  if (!restaurant) {
    return res.status(400).json({ error: 'Unknown restaurantId' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }
  for (const it of items) {
    if (!it.item || !Number.isFinite(it.qty) || it.qty < 1 || !Number.isFinite(it.price)) {
      return res.status(400).json({ error: 'each item needs item, qty (>=1) and price' });
    }
  }
  if (!deliveryAddress || !String(deliveryAddress).trim()) {
    return res.status(400).json({ error: 'deliveryAddress is required' });
  }
  if (!phone || !/^[0-9]{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'phone must be a 10-digit number' });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: `paymentMethod must be one of ${PAYMENT_METHODS.join(', ')}` });
  }

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const total = subtotal + DELIVERY_FEE;
  const now = new Date().toISOString();

  const order = {
    id: orderIdCounter++,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    items,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    deliveryAddress: String(deliveryAddress).trim(),
    phone: String(phone).trim(),
    paymentMethod,
    status: 'placed',
    statusHistory: [{ status: 'placed', at: now }],
    estimatedDeliveryMinutes: 25 + Math.floor(Math.random() * 16), // 25-40 min
    createdAt: now
  };

  orders.push(order);
  setTimeout(() => advanceOrder(order), STAGE_DELAY_MS);

  res.status(201).json(order);
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Zomato API running on port ${PORT}`);
});
