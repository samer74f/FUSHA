import { Link } from 'react-router-dom'

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="store-product-card">
      <Link className="store-product-image-link" to={`/store/${product.id}`}>
        {product.image_url ? (
          <img className="store-product-image" src={product.image_url} alt={product.name} />
        ) : (
          <div className="store-product-image store-product-image-placeholder" aria-label="No image available">
            FUSHA
          </div>
        )}
      </Link>
      <div className="store-product-info">
        <span className="store-category">{product.category || 'Trip gear'}</span>
        <h2><Link to={`/store/${product.id}`}>{product.name}</Link></h2>
        <p className="store-product-description">{product.description || 'Practical gear for your next adventure.'}</p>
        <div className="store-product-footer">
          <strong>{Number(product.price).toFixed(2)} ₪</strong>
          <button type="button" onClick={() => onAdd(product)} disabled={Number(product.stock) <= 0}>
            {Number(product.stock) > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
        </div>
      </div>
    </article>
  )
}
