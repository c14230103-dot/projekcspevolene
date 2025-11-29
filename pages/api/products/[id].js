// pages/api/products/[id].js
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, description, price, stock, image_url } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: 'Data produk tidak lengkap' });
    }
    if (price < 0 || stock < 0) {
      return res
        .status(400)
        .json({ message: 'Harga dan stok tidak boleh negatif' });
    }

    const { error } = await supabase
      .from('products')
      .update({ name, description, price, stock, image_url })
      .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ message: 'Produk terupdate' });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ message: 'Produk terhapus' });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
