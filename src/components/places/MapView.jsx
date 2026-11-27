import { t } from '../../pages/places/placesText'

// OpenStreetMap embed: free, no key, no extra package.
export default function MapView({ lat, lng, name }) {
  const pad = 0.03
  const bbox = [lng - pad, lat - pad, lng + pad, lat + pad].join(',')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`

  return (
    <div className="pl-map">
      <iframe title={t.details.mapTitle(name)} src={src} loading="lazy" />
      <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`} target="_blank" rel="noreferrer">
        {t.details.openMap}
      </a>
    </div>
  )
}
