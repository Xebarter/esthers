import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, AlertCircle, Upload, X } from 'lucide-react';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface JournalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: string;
  author: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function JournalManagement() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = document.createElement('input'); // Just for type reference

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_id: '',
    author: '',
    published: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [postsResult, categoriesResult] = await Promise.all([
        supabase.from('journal_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('journal_categories').select('*').order('name'),
      ]);

      if (postsResult.error) throw postsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      if (postsResult.data) setPosts(postsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load journal posts and categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      category_id: categories[0]?.id || '',
      author: '',
      published: false,
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  function openEditModal(post: JournalPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      category_id: post.category_id || categories[0]?.id || '',
      author: post.author,
      published: post.published,
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  }

  async function uploadImage(file: File): Promise<string> {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `journal-${Date.now()}-${Math.random()}.${fileExt}`;

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
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(`Failed to upload image: ${error.message || 'Please check your Supabase storage policies and try again'}`);
      setUploading(false);
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (!formData.category_id) {
      setError('Category is required');
      return;
    }

    const postData: any = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      image_url: formData.image_url.trim(),
      category_id: formData.category_id,
      author: formData.author.trim(),
      published: formData.published,
      updated_at: new Date().toISOString(),
    };

    if (formData.published && !editingPost?.published) {
      postData.published_at = new Date().toISOString();
    }

    try {
      setError(null);
      if (editingPost) {
        const { error } = await supabase
          .from('journal_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        setSuccess('Journal post updated successfully!');
      } else {
        const { error } = await supabase
          .from('journal_posts')
          .insert(postData);

        if (error) throw error;
        setSuccess('Journal post added successfully!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 1500);

      loadData();
    } catch (error: any) {
      console.error('Error saving journal post:', error);
      setError('Failed to save journal post: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this journal post? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('journal_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Journal post deleted successfully!');
      loadData();

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting journal post:', error);
      setError('Failed to delete journal post: ' + error.message);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-50">Journal Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Post
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

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Published</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {posts.map((post) => {
              const category = categories.find(cat => cat.id === post.category_id);
              return (
                <tr key={post.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-amber-50">{post.title}</div>
                    <div className="text-sm text-amber-300">{post.excerpt.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-amber-200">
                    {category ? category.name : 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-amber-200">
                    {post.author || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {post.published ? (
                      <span className="px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-amber-200">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium flex gap-2">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-2 text-amber-400 hover:bg-amber-900/50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-400 hover:bg-red-900/50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-amber-200">No journal posts found. Add your first post to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8 mx-auto max-h-[calc(100vh-2rem)] flex flex-col border border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-amber-50">
                  {editingPost ? 'Edit Journal Post' : 'Add Journal Post'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors text-amber-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mx-6 mt-4 p-3 bg-green-900/50 text-green-200 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                      placeholder="Enter post title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                      placeholder="Enter URL slug (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-1">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                    placeholder="Brief summary of the post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-1">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                    placeholder="Full post content"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-1">Category *</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-200 mb-1">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-1">Featured Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-50"
                      placeholder="https://example.com/image.jpg"
                    />
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-gray-700 text-amber-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </label>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-700"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-amber-200">
                    Published
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${uploading
                      ? 'bg-amber-900 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                  >
                    {uploading ? 'Wait for upload...' : (editingPost ? 'Update Post' : 'Add Post')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 text-amber-200 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
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