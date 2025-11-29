// pages/admin/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.push('/');
    }
  }, [role, loading, router]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchProducts();
    }
  }, [role]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
    });
  };

  const handleCancel = () => {
    setForm({
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        image_url: form.image_url,
      };

      if (payload.stock < 0 || payload.price < 0 || Number.isNaN(payload.price)) {
        alert('Harga dan stok harus valid dan tidak negatif.');
        setSaving(false);
        return;
      }

      let res;
      if (form.id) {
        res = await fetch(`/api/products/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menyimpan produk');
      }

      await fetchProducts();
      handleCancel();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus');
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || role !== 'admin') {
    return <p>Memuat...</p>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="admin-layout">
        <section className="admin-form-section">
          <h2>{form.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <label>
              Nama Produk
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Deskripsi
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <label>
              Harga (Rp)
              <input
                type="number"
                name="price"
                min="0"
                step="1000"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Stok
              <input
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              URL Gambar Produk
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
              />
            </label>

            <div className="admin-form-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              {form.id && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleCancel}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-table-section">
          <h2>Daftar Produk</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Gambar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5}>Belum ada produk.</td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.image_url && (
                      <a href={p.image_url} target="_blank" rel="noreferrer">
                        Lihat
                      </a>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-link danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
