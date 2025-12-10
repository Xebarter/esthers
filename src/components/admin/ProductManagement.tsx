import { useState, useEffect, FormEvent, useRef } from 'react';
import { supabase, supabaseAdmin, Product, Category, formatCurrency } from '../../lib/supabase';
import { Plus, Edit, Trash2, X, AlertCircle, Upload } from 'lucide-react';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    sizes: '',
    colors: '',
    stock: '',
    featured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      if (productsResult.data) setProducts(productsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
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
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      image_url: '',
      sizes: '',
      colors: '',
      stock: '',
      featured: false,
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id || categories[0]?.id || '',
      image_url: product.image_url,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock: product.stock.toString(),
      featured: product.featured,
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
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message || 'Please ensure the "images" storage bucket exists and RLS policies allow uploads'}`);
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

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url.trim(),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      stock: parseInt(formData.stock),
      featured: formData.featured,
      updated_at: new Date().toISOString(),
    };

    try {
      setError(null);
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        setSuccess('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

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
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category ? category.name : 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
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
                    </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="mt-1 text-sm text-gray-500">Or upload an image below</p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${uploading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="e.g., 6, 7, 8, 9, 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="e.g., Black, White, Blue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
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