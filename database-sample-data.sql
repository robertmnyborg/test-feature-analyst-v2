-- Feature Analyst V2 - Sample Data for Testing
-- This file contains realistic sample data for development and testing

-- ============================================================================
-- MSAs (Metro Statistical Areas)
-- ============================================================================

INSERT INTO msas (code, name, state, population, median_income, housing_units, rental_vacancy_rate) VALUES
('14460', 'Boston-Cambridge-Newton', 'MA-NH', 4941632, 89645, 2045821, 5.2),
('16980', 'Chicago-Naperville-Elgin', 'IL-IN-WI', 9458539, 72205, 3675532, 7.8),
('19100', 'Dallas-Fort Worth-Arlington', 'TX', 7637387, 68034, 2964853, 6.9),
('19740', 'Denver-Aurora-Lakewood', 'CO', 2963821, 79857, 1214235, 4.3),
('26420', 'Houston-The Woodlands-Sugar Land', 'TX', 7122240, 62592, 2756874, 8.1),
('31080', 'Los Angeles-Long Beach-Anaheim', 'CA', 13200998, 76367, 4697845, 4.7),
('33100', 'Miami-Fort Lauderdale-Pompano Beach', 'FL', 6166488, 58863, 2512738, 9.2),
('35620', 'New York-Newark-Jersey City', 'NY-NJ-PA', 19216182, 84242, 7582098, 4.9),
('37980', 'Philadelphia-Camden-Wilmington', 'PA-NJ-DE-MD', 6102434, 72293, 2382176, 6.4),
('38060', 'Phoenix-Mesa-Scottsdale', 'AZ', 4948203, 64871, 2021897, 7.5),
('40140', 'Riverside-San Bernardino-Ontario', 'CA', 4653105, 65995, 1537234, 5.8),
('41860', 'San Francisco-Oakland-Berkeley', 'CA', 4731803, 112449, 1838234, 3.2),
('41940', 'San Jose-Sunnyvale-Santa Clara', 'CA', 1990660, 130890, 685438, 2.9),
('42660', 'Seattle-Tacoma-Bellevue', 'WA', 3979845, 92263, 1653789, 3.6),
('47900', 'Washington-Arlington-Alexandria', 'DC-VA-MD-WV', 6280487, 106923, 2597021, 5.1);

-- ============================================================================
-- Communities (Multifamily Properties)
-- ============================================================================

INSERT INTO communities (name, msa_id, street, city, state, zip_code, latitude, longitude, total_units, available_units) VALUES
-- Denver MSA
('The Peaks at Cherry Creek', (SELECT id FROM msas WHERE code = '19740'), '100 S Colorado Blvd', 'Denver', 'CO', '80246', 39.7135, -104.9405, 285, 12),
('Skyline Flats', (SELECT id FROM msas WHERE code = '19740'), '1850 Wazee St', 'Denver', 'CO', '80202', 39.7542, -105.0000, 198, 8),
('Alta at City Centre', (SELECT id FROM msas WHERE code = '19740'), '16th Street Mall', 'Denver', 'CO', '80202', 39.7485, -104.9973, 342, 15),

-- Austin (using Dallas for simplicity)
('The Domain at Austin', (SELECT id FROM msas WHERE code = '19100'), '11410 Century Oaks Terrace', 'Austin', 'TX', '78758', 30.4011, -97.7230, 425, 28),
('SoCo Urban Lofts', (SELECT id FROM msas WHERE code = '19100'), '1500 South Congress Ave', 'Austin', 'TX', '78704', 30.2477, -97.7513, 156, 6),

-- Phoenix
('Desert Ridge Apartments', (SELECT id FROM msas WHERE code = '38060'), '21001 N Tatum Blvd', 'Phoenix', 'AZ', '85050', 33.6746, -111.9767, 368, 22),
('Scottsdale Quarters', (SELECT id FROM msas WHERE code = '38060'), '15059 N Scottsdale Rd', 'Scottsdale', 'AZ', '85254', 33.6197, -111.9258, 289, 14),

-- San Francisco
('Mission Bay Tower', (SELECT id FROM msas WHERE code = '41860'), '1200 4th Street', 'San Francisco', 'CA', '94158', 37.7706, -122.3896, 412, 9),
('SOMA Grand', (SELECT id FROM msas WHERE code = '41860'), '1160 Mission St', 'San Francisco', 'CA', '94103', 37.7785, -122.4121, 325, 7),

-- Seattle
('Capitol Hill Station Apartments', (SELECT id FROM msas WHERE code = '42660'), '501 Broadway E', 'Seattle', 'WA', '98102', 47.6182, -122.3206, 298, 11),
('South Lake Union Residences', (SELECT id FROM msas WHERE code = '42660'), '1000 Westlake Ave N', 'Seattle', 'WA', '98109', 47.6219, -122.3401, 385, 18);

-- ============================================================================
-- Features
-- ============================================================================

INSERT INTO features (name, category, description) VALUES
-- Kitchen Features
('Granite Countertops', 'kitchen', 'Premium granite countertops in kitchen'),
('Stainless Steel Appliances', 'kitchen', 'Stainless steel kitchen appliances'),
('Kitchen Island', 'kitchen', 'Kitchen island with additional counter space'),
('Gas Range', 'kitchen', 'Gas cooking range'),
('Wine Fridge', 'kitchen', 'Built-in wine refrigerator'),
('Double Oven', 'kitchen', 'Double wall oven'),

-- Flooring
('Hardwood Floors', 'flooring', 'Engineered hardwood or luxury vinyl plank flooring'),
('Tile Flooring', 'flooring', 'Ceramic or porcelain tile floors'),
('Carpet', 'flooring', 'Premium carpet in bedrooms'),

-- Smart Home
('Smart Thermostat', 'smart-home', 'Nest or Ecobee smart thermostat'),
('Smart Locks', 'smart-home', 'Keyless entry with smart locks'),
('Smart Home Hub', 'smart-home', 'Integrated smart home system'),

-- Laundry
('In-Unit Washer/Dryer', 'laundry', 'Full-size washer and dryer in unit'),
('Washer/Dryer Hookups', 'laundry', 'Connections for washer and dryer'),

-- Outdoor
('Private Balcony', 'outdoor', 'Private balcony or patio'),
('Walk-In Closet', 'storage', 'Walk-in closet in master bedroom'),
('Extra Storage', 'storage', 'Additional storage closet or space'),

-- Bathroom
('Double Vanity', 'bathroom', 'Double sink vanity in master bath'),
('Soaking Tub', 'bathroom', 'Deep soaking bathtub'),
('Walk-In Shower', 'bathroom', 'Spacious walk-in shower'),
('Heated Floors', 'bathroom', 'Radiant heated bathroom floors'),

-- Technology
('High-Speed Internet', 'technology', 'Gigabit fiber internet included'),
('USB Outlets', 'technology', 'USB charging ports in walls'),

-- Energy
('Energy Star Appliances', 'energy', 'Energy-efficient appliances'),
('Solar Panels', 'energy', 'Community solar power system'),

-- Views
('City View', 'view', 'Panoramic city views'),
('Mountain View', 'view', 'Mountain vista views'),
('Water View', 'view', 'Lake or ocean views'),

-- Community Amenities
('Pool', 'community', 'Resort-style swimming pool'),
('Fitness Center', 'community', '24/7 fitness center'),
('Rooftop Deck', 'community', 'Rooftop lounge and entertainment area'),
('Pet Spa', 'community', 'Pet washing and grooming station'),
('Coworking Space', 'community', 'Business center and coworking spaces'),
('EV Charging', 'community', 'Electric vehicle charging stations');

-- ============================================================================
-- Units
-- ============================================================================

-- Denver - The Peaks at Cherry Creek
INSERT INTO units (community_id, unit_number, bedrooms, bathrooms, square_feet, monthly_rent, availability) VALUES
((SELECT id FROM communities WHERE name = 'The Peaks at Cherry Creek'), 'A101', 1, 1, 750, 1850, 'available'),
((SELECT id FROM communities WHERE name = 'The Peaks at Cherry Creek'), 'A205', 1, 1, 780, 1900, 'occupied'),
((SELECT id FROM communities WHERE name = 'The Peaks at Cherry Creek'), 'B310', 2, 2, 1150, 2650, 'available'),
((SELECT id FROM communities WHERE name = 'The Peaks at Cherry Creek'), 'B412', 2, 2, 1200, 2800, 'occupied'),
((SELECT id FROM communities WHERE name = 'The Peaks at Cherry Creek'), 'C520', 3, 2, 1550, 3400, 'available'),

-- Denver - Skyline Flats
((SELECT id FROM communities WHERE name = 'Skyline Flats'), 'S101', 1, 1, 680, 1750, 'available'),
((SELECT id FROM communities WHERE name = 'Skyline Flats'), 'S203', 1, 1, 720, 1850, 'occupied'),
((SELECT id FROM communities WHERE name = 'Skyline Flats'), 'S305', 2, 2, 1080, 2450, 'available'),
((SELECT id FROM communities WHERE name = 'Skyline Flats'), 'S407', 2, 2, 1120, 2550, 'occupied'),
((SELECT id FROM communities WHERE name = 'Skyline Flats'), 'S510', 2, 2.5, 1280, 2900, 'available'),

-- Phoenix - Desert Ridge
((SELECT id FROM communities WHERE name = 'Desert Ridge Apartments'), 'DR101', 1, 1, 720, 1450, 'available'),
((SELECT id FROM communities WHERE name = 'Desert Ridge Apartments'), 'DR202', 1, 1, 750, 1500, 'occupied'),
((SELECT id FROM communities WHERE name = 'Desert Ridge Apartments'), 'DR305', 2, 2, 1100, 1950, 'available'),
((SELECT id FROM communities WHERE name = 'Desert Ridge Apartments'), 'DR408', 2, 2, 1150, 2050, 'occupied'),
((SELECT id FROM communities WHERE name = 'Desert Ridge Apartments'), 'DR512', 3, 2, 1500, 2650, 'available'),

-- San Francisco - Mission Bay Tower
((SELECT id FROM communities WHERE name = 'Mission Bay Tower'), 'MB201', 1, 1, 650, 3200, 'available'),
((SELECT id FROM communities WHERE name = 'Mission Bay Tower'), 'MB305', 1, 1, 680, 3350, 'occupied'),
((SELECT id FROM communities WHERE name = 'Mission Bay Tower'), 'MB412', 2, 2, 1050, 4800, 'available'),
((SELECT id FROM communities WHERE name = 'Mission Bay Tower'), 'MB518', 2, 2, 1100, 5000, 'occupied'),
((SELECT id FROM communities WHERE name = 'Mission Bay Tower'), 'MB625', 3, 2.5, 1550, 6500, 'available'),

-- Seattle - Capitol Hill Station
((SELECT id FROM communities WHERE name = 'Capitol Hill Station Apartments'), 'CH101', 0, 1, 450, 1650, 'available'), -- Studio
((SELECT id FROM communities WHERE name = 'Capitol Hill Station Apartments'), 'CH205', 1, 1, 700, 2100, 'occupied'),
((SELECT id FROM communities WHERE name = 'Capitol Hill Station Apartments'), 'CH308', 1, 1, 750, 2250, 'available'),
((SELECT id FROM communities WHERE name = 'Capitol Hill Station Apartments'), 'CH412', 2, 2, 1100, 2950, 'occupied'),
((SELECT id FROM communities WHERE name = 'Capitol Hill Station Apartments'), 'CH520', 2, 2, 1200, 3150, 'available');

-- ============================================================================
-- Unit Features (Many-to-Many Relationships)
-- ============================================================================

-- The Peaks at Cherry Creek - A101 (Entry-level 1BR)
INSERT INTO unit_features (unit_id, feature_id) VALUES
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Hardwood Floors')),
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Stainless Steel Appliances')),
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Private Balcony')),
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Walk-In Closet')),
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Pool')),
((SELECT id FROM units WHERE unit_number = 'A101'), (SELECT id FROM features WHERE name = 'Fitness Center'));

-- The Peaks at Cherry Creek - B310 (Premium 2BR with features)
INSERT INTO unit_features (unit_id, feature_id) VALUES
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Granite Countertops')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Stainless Steel Appliances')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Hardwood Floors')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'In-Unit Washer/Dryer')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Private Balcony')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Walk-In Closet')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Smart Thermostat')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Mountain View')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Pool')),
((SELECT id FROM units WHERE unit_number = 'B310'), (SELECT id FROM features WHERE name = 'Fitness Center'));

-- Mission Bay Tower - MB412 (Luxury 2BR with premium features)
INSERT INTO unit_features (unit_id, feature_id) VALUES
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Granite Countertops')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Stainless Steel Appliances')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Kitchen Island')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Gas Range')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Hardwood Floors')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'In-Unit Washer/Dryer')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Private Balcony')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Walk-In Closet')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Smart Thermostat')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Smart Locks')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Double Vanity')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Walk-In Shower')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'City View')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Water View')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Rooftop Deck')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'Coworking Space')),
((SELECT id FROM units WHERE unit_number = 'MB412'), (SELECT id FROM features WHERE name = 'EV Charging'));

-- Add some features to other units for testing
-- Desert Ridge DR305
INSERT INTO unit_features (unit_id, feature_id) VALUES
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Granite Countertops')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Stainless Steel Appliances')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Hardwood Floors')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'In-Unit Washer/Dryer')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Private Balcony')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Pool')),
((SELECT id FROM units WHERE unit_number = 'DR305'), (SELECT id FROM features WHERE name = 'Fitness Center'));

-- Capitol Hill CH412
INSERT INTO unit_features (unit_id, feature_id) VALUES
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Granite Countertops')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Stainless Steel Appliances')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Hardwood Floors')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'In-Unit Washer/Dryer')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Private Balcony')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Walk-In Closet')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Smart Thermostat')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'City View')),
((SELECT id FROM units WHERE unit_number = 'CH412'), (SELECT id FROM features WHERE name = 'Rooftop Deck'));

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Count records
SELECT 'MSAs' as table_name, COUNT(*) as count FROM msas
UNION ALL
SELECT 'Communities', COUNT(*) FROM communities
UNION ALL
SELECT 'Features', COUNT(*) FROM features
UNION ALL
SELECT 'Units', COUNT(*) FROM units
UNION ALL
SELECT 'Unit Features', COUNT(*) FROM unit_features;
