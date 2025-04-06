/*
  # Add sample products

  1. New Sample Data
    - Adds sample products with appropriate fields
    - Sets up proper categories, pricing, and slugs
  2. Security
    - No changes to security
*/

-- Only insert if the products table doesn't already have products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (
      name, 
      description, 
      price, 
      stock, 
      image_url, 
      category, 
      status, 
      slug
    ) VALUES 
    (
      'BPC-157', 
      'BPC-157 (Body Protection Compound-157) is a synthetic peptide that is being investigated for its potential tissue healing properties. It is composed of 15 amino acids and is derived from a protective protein found in gastric juice.', 
      89.99, 
      150, 
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Research Peptides', 
      'active', 
      'bpc-157'
    ),
    (
      'TB-500', 
      'TB-500 is a synthetic fraction of the protein thymosin beta-4, which is present in virtually all human and animal cells. The main purpose of this peptide is to promote healing, especially in blood vessels, muscles, and the heart.', 
      109.99, 
      120, 
      'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Research Peptides', 
      'active', 
      'tb-500'
    ),
    (
      'GHK-Cu', 
      'GHK-Cu (glycine-histidine-lysine copper peptide) is a naturally occurring copper complex that plays a role in the human system's health maintenance. It has been studied for its potential effects on skin health and regeneration.', 
      79.99, 
      200, 
      'https://images.unsplash.com/photo-1587854680352-936b22b91030?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Research Peptides', 
      'active', 
      'ghk-cu'
    ),
    (
      'Melanotan II', 
      'Melanotan II is a synthetic analog of the peptide hormone alpha-melanocyte stimulating hormone (α-MSH) that stimulates melanogenesis and has been studied for potential effects on skin pigmentation.', 
      69.99, 
      100, 
      'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Research Peptides', 
      'active', 
      'melanotan-ii'
    ),
    (
      'Recovery Research Bundle', 
      'This bundle includes BPC-157 and TB-500, two peptides widely studied for their potential regenerative and healing properties. Perfect for laboratory research focusing on tissue repair mechanisms.', 
      179.99, 
      50, 
      'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Research Bundles', 
      'active', 
      'recovery-research-bundle'
    ),
    (
      'Laboratory Pipettes Set', 
      'Premium set of laboratory pipettes for precise measurement and liquid transfer. Includes 3 pipettes of varying capacities suitable for handling different volumes of research compounds.', 
      129.99, 
      75, 
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Laboratory Supplies', 
      'active', 
      'laboratory-pipettes-set'
    ),
    (
      'Bacteriostatic Water', 
      'Sterile water with 0.9% benzyl alcohol added as a bacteriostatic preservative. Essential for reconstituting lyophilized peptides for laboratory research.', 
      19.99, 
      300, 
      'https://images.unsplash.com/photo-1605980694822-9db3254734ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Laboratory Supplies', 
      'active', 
      'bacteriostatic-water'
    ),
    (
      'Insulin Syringes', 
      'High precision insulin syringes for laboratory use. Ideal for accurate measurement and transfer of research compounds in laboratory settings.', 
      24.99, 
      250, 
      'https://images.unsplash.com/photo-1599493758267-c6c884c7071f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      'Laboratory Supplies', 
      'active', 
      'insulin-syringes'
    );
  END IF;
END $$;

-- Set some products as featured
DO $$
BEGIN
  UPDATE products SET is_featured = TRUE WHERE slug IN ('bpc-157', 'tb-500', 'recovery-research-bundle', 'bacteriostatic-water');
END $$;