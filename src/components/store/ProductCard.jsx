import { Link, useLocation } from 'react-router-dom'
import { useStoreLocale } from '../../pages/store/storeLocale.js'

export default function ProductCard({ product, onAdd, canAdd }) {
  const { t } = useStoreLocale()
  const location = useLocation()
  const inStock = Number(product.stock) > 0
  return (
    <article className="store-product-card">
      <Link className="store-product-image-link" to={`/store/${product.id}`}>
        {product.image_url ? (
          <img className="store-product-image" src={product.image_url} alt={product.name} />
        ) : (
          <div className="store-product-image store-product-image-placeholder" aria-label={t('No image available')}>
            FUSHA
          </div>
        )}
      </Link>
      <div className="store-product-info">
        <span className="store-category">{product.category || t('Trip gear')}</span>
        <h2><Link to={`/store/${product.id}`}>{product.name}</Link></h2>
        <p className="store-product-description">{product.description || t('Practical gear for your next adventure.')}</p>
        <div className="store-product-footer">
          <strong>{Number(product.price).toFixed(2)} ₪</strong>
          {canAdd || !inStock ? (
            <button type="button" onClick={() => onAdd(product)} disabled={!inStock}>
              {inStock ? t('Add to cart') : t('Out of stock')}
            </button>
          ) : (
            <Link className="store-primary-button" to="/login" state={{ from: location }}>{t('Sign in to add to cart')}</Link>
          )}
        </div>
      </div>
    </article>
  )
}
