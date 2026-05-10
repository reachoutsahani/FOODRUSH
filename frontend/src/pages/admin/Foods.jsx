import { useState, useEffect, useRef } from 'react';
import { foodAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Burgers', 'Pizza', 'Biryani', 'Chinese', 'South Indian', 'North Indian',
  'Desserts', 'Beverages', 'Salads', 'Rolls', 'Pasta', 'Sandwiches', 'Breakfast', 'Snacks', 'Seafood'];

const emptyForm = { name: '', description: '', price: '', category: 'Burgers', restaurant: '', preparationTime: '30', isVeg: 'false', isAvailable: 'true', isFeatured: 'false', tags: '' };

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFood, setEditFood] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data } = await foodAPI.getAll({ limit: 50 });
      setFoods(data.foods);
    } catch { toast.error('Failed to load foods'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFoods(); }, []);

  const openCreate = () => {
    setEditFood(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (food) => {
    setEditFood(food);
    setForm({
      name: food.name, description: food.description, price: food.price,
      category: food.category, restaurant: food.restaurant,
      preparationTime: food.preparationTime, isVeg: String(food.isVeg),
      isAvailable: String(food.isAvailable), isFeatured: String(food.isFeatured),
      tags: food.tags?.join(', ') || '',
    });
    setImageFile(null);
    setImagePreview(food.image);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editFood && !imageFile) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editFood) {
        await foodAPI.update(editFood._id, fd);
        toast.success('Food item updated!');
      } else {
        await foodAPI.create(fd);
        toast.success('Food item created!');
      }
      setShowModal(false);
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Delete "${food.name}"? This cannot be undone.`)) return;
    try {
      await foodAPI.delete(food._id);
      toast.success('Deleted!');
      setFoods(prev => prev.filter(f => f._id !== food._id));
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.restaurant?.toLowerCase().includes(search.toLowerCase())
  );

  const SelectField = ({ id, label, options, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select value={value} onChange={e => setForm({ ...form, [id]: e.target.value })}
        className="input-field">
        {options.map(opt => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Items</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{foods.length} items total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Food</button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or restaurant..." className="input-field max-w-sm" />
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(food => (
                  <tr key={food._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.restaurant}</p>
                      <span className={`text-xs ${food.isVeg ? 'text-green-500' : 'text-red-400'}`}>
                        {food.isVeg ? '🟢 Veg' : '🔴 Non-veg'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{food.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">₹{food.price}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${food.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {food.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {food.isFeatured ? <span className="text-amber-400 text-lg">⭐</span> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(food)}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(food)}
                          className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">No food items found</div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editFood ? 'Edit Food Item' : 'Add New Food Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Food Image {!editFood && <span className="text-red-500">*</span>}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-brand-400 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
                  ) : (
                    <div className="py-4">
                      <span className="text-4xl">📷</span>
                      <p className="text-sm text-gray-400 mt-2">Click to upload image</p>
                      <p className="text-xs text-gray-300">JPEG, PNG, WebP · Max 5MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
                {imagePreview && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="text-xs text-brand-500 hover:underline mt-1">
                    Change image
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Classic Margherita Pizza" className="input-field" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the dish..." className="input-field resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                  <input type="number" required min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="199" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prep Time (min)</label>
                  <input type="number" min="1" value={form.preparationTime} onChange={e => setForm({ ...form, preparationTime: e.target.value })}
                    className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant *</label>
                  <input type="text" required value={form.restaurant} onChange={e => setForm({ ...form, restaurant: e.target.value })}
                    placeholder="Restaurant name" className="input-field" />
                </div>

                <SelectField id="category" label="Category" options={CATEGORIES} value={form.category} />
                <SelectField id="isVeg" label="Type" options={[{ value: 'true', label: '🟢 Veg' }, { value: 'false', label: '🔴 Non-veg' }]} value={form.isVeg} />
                <SelectField id="isAvailable" label="Availability" options={[{ value: 'true', label: '✅ Available' }, { value: 'false', label: '❌ Unavailable' }]} value={form.isAvailable} />
                <SelectField id="isFeatured" label="Featured?" options={[{ value: 'false', label: '⬜ No' }, { value: 'true', label: '⭐ Yes' }]} value={form.isFeatured} />

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="spicy, bestseller, new" className="input-field" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editFood ? 'Update Food' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
