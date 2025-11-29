// pages/api/products/index.js
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const { name, description, price, stock, image_url } = req.body;
    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: 'Data produk tidak lengkap' });
    }
    if (price < 0 || stock < 0) {
      return res
        .status(400)
        .json({ message: 'Harga dan stok tidak boleh negatif' });
    }

    const { data, error } = await supabase.from('products').insert({
      name,
      description,
      price,
      stock,
      image_url,
    });

    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
