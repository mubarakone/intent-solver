-- Create the flattened intents table
CREATE TABLE intents (
  id TEXT PRIMARY KEY, -- original hash
  intent_id INTEGER NOT NULL UNIQUE, -- public-facing ID
  wallet_address TEXT NOT NULL, -- buyer's wallet
  shipping_address TEXT NOT NULL,
  product_link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  solver_wallet_address TEXT, -- optional, set after solver is assigned
  solver_delivery_date TEXT,  -- optional, ISO string or date string
  timestamp TIMESTAMPTZ NOT NULL
);

-- Index for efficient wallet-based filtering
CREATE INDEX idx_wallet_address ON intents(wallet_address);

-- Optional: index solver_wallet_address if querying by solver
CREATE INDEX idx_solver_wallet ON intents(solver_wallet_address);

-- Enable Row Level Security (RLS)
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;

-- Public read access policy (adjust as needed)
CREATE POLICY "Public intents are viewable by everyone" 
  ON intents FOR SELECT USING (true);

-- Allow authenticated users to insert intents
CREATE POLICY "Intents can be inserted by authenticated users" 
  ON intents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update intents (adjust if ownership needed)
CREATE POLICY "Intents can be updated by authenticated users" 
  ON intents FOR UPDATE USING (auth.role() = 'authenticated');

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('6ogpK7XN9ocEgDOOHn3G', 0, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/John-Deere-Green-Moline-Embroidered/dp/B0BL56H4NF', 1, NULL, NULL, TO_TIMESTAMP(1738976755096 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('mF4kxvoQkWAFttrDSe6q', 1, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Carhartt-Mens-Firm-Duck-Black/dp/B0CN84ZD3P', 1, NULL, NULL, TO_TIMESTAMP(1739064610884 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('U4Zfl1J727YeIiB2EVDH', 2, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Carhartt-Mens-Firm-Duck-Black/dp/B0CN84ZD3P', 1, NULL, NULL, TO_TIMESTAMP(1739220658745 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('xeJ7FstFY1SaFWf6y4Kh', 3, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Carhartt-Mens-Firm-Duck-Black/dp/B0CN84ZD3P', 1, NULL, NULL, TO_TIMESTAMP(1739233388173 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('bWu6apNh8cY47AjJZJld', 4, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Outdoor-Cap-Realtree-Edge-Chevrolet/dp/B00ISMJWYC', 1, NULL, NULL, TO_TIMESTAMP(1739584711250 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('L3jEpG4AlXCsprTq8sZy', 5, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Outdoor-Cap-Realtree-Edge-Chevrolet/dp/B00ISMJWYC', 1, NULL, NULL, TO_TIMESTAMP(1739589054085 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('sO4f0Fg4b1OfsoqvPVDX', 6, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Outdoor-Cap-Realtree-Edge-Chevrolet/dp/B00ISMJWYC', 1, NULL, NULL, TO_TIMESTAMP(1739590343977 / 1000.0));

INSERT INTO intents (id, intent_id, wallet_address, shipping_address, product_link, quantity, solver_wallet_address, solver_delivery_date, timestamp) VALUES
('tUl4gFNc9dhfseLLJLA9', 7, '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0', 'Mubarak Usmane 242 Deep Dell Road San Diego California 92114 United States', 'https://www.amazon.com/Outdoor-Cap-Realtree-Edge-Chevrolet/dp/B00ISMJWYC', 1, NULL, NULL, TO_TIMESTAMP(1739591409358 / 1000.0));