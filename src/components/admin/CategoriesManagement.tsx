import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

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

  async function loadData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setCategories(data);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || ''
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    // Prevent adding categories that look like products
    if (formData.name.includes(':') || formData.name.length > 50) {
      setError('Invalid category name. Category names should be short and not contain colons.');
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim()
    };

    try {
      setError(null);
      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select();

        if (error) throw error;
        setSuccess('Category updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert(categoryData)
          .select();

        if (error) throw error;
        setSuccess('Category added successfully!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 1500);

      loadData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError('Failed to save category: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      // Check if category is used by any products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        setError('Cannot delete category because it is assigned to one or more products.');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Category deleted successfully!');
      loadData();

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category: ' + error.message);
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
        <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Category
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Categories</h2>
        <p className="text-gray-600 mb-4">These are industry-standard perfume categories you can use:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERFUME_CATEGORIES.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-800 p-6 pb-0">Custom Categories</h2>
        <table className="w-full mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {category.description || 'No description'}
                </td>
                <td className="px-6 py-4 text-sm font-medium flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No custom categories found. Add your first category to get started!</p>
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
                  {editingCategory ? 'Edit Category' : 'Add Category'}
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
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category slug (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category description"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
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