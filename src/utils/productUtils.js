// Check if we're in a browser context
const isBrowser = typeof window !== 'undefined';

// Helper to safely load and parse data from localStorage
function getSafeLocalStorage(key, defaultValue) {
  if (!isBrowser) return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

// Get all products from the API
export async function getAllProducts() {
  try {
    // Dynamically import the supabase client to avoid build issues
    const { default: supabase } = await import('./supabaseClient');
    
    // If supabase client is not available, return placeholder data
    if (!supabase) {
      console.warn('Supabase client not initialized - returning placeholder data');
      return getPlaceholderProducts(8);
    }

    // Attempt to fetch products from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('name');

    // Handle errors gracefully
    if (error) {
      console.error('Error fetching products:', error);
      return getPlaceholderProducts(8);
    }

    // If we have data, format it; otherwise, use placeholders
    return data?.length ? data.map(formatProductForDisplay) : getPlaceholderProducts(8);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return getPlaceholderProducts(8); // Use placeholder data on error
  }
}

// Get a product by slug
export async function getProductBySlug(slug) {
  if (!slug) return null;
  
  try {
    // Check if we have this product in localStorage cache
    const cachedProducts = getSafeLocalStorage('product-cache', {});
    if (cachedProducts[slug]) {
      return cachedProducts[slug];
    }
    
    // Attempt to get from Supabase
    const { default: supabase } = await import('./supabaseClient');
    
    if (!supabase) {
      console.warn('Supabase client not initialized - returning placeholder product');
      return getPlaceholderProduct(slug);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching product with slug "${slug}":`, error);
      return getPlaceholderProduct(slug);
    }

    if (!data) {
      return getPlaceholderProduct(slug);
    }
    
    // Format product
    const formattedProduct = formatProductForDisplay(data);
    
    // Cache this product in localStorage
    if (isBrowser) {
      try {
        const productCache = JSON.parse(localStorage.getItem('product-cache') || '{}');
        productCache[slug] = formattedProduct;
        localStorage.setItem('product-cache', JSON.stringify(productCache));
      } catch (e) {
        console.error('Error caching product:', e);
      }
    }

    return formattedProduct;
  } catch (error) {
    console.error(`Failed to fetch product with slug "${slug}":`, error);
    return getPlaceholderProduct(slug);
  }
}

// Get top products
export async function getTopProducts(limit = 4) {
  try {
    const { default: supabase } = await import('./supabaseClient');
    
    if (!supabase) {
      console.warn('Supabase client not initialized - returning placeholder featured products');
      return getPlaceholderProducts(limit, true);
    }

    // Try to get featured products first
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      return getPlaceholderProducts(limit, true);
    }

    // If we don't have enough featured products, get the most recent ones
    if (!data || data.length === 0) {
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (allProductsError) {
        console.error('Error fetching recent products:', allProductsError);
        return getPlaceholderProducts(limit, true);
      }

      return allProducts?.length ? allProducts.map(formatProductForDisplay) : getPlaceholderProducts(limit, true);
    }

    return data.map(formatProductForDisplay);
  } catch (error) {
    console.error('Failed to fetch top products:', error);
    return getPlaceholderProducts(limit, true);
  }
}

// Get related products
export async function getRelatedProducts(productId, category, limit = 4) {
  if (!productId || !category) return getPlaceholderProducts(limit);
  
  try {
    const { default: supabase } = await import('./supabaseClient');
    
    if (!supabase) {
      console.warn('Supabase client not initialized - returning placeholder related products');
      return getPlaceholderProducts(limit);
    }

    // Attempt to get related products of the same category
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .neq('id', productId)
      .limit(limit);

    if (error) {
      console.error('Error fetching related products:', error);
      return getPlaceholderProducts(limit);
    }

    let relatedProducts = data || [];
    
    // If we don't have enough related products in the same category, fill with others
    if (relatedProducts.length < limit) {
      const remaining = limit - relatedProducts.length;
      
      const { data: otherData, error: otherError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .neq('id', productId)
        .neq('category', category)
        .limit(remaining);

      if (!otherError && otherData) {
        relatedProducts = [...relatedProducts, ...otherData];
      }
    }

    return relatedProducts.map(formatProductForDisplay);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return getPlaceholderProducts(limit);
  }
}

// Helper function to format product data consistently
function formatProductForDisplay(product) {
  // Get the Supabase URL from environment
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  
  // Extract and process image data
  let mainImage = null;
  let galleryImages = [];
  
  // Parse images from the database (stored as JSONB)
  if (product.images) {
    let parsedImages = [];
    try {
      // Try parsing if it's a string
      if (typeof product.images === 'string') {
        parsedImages = JSON.parse(product.images);
      } 
      // If it's already an array, use it directly
      else if (Array.isArray(product.images)) {
        parsedImages = product.images;
      }
      // If it's an object with values, convert to array
      else if (typeof product.images === 'object') {
        parsedImages = Object.values(product.images);
      }
    } catch (e) {
      console.warn(`Failed to parse images for product ${product.name}:`, e);
    }
    
    // Filter out any null/undefined values and ensure all URLs are absolute
    parsedImages = parsedImages.filter(img => img);
    
    // Process image URLs
    if (parsedImages.length > 0) {
      // Convert any relative URLs to absolute
      galleryImages = parsedImages.map(img => {
        // If it's already an absolute URL, use it as is
        if (img.startsWith('http')) {
          return img;
        }
        
        // If it starts with a specific path, construct the full URL
        if (img.startsWith('product-images/')) {
          return `${supabaseUrl}/storage/v1/object/public/${img}`;
        }
        
        // Otherwise assume it's just a filename and construct the URL
        return `${supabaseUrl}/storage/v1/object/public/product-images/${img}`;
      });
      
      // Set the main image to the first gallery image
      mainImage = galleryImages[0];
    }
  }
  
  // If no images were parsed from the images field, use the legacy approach
  if (!mainImage) {
    // Try to use image_url if available
    if (product.image_url) {
      mainImage = product.image_url.startsWith('http') 
        ? product.image_url 
        : `${supabaseUrl}/storage/v1/object/public/product-images/${product.image_url}`;
      galleryImages = [mainImage];
    } else {
      // Last resort: generate an image URL based on the slug
      mainImage = `${supabaseUrl}/storage/v1/object/public/product-images/${product.slug}.jpg`;
      galleryImages = [mainImage];
    }
  }
  
  // Safely handle benefits array
  let benefits = [];
  if (product.benefits) {
    try {
      if (typeof product.benefits === 'string') {
        // Try to parse JSON string
        benefits = JSON.parse(product.benefits);
      } else if (Array.isArray(product.benefits)) {
        benefits = product.benefits;
      }
    } catch (e) {
      // If parsing fails but we have a string, try to split it
      if (typeof product.benefits === 'string') {
        if (product.benefits.includes(',')) {
          benefits = product.benefits.split(',').map(b => b.trim());
        } else if (product.benefits.includes('\n')) {
          benefits = product.benefits.split('\n').map(b => b.trim());
        } else {
          benefits = [product.benefits];
        }
      }
    }
  }
  
  // Ensure benefits has at least one item and revise language for FDA compliance
  if (!Array.isArray(benefits) || benefits.length === 0) {
    benefits = ['Research compound for laboratory use'];
  } else {
    // Modify benefit descriptions to comply with FDA guidelines
    benefits = benefits.map(benefit => {
      // Convert health/medical claims to research-focused language
      return benefit
        .replace(/cures|treats|heals|prevents|diagnoses/gi, 'studied for')
        .replace(/health benefits|therapeutic|medical/gi, 'research applications')
        .replace(/improve|enhance|boost/gi, 'designed for')
        .replace(/guaranteed|proven|clinically/gi, 'intended for');
    });
  }
  
  // Safely format price values
  const price = typeof product.price === 'number' ? 
                product.price : 
                parseFloat(product.price) || 99.99; // Default price if parsing fails
               
  const discountedPrice = product.discounted_price ? 
                         (typeof product.discounted_price === 'number' ? 
                          product.discounted_price : 
                          parseFloat(product.discounted_price)) : 
                         null;
  
  // Return the formatted product
  return {
    id: product.id || `placeholder-${Date.now()}`,
    name: product.name || 'Research Product',
    slug: product.slug || 'product',
    price: isNaN(price) ? 99.99 : price, // Default price if NaN
    salePrice: discountedPrice && !isNaN(discountedPrice) ? discountedPrice : null,
    image: mainImage, // Use the main image we determined
    gallery: galleryImages, // Include all gallery images
    category: product.category || 'Research Peptides',
    isNew: isNewProduct(product.created_at),
    isBestseller: product.is_featured || false,
    description: modifyDescription(product.description) || 'Research compound for laboratory use only.',
    benefits: benefits,
    ingredients: modifyQualityStatements(product.purity) || 'Research compound',
    usage: 'FOR LABORATORY RESEARCH USE ONLY.',
    sizes: product.sizes || ['Standard']
  };
}

// Helper function to modify descriptions to comply with FDA guidelines
function modifyDescription(description) {
  if (!description) return '';
  
  // Replace phrases that might imply medical/health claims
  return description
    .replace(/\b(cure|treat|prevent|diagnose|therapy|therapeutic|healing)\b/gi, 'research')
    .replace(/\b(clinically proven|guaranteed|proven)\b/gi, 'designed')
    .replace(/\b(health benefits|medical benefits)\b/gi, 'research applications')
    .replace(/for (human|personal) (use|consumption)/gi, 'for laboratory research')
    .replace(/\bhigh quality\b/gi, 'research-grade')
    .replace(/\b(highest|premium) quality\b/gi, 'research-focused');
}

// Helper function to modify quality statements
function modifyQualityStatements(text) {
  if (!text) return 'Research compound';
  
  // Replace definitive quality statements
  return text
    .replace(/\b(guaranteed|assured|certified)\b/gi, 'intended for')
    .replace(/\b(>[0-9]{2}%)\b/g, 'targeted') // Replace >98% with "targeted"
    .replace(/\b(purity|pure|high purity)\b/gi, 'composition')
    .replace(/\b(highest|premium|superior) quality\b/gi, 'research-grade');
}

// Generate placeholder products when Supabase is unavailable
function getPlaceholderProducts(count = 4, featured = false) {
  const categories = ['Research Peptides', 'Laboratory Supplies', 'Research Compounds', 'Research Bundles'];
  
  return Array.from({ length: count }).map((_, index) => ({
    id: `placeholder-${index}`,
    name: `Research Compound ${index + 1}`,
    slug: `research-compound-${index + 1}`,
    price: 99.99 + (index * 20),
    salePrice: featured && index % 2 === 0 ? 79.99 + (index * 20) : null,
    image: null, // No image URL, will use fallback
    gallery: [],
    category: categories[index % categories.length],
    isNew: index % 3 === 0,
    isBestseller: featured || index % 4 === 0,
    description: 'This is a placeholder product for demonstration purposes when Supabase connection is unavailable. For laboratory research use only.',
    benefits: ['Research compound', 'For laboratory use only', 'Reference material'],
    ingredients: 'Research compound for laboratory use',
    usage: 'FOR LABORATORY RESEARCH USE ONLY.',
    sizes: ['Standard']
  }));
}

// Get a single placeholder product
function getPlaceholderProduct(slug) {
  return {
    id: `placeholder-${slug}`,
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    slug: slug,
    price: 129.99,
    salePrice: null,
    image: null, // Will use fallback
    gallery: [],
    category: 'Research Peptides',
    isNew: true,
    isBestseller: false,
    description: 'This is a placeholder product for demonstration purposes when Supabase connection is unavailable. For laboratory research use only.',
    benefits: ['Research compound', 'For laboratory use only', 'Reference material'],
    ingredients: 'Research compound for laboratory use',
    usage: 'FOR LABORATORY RESEARCH USE ONLY.',
    sizes: ['Standard']
  };
}

// Helper to determine if a product is new based on creation date
function isNewProduct(createdAt) {
  if (!createdAt) return false;
  
  try {
    const productDate = new Date(createdAt);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return productDate > thirtyDaysAgo;
  } catch (e) {
    return false;
  }
}