import { Route, Routes } from 'react-router-dom'
import PlacesLayout from './components/places/PlacesLayout'
import EquipmentPage from './pages/equipment/EquipmentPage'
import HomePage from './pages/home/HomePage'
import ComparePage from './pages/places/ComparePage'
import NotFoundPage from './pages/places/NotFoundPage'
import PlaceDetailsPage from './pages/places/PlaceDetailsPage'
import PlacesPage from './pages/places/PlacesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PlacesLayout />}>
        <Route index element={<HomePage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="places/:id" element={<PlaceDetailsPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="equipment" element={<EquipmentPage />} />
    </Routes>
  )
}
