import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Product, Brand, Category, ProductNote } from '../../lib/supabase';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState<ProductNote[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<number>(100);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    if (!id) return;
    
    try {
      // Load product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (productError) throw productError;
      
      setProduct(productData);
      setSelectedVolume(productData.volume_ml);
      
      // Load brand
      if (productData.brand_id) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('*')
          .eq('id', productData.brand_id)
          .single();
        setBrand(brandData);
      }
      
      // Load category
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single();
        setCategory(categoryData);
      }
      
      // Load fragrance notes
      const { data: notesData } = await supabase
        .from('product_notes')
        .select('*')
        .eq('product_id', id)
        .order('layer');
      setNotes(notesData || []);
      
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-amber-300 text-lg">Product not found.</p>
      </div>
    );
  }

  // Group notes by layer
  const topNotes = notes.filter(note => note.layer === 'top');
  const heartNotes = notes.filter(note => note.layer === 'heart');
  const baseNotes = notes.filter(note => note.layer === 'base');

  return (
    <div className="bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          ← Back to Collection
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center p-8 shadow-xl">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            {/* Additional images */}
            {product.gallery_urls && product.gallery_urls.length > 0 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {product.gallery_urls.map((url, index) => (
                  <img 
                    key={index}
                    src={url}
                    alt={`${product.name} detail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-8">
            <div>
              {brand && (
                <h3 className="text-2xl font-bold text-amber-50">{brand.name}</h3>
              )}
              <h1 className="text-5xl font-black text-amber-50 mb-2">{product.name}</h1>
              {category && (
                <p className="text-amber-300">{category.name} • {product.concentration}</p>
              )}
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-extrabold text-amber-50">
                  {new Intl.NumberFormat('en-UG', {
                    style: 'currency',
                    currency: 'UGX',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-xl text-amber-300 line-through">
                    {new Intl.NumberFormat('en-UG', {
                      style: 'currency',
                      currency: 'UGX',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(product.compare_at_price)}
                  </p>
                )}
              </div>
              
              {product.stock > 0 ? (
                <p className="text-amber-300 mt-2">{product.stock} bottles in stock</p>
              ) : (
                <p className="text-red-500 mt-2">Out of stock</p>
              )}
            </div>
            
            {/* Volume selector - only one volume available per product in our schema */}
            <div>
              <p className="text-amber-50 mb-2">Volume</p>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                {product.volume_ml}ml
              </div>
            </div>
            
            {/* Add to cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-amber-50">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:border-amber-600"
                />
              </div>
              
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                  product.stock === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                Add to Cart
              </button>
            </div>
            
            {/* Fragrance Notes Pyramid */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-amber-50 mb-6">Fragrance Notes</h3>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Top Notes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <h4 className="font-semibold text-amber-50">Top Notes</h4>
                  </div>
                  <ul className="space-y-1">
                    {topNotes.map(note => (
                      <li key={note.id} className="text-amber-300 text-sm">• {note.note}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Heart Notes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <h4 className="font-semibold text-amber-50">Heart Notes</h4>
                  </div>
                  <ul className="space-y-1">
                    {heartNotes.map(note => (
                      <li key={note.id} className="text-amber-300 text-sm">• {note.note}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Base Notes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                    <h4 className="font-semibold text-amber-50">Base Notes</h4>
                  </div>
                  <ul className="space-y-1">
                    {baseNotes.map(note => (
                      <li key={note.id} className="text-amber-300 text-sm">• {note.note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-amber-50 mb-4">Description</h3>
              <p className="text-amber-300 leading-relaxed">{product.description}</p>
              
              {product.perfumer && (
                <p className="text-amber-300 mt-4 italic">
                  Composed by <span className="font-semibold">{product.perfumer}</span>
                </p>
              )}
              
              {product.year_launched && (
                <p className="text-amber-300 mt-2">
                  Launched in {product.year_launched}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}