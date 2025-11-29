// components/ProductCard.js
export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
        />
      )}
      <h3 className="product-title">{product.name}</h3>
      <p className="product-price">
        Rp {Number(product.price).toLocaleString('id-ID')}
      </p>
      <p className="product-stock">Stok: {product.stock}</p>
      <p className="product-desc">{product.description}</p>
      <button
        disabled={product.stock === 0}
        onClick={() => onAddToCart(product)}
        className="btn-primary"
      >
        {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
      </button>
    </div>
  );
}
