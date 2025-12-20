import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Header } from './Header';
import { Footer } from './Footer';
import { Cart } from './Cart';

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

export function JournalPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<JournalPost | null>(null);
  const [category, setCategory] = useState<JournalCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);

      // Get the post by slug
      const { data: postData, error: postError } = await supabase
        .from('journal_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (postError) throw postError;
      if (!postData) throw new Error('Post not found');

      setPost(postData);

      // Get the category
      const { data: categoryData, error: categoryError } = await supabase
        .from('journal_categories')
        .select('*')
        .eq('id', postData.category_id)
        .single();

      if (categoryError) throw categoryError;
      if (categoryData) {
        setCategory(categoryData);
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      setError('Failed to load journal post: ' + (error.message || 'Post not found'));
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Error Loading Post</h2>
          <p className="text-amber-200 mb-6">{error}</p>
          <button
            onClick={() => navigate('/journal')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Post Not Found</h2>
          <p className="text-amber-200 mb-6">The journal post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/journal')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header onCartClick={() => setShowCart(true)} />
      
      <main className="flex-grow">
        {/* Article Header */}
        <section className="py-12 bg-gradient-to-r from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link 
                to="/journal" 
                className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Link>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {category && (
                  <span className="flex items-center text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 text-amber-300">
                    <Tag className="h-4 w-4 mr-1" />
                    {category.name}
                  </span>
                )}
                
                {post.published_at && (
                  <span className="flex items-center text-sm text-amber-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                
                {post.author && (
                  <span className="flex items-center text-sm text-amber-400">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-6">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-amber-200">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-96 object-cover rounded-xl mb-12"
                />
              )}
              
              <div 
                className="prose prose-lg prose-invert max-w-none text-amber-100
                  prose-headings:text-amber-50
                  prose-p:text-amber-100
                  prose-a:text-amber-500 hover:prose-a:text-amber-400
                  prose-blockquote:border-l-amber-600
                  prose-li:text-amber-100
                  prose-strong:text-amber-50
                  prose-em:text-amber-100
                  prose-code:text-amber-100
                  prose-pre:bg-gray-800
                  prose-pre:text-amber-50
                  prose-table:text-amber-50
                  prose-table-row:border-amber-800
                  prose-hr:border-amber-700"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} onCheckout={() => {}} />
    </div>
  );
}