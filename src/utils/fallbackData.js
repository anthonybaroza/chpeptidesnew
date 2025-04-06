// This module provides fallback data when Supabase is unavailable
// Used to ensure the site remains functional without a database connection

// Generates placeholder products for display
export function generatePlaceholderProducts(count = 8, category = null) {
  const categories = [
    'Research Peptides',
    'Laboratory Supplies', 
    'Research Chemicals',
    'Research Bundles'
  ];
  
  const peptideNames = [
    'BPC-157',
    'TB-500',
    'Melanotan II',
    'GHK-Cu',
    'PT-141',
    'IGF-1 LR3',
    'CJC-1295',
    'GHRP-6',
    'Selank',
    'Semax',
    'GW-501516',
    'MK-677'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    // Assign a category - either the provided one or pick from the list
    const productCategory = category || categories[index % categories.length];
    
    // Create a more realistic product name based on the category
    let name;
    let slug;
    
    if (productCategory === 'Research Peptides') {
      name = peptideNames[index % peptideNames.length];
      slug = name.toLowerCase().replace(/\s+/g, '-');
    } else if (productCategory === 'Laboratory Supplies') {
      const supplies = ['Pipettes', 'Test Tubes', 'Centrifuge', 'Lab Gloves', 'Microscope Slides'];
      name = supplies[index % supplies.length] + ' ' + (index + 1);
      slug = `lab-${name.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (productCategory === 'Research Bundles') {
      name = `Research Bundle ${String.fromCharCode(65 + (index % 26))}`;
      slug = `bundle-${String.fromCharCode(97 + (index % 26))}`;
    } else {
      name = `Research Compound ${index + 1}`;
      slug = `compound-${index + 1}`;
    }
    
    // Determine if it's on sale (every third product)
    const isOnSale = index % 3 === 0;
    const basePrice = 49.99 + (index * 10);
    const salePrice = isOnSale ? basePrice * 0.8 : null;
    
    // Generate other product properties
    return {
      id: `placeholder-${index}`,
      name,
      slug,
      description: `Premium research-grade ${name} for laboratory use only. This product is not intended for human consumption and is sold for research purposes only.`,
      price: basePrice,
      salePrice,
      image: null, // Will use fallback
      category: productCategory,
      isNew: index % 5 === 0,
      isBestseller: index % 4 === 0,
      benefits: [
        'High purity compound',
        'For research use only', 
        'Premium quality',
        'Consistent potency'
      ],
      sizes: ['Standard', '5mg', '10mg']
    };
  });
}

// Generate a single placeholder product with more details
export function generatePlaceholderProduct(slug) {
  // Extract potential name from slug
  const nameParts = slug.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  );
  
  const name = nameParts.join(' ');
  const basePrice = 99.99;
  
  // Randomize whether this product is on sale
  const isOnSale = Math.random() > 0.7;
  const salePrice = isOnSale ? basePrice * 0.8 : null;
  
  return {
    id: `placeholder-${slug}`,
    name,
    slug,
    description: `Premium research-grade ${name} for laboratory use only. This product is developed with advanced synthesis techniques ensuring highest quality for your research needs. All products are for laboratory research purposes only and not for human consumption.\n\nOur rigorous quality control process ensures consistency across batches, making this an ideal choice for ongoing research projects.`,
    price: basePrice,
    salePrice,
    image: null, // Will use fallback
    category: 'Research Peptides',
    isNew: Math.random() > 0.7,
    isBestseller: Math.random() > 0.8,
    benefits: [
      'High purity research compound',
      'Third-party tested for quality assurance',
      'Consistent potency across batches',
      'Detailed certificate of analysis included'
    ],
    ingredients: 'Premium research-grade compound with >98% purity',
    usage: 'FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN CONSUMPTION.',
    sizes: ['Standard', '5mg', '10mg', '20mg']
  };
}