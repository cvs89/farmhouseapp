-- Bhilwara Farmhouse Platform Seed Migration
-- 1. Create a test owner account in auth.users (if not already existing)
-- credentials: email = owner@bhilwarafarms.com, password = Password123
-- Using a pre-hashed bcrypt string to avoid pgcrypto gen_salt extension dependencies.
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'owner@bhilwarafarms.com',
  '$2a$12$R9h/cIPz0gi.UR1gcotOpeibODLIW8k.V.MfKb1zxs8wP4O8.2.32',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Bhilwara Farms Owner","role":"owner"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Explicitly ensure public.profiles has the test owner profile set to owner role
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'Bhilwara Farms Owner',
  'owner@bhilwarafarms.com',
  'owner'
)
ON CONFLICT (id) DO UPDATE SET role = 'owner';


-- 2. Insert 5 Premium Bhilwara Farmhouses
INSERT INTO public.properties (
  id,
  owner_id,
  title,
  slug,
  description,
  address,
  latitude,
  longitude,
  city_distance_info,
  base_price,
  weekend_price,
  deposit_percentage,
  capacity,
  bedrooms,
  bathrooms,
  amenities,
  activities,
  rules,
  images,
  is_published
)
VALUES
-- Property 1
(
  'e1111111-1111-1111-1111-111111111111',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'The Harni Greens Retreat',
  'the-harni-greens-retreat',
  'A serene, luxurious farmhouse surrounded by lush mango groves and manicured gardens, located near the spiritual Harni Mahadev Temple. Features a large private swimming pool, outdoor gazebo, kids play area, and badminton courts. Perfect for peaceful family getaways, private poolside lunches, and weekend stays.',
  'Near Harni Mahadev Temple, Bhilwara, Rajasthan 311001',
  25.3670,
  74.6521,
  '{"railway_station": "4 km", "love_garden": "3.5 km", "nearest_landmark": "Harni Mahadev Temple"}'::jsonb,
  8000.00,
  12000.00,
  20,
  12,
  4,
  4,
  ARRAY['Private Pool', 'Gazebo', 'Huge Garden', 'Indoor Games', 'Fully Equipped Kitchen', 'Outdoor Bonfire', 'High-speed WiFi'],
  ARRAY['Badminton Matches', 'Mango Orchard Walks', 'Evening Barbecue', 'Family Stargazing'],
  ARRAY['Pets allowed in garden area', 'Loud outdoor music restricted after 10 PM', 'Pool access allowed 24/7', 'Littering in orchards prohibited'],
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000'
  ],
  true
),
-- Property 2
(
  'e2222222-2222-2222-2222-222222222222',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'Royal Mewar Orchid Farm',
  'royal-mewar-orchid-farm',
  'A grand royal-style heritage estate offering high-ceiling stone rooms, a large bonfire deck, a traditional Rajasthani wood-fired outdoor kitchen, and massive event lawns. Situated conveniently on Pur Road, it is the ideal destination for grand pre-wedding functions, birthday milestones, corporate team stays, and large group retreats.',
  'Pur Road, near Pur Udan, Bhilwara, Rajasthan 311001',
  25.3204,
  74.6050,
  '{"railway_station": "8 km", "pur_udan": "2.5 km", "nearest_landmark": "Pur Udan Overbridge"}'::jsonb,
  15000.00,
  22000.00,
  25,
  25,
  6,
  7,
  ARRAY['Massive Event Lawns', 'Wood-fired Oven', 'Bonfire Deck', 'Ample Parking', 'Catering Service Available', 'AC Heritage Rooms', 'Security Guard'],
  ARRAY['Traditional Cooking Sessions', 'Kite Flying on Lawn', 'Rajasthani Folk Nights', 'Group Bonfire Stories'],
  ARRAY['Loud music permitted till 11:30 PM', 'Outside catering allowed', 'Event bookings require separate contract', 'Max capacity capped at 35 guests'],
  ARRAY[
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000'
  ],
  true
),
-- Property 3
(
  'e3333333-3333-3333-3333-333333333333',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'Love Garden Stay & Villa',
  'love-garden-stay-and-villa',
  'A modern premium stay nestled close to the heart of the city in Shastri Nagar Extension. Blending urban luxury with countryside tranquility, this glass-facade villa offers a beautiful rooftop terrace lounge, indoor games room (billiards, table tennis), and high-speed Wi-Fi. Perfect for remote workers, couple staycations, and small family gatherings.',
  'Shastri Nagar Ext, near Love Garden, Bhilwara, Rajasthan 311001',
  25.3521,
  74.6401,
  '{"railway_station": "2 km", "love_garden": "0.5 km", "nearest_landmark": "Love Garden Park"}'::jsonb,
  10000.00,
  14000.00,
  20,
  10,
  3,
  3,
  ARRAY['Rooftop Terrace', 'Billiards Table', 'Modern Kitchen', 'Top-tier Smart TVs', 'High-speed WiFi', 'Indoor Fireplace', 'EV Charger'],
  ARRAY['Pool Table Tournaments', 'Rooftop Barbecue Nights', 'Board Game Sessions', 'Movie Screenings'],
  ARRAY['No pets allowed indoors', 'Quiet hours inside after 11 PM', 'Cooking of non-vegetarian food allowed', 'Maximum 12 daytime visitors allowed'],
  ARRAY[
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000'
  ],
  true
),
-- Property 4
(
  'e4444444-4444-4444-4444-444444444444',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'Triveni Riverside Farms',
  'triveni-riverside-farms',
  'A scenic, rustic getaway located near the Triveni river confluence. Experience peaceful mud-house cottages equipped with modern air conditioning, enjoy organic farms walks, take horseback riding lessons, and stargaze on the elevated wooden platforms. Ideal for couples, writers, and small families looking to escape the city noise.',
  'Triveni Road, Bhilwara, Rajasthan 311601',
  25.2954,
  75.0354,
  '{"railway_station": "15 km", "triveni_temple": "1.2 km", "nearest_landmark": "Triveni River Bridge"}'::jsonb,
  6500.00,
  9000.00,
  20,
  8,
  2,
  2,
  ARRAY['River Views', 'Organic Farms Access', 'Stargazing Decks', 'Horse Riding Arena', 'AC Cottages', 'Pet Friendly', 'Hammocks'],
  ARRAY['Horse Riding Lessons', 'Organic Vegetable Harvesting', 'River Trekking Trails', 'Night Stargazing sessions'],
  ARRAY['Pet friendly (all sizes)', 'No smoking inside cottages', 'Please conserve river water resources', 'Check-in: 1:00 PM, Check-out: 10:00 AM'],
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000'
  ],
  true
),
-- Property 5
(
  'e5555555-5555-5555-5555-555555555555',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'The Aravali Foothills Estate',
  'the-aravali-foothills-estate',
  'An adventure-centric hilltop estate featuring stunning panoramic views of the Pur Hills range. It offers a private trekking trail, swimming pool with water slide, organic vegetable gardens, open-air movie projection setups, and traditional Rajasthani folk music stages. Ideal for reunions, corporate retreats, and birthday staycations.',
  'Mandal Highway, foothills of Pur Hills, Bhilwara, Rajasthan 311001',
  25.3854,
  74.5754,
  '{"railway_station": "10 km", "mandal_toll": "4 km", "nearest_landmark": "Pur Hills Trek Entrance"}'::jsonb,
  12000.00,
  18000.00,
  20,
  18,
  5,
  5,
  ARRAY['Infinity Pool', 'Water Slide', 'Private Trekking Path', 'Projector Screen', 'Folk Stage', 'AC Villa', 'DJ Speakers Equipped'],
  ARRAY['Foothills Trekking', 'Infinity Pool Swimming', 'Outdoor Movie Screening', 'Rajasthani Folk Evenings'],
  ARRAY['Outside DJ system allowed with permit', 'Follow safety guidelines for water slide', 'Eco-friendly disposal of waste required', 'Firecrackers restricted'],
  ARRAY[
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000'
  ],
  true
)
ON CONFLICT (id) DO NOTHING;
