{/* Previous imports remain unchanged */}

export default function Products() {
  // Previous state declarations remain unchanged

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    wholesale_price: '', // Add wholesale price
    discount_price: '', // Add discount price
    vendor_id: '',
    category_id: '',
    status: 'active',
    image: '',
    gallery: [],
    video: '',
    stock: 0,
    addons: [],
    type: 'regular',
    variants: [],
    wholesale_prices: [] // Add wholesale prices array for different tiers
  });

  // Rest of the component remains the same until the form

  return (
    <div className="space-y-6">
      {/* Previous JSX remains unchanged until the form */}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Previous form fields remain unchanged */}

        {formData.type === 'regular' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (₪)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الجملة (₪)
              </label>
              <input
                type="number"
                value={formData.wholesale_price}
                onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر التخفيض (₪)
              </label>
              <input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Add WholesalePrices component for tier-specific pricing */}
        <div className="col-span-1 md:col-span-2">
          <WholesalePrices
            prices={formData.wholesale_prices}
            onChange={(prices) => setFormData({ ...formData, wholesale_prices: prices })}
          />
        </div>

        {/* Rest of the form remains unchanged */}
      </form>

      {/* Rest of the component remains unchanged */}
    </div>
  );
}