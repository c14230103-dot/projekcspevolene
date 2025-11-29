// pages/api/checkout.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { cart } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: 'Keranjang kosong' });
  }

  const ids = cart.map((item) => item.product.id);
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);

  if (error) return res.status(500).json({ message: error.message });

  // Validasi stok
  for (const item of cart) {
    const productInDb = products.find((p) => p.id === item.product.id);
    if (!productInDb) {
      return res
        .status(400)
        .json({ message: `Produk ${item.product.name} tidak ditemukan` });
    }
    if (item.quantity > productInDb.stock) {
      return res.status(400).json({
        message: `Stok ${productInDb.name} tidak mencukupi (tersisa ${productInDb.stock})`,
      });
    }
  }

  // Hitung total
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Update stok di database
  for (const item of cart) {
    const productInDb = products.find((p) => p.id === item.product.id);
    const newStock = productInDb.stock - item.quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productInDb.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }
  }

  // Simulasi penyimpanan order (opsional, tapi bagus untuk laporan)
  const randomBank = generateRandomBankAccount();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes?.user?.id || null;

  const { error: orderErr } = await supabase.from('orders').insert({
    user_id: userId,
    total_amount: total,
    bank_account: randomBank,
  });

  if (orderErr) {
    // tidak fatal untuk simulasi, tapi tetap diinformasikan jika mau
    console.error(orderErr);
  }

  return res.status(200).json({
    success: true,
    total,
    bankAccount: randomBank,
  });
}

function generateRandomBankAccount() {
  const bankNames = ['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB'];
  const bank = bankNames[Math.floor(Math.random() * bankNames.length)];
  const number =
    Math.floor(Math.random() * 9000000000) + 1000000000; // 10 digit
  return `${bank} - ${number}`;
}
