import { useState, useEffect, FormEvent, useRef } from 'react';
import { supabase, supabaseAdmin, Product, Category, Brand, formatCurrency } from '../../lib/supabase';
import { Plus, Edit, Trash2, X, AlertCircle, Upload } from 'lucide-react';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    brand_id: '',
    image_url: '',
    stock: '',
    featured: false,
    is_new: false,
    is_limited: false,
    volume_ml: '50',
    concentration: 'Eau de Parfum',
    year_launched: '',
    perfumer: '',
  });

  // Add this constant for comprehensive perfume categories
  const PERFUME_CATEGORIES = [
    { id: 'floral', name: 'Floral', description: 'Delicate and romantic bouquets of flowers' },
    { id: 'woody', name: 'Woody', description: 'Rich, warm woods and resins' },
    { id: 'oriental', name: 'Oriental', description: 'Exotic spices, vanilla and amber' },
    { id: 'fresh', name: 'Fresh', description: 'Citrus, aquatic and green fragrances' },
    { id: 'oud', name: 'Oud', description: 'Precious agarwood compositions' },
    { id: 'niche', name: 'Niche', description: 'Artisanal and avant-garde creations' },
    { id: 'citrus', name: 'Citrus', description: 'Zesty and vibrant lemon, lime, orange and bergamot notes' },
    { id: 'aromatic', name: 'Aromatic', description: 'Herbal and spicy with lavender, rosemary and sage' },
    { id: 'chypre', name: 'Chypre', description: 'Complex blend of citrus, floral and mossy bases' },
    { id: 'fougere', name: 'Fougère', description: 'Classic fern-like accord with lavender and coumarin' },
    { id: 'gourmand', name: 'Gourmand', description: 'Edible notes like vanilla, chocolate and caramel' },
    { id: 'leather', name: 'Leather', description: 'Rich animalic and smoky leather accords' },
    { id: 'smoky', name: 'Smoky', description: 'Birch tar, incense and burnt notes' },
    { id: 'spicy', name: 'Spicy', description: 'Warming cinnamon, cardamom, pepper and clove' },
    { id: 'aquatic', name: 'Aquatic', description: 'Clean, ozonic and marine inspired scents' },
    { id: 'green', name: 'Green', description: 'Fresh galbanum, violet leaves and crushed grass' },
    { id: 'fruity', name: 'Fruity', description: 'Juicy berries, apple, peach and tropical fruits' },
    { id: 'musky', name: 'Musky', description: 'Soft, sensual and skin-like musk notes' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get category options
  function getCategoryOptions() {
    // If we have categories loaded from DB, use those
    if (categories && categories.length > 0) {
      // Filter out any categories that seem to be products (by checking name patterns)
      const validCategories = categories.filter(category => {
        // Basic check to exclude products accidentally added as categories
        // Products typically have descriptions that don't match our predefined categories
        const predefinedDescriptions = PERFUME_CATEGORIES.map(c => c.description);
        return category.description && (
          predefinedDescriptions.includes(category.description) || 
          category.description.length < 100 // Assume proper categories have shorter descriptions
        );
      });
      
      if (validCategories.length > 0) {
        return validCategories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || ''
        }));
      }
    }
    
    // Fallback to our predefined list
    return PERFUME_CATEGORIES;
  }

  async function loadData() {
    try {
      setLoading(true);
      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('brands').select('*').order('name'),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (brandsResult.error) throw brandsResult.error;

      if (productsResult.data) setProducts(productsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (brandsResult.data) setBrands(brandsResult.data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load products and categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: '',
      compare_at_price: '',
      category_id: categories[0]?.id || '',
      brand_id: brands[0]?.id || '',
      image_url: '',
      stock: '',
      featured: false,
      is_new: false,
      is_limited: false,
      volume_ml: '50',
      concentration: 'Eau de Parfum',
      year_launched: '',
      perfumer: '',
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug || '',
      description: product.description,
      short_description: product.short_description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      category_id: product.category_id || categories[0]?.id || '',
      brand_id: product.brand_id || brands[0]?.id || '',
      image_url: product.image_url,
      stock: product.stock.toString(),
      featured: product.featured,
      is_new: product.is_new,
      is_limited: product.is_limited,
      volume_ml: product.volume_ml?.toString() || '50',
      concentration: product.concentration || 'Eau de Parfum',
      year_launched: product.year_launched?.toString() || '',
      perfumer: product.perfumer || '',
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  async function uploadImage(file: File): Promise<string> {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      // Use the admin client for uploading images to bypass RLS restrictions
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from('perfume-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage.from('perfume-images').getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message || 'Please ensure the "perfume-images" storage bucket exists and RLS policies allow uploads'}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      if (file.size > 5000000) { // 5MB limit
        setError('File size too large. Maximum size is 5MB.');
        return;
      }

      setUploading(true);
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, image_url: imageUrl });
      setSuccess('Image uploaded successfully!');
      setUploading(false);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(`Failed to upload image: ${error.message || 'Please check your Supabase storage policies and try again'}`);
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      return;
    }

    if (!formData.category_id) {
      setError('Category is required');
      return;
    }

    if (!formData.volume_ml || parseInt(formData.volume_ml) <= 0) {
      setError('Valid volume is required');
      return;
    }

    const productData: any = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim(),
      short_description: formData.short_description.trim(),
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      brand_id: formData.brand_id,
      image_url: formData.image_url.trim(),
      stock: parseInt(formData.stock),
      featured: formData.featured,
      is_new: formData.is_new,
      is_limited: formData.is_limited,
      volume_ml: parseInt(formData.volume_ml),
      concentration: formData.concentration,
      updated_at: new Date().toISOString(),
    };

    if (formData.compare_at_price) {
      productData.compare_at_price = parseFloat(formData.compare_at_price);
    }

    if (formData.year_launched) {
      productData.year_launched = parseInt(formData.year_launched);
    }

    if (formData.perfumer) {
      productData.perfumer = formData.perfumer.trim();
    }

    try {
      setError(null);
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();

        if (error) throw error;
        
        setSuccess('Product updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();

        if (error) throw error;
        
        setSuccess('Product added successfully!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 1500);

      loadData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError('Failed to save product: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Product deleted successfully!');
      loadData();

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const category = categories.find(cat => cat.id === product.category_id);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement?.classList.add('hidden');
                        }}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.brand_id || 'No brand'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category ? (
                      <div>
                        <div>{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description || 'No description'}</div>
                      </div>
                    ) : product.category_id ? (
                      <span className="text-orange-500">Invalid Category ID: {product.category_id}</span>
                    ) : (
                      <span className="text-gray-400">Uncategorized</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.featured ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Featured</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Regular</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found. Add your first product to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full my-8 mx-auto max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mx-6 mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product slug (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for product listings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compare At Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Original price"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Select a perfume category"
                    >
                      <option value="" disabled>Select a category</option>
                      {getCategoryOptions().map((category) => (
                        <option key={category.id} value={category.id} title={category.description}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium text-gray-700 mb-2">Available Categories:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 max-h-40 overflow-y-auto pr-1">
                        {getCategoryOptions().map((category) => (
                          <div 
                            key={category.id} 
                            className={`flex items-start gap-2 text-xs ${formData.category_id === category.id ? 'text-blue-800 font-medium' : 'text-gray-600'}`}
                            title={category.description}
                          >
                            <span className="text-xs mt-1">•</span>
                            <div>
                              <span className="font-medium">{category.name}</span>
                              <span className="ml-1">- {category.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml) *</label>
                    <select
                      value={formData.volume_ml}
                      onChange={(e) => setFormData({ ...formData, volume_ml: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[50, 100, 200].map((volume) => (
                        <option key={volume} value={volume}>
                          {volume} ml
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Concentration</label>
                    <select
                      value={formData.concentration}
                      onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Eau de Parfum">Eau de Parfum</option>
                      <option value="Eau de Toilette">Eau de Toilette</option>
                      <option value="Extrait de Parfum">Extrait de Parfum</option>
                      <option value="Eau de Cologne">Eau de Cologne</option>
                      <option value="Parfum">Parfum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Launched</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.year_launched}
                      onChange={(e) => setFormData({ ...formData, year_launched: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Year"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfumer</label>
                  <input
                    type="text"
                    value={formData.perfumer}
                    onChange={(e) => setFormData({ ...formData, perfumer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Perfumer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement?.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Featured
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_new"
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_new" className="text-sm font-medium text-gray-700">
                      New
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_limited"
                      checked={formData.is_limited}
                      onChange={(e) => setFormData({ ...formData, is_limited: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_limited" className="text-sm font-medium text-gray-700">
                      Limited Edition
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${uploading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {uploading ? 'Wait for upload...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}