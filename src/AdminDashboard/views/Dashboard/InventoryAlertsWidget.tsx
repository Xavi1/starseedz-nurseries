import React from 'react'
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react'

/* ---------- Types ---------- */
export interface InventoryAlertItem {
  id: string
  name: string
  sku: string
  image: string
  stock: number
  threshold: number
}

interface RestockModalState {
  isOpen: boolean
  itemId?: string
  itemName?: string
  currentStock?: number
  restockAmount: number
}

interface InventoryAlertsWidgetProps {
  inventoryAlerts: InventoryAlertItem[]
  activeNavSetter: (nav: string) => void
  restocking: string | null
  openRestockModal: (id: string, name: string, stock: number) => void
  restockModal: RestockModalState
  setRestockModal: React.Dispatch<React.SetStateAction<RestockModalState>>
  handleRestockAmountChange: (amount: number) => void
  handleRestock: (
    id: string,
    name: string,
    currentStock: number,
    amount: number
  ) => void
}

/* ---------- Component ---------- */
const InventoryAlertsWidget: React.FC<InventoryAlertsWidgetProps> = ({
  inventoryAlerts,
  activeNavSetter,
  restocking,
  openRestockModal,
  restockModal,
  setRestockModal,
  handleRestockAmountChange,
  handleRestock
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Inventory Alerts
          {inventoryAlerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {inventoryAlerts.length} alert(s)
            </span>
          )}
        </h3>

        <a
          href="#"
          className="text-sm font-medium text-green-700 hover:text-green-900"
          onClick={(e) => {
            e.preventDefault()
            activeNavSetter('products')
          }}
        >
          View all inventory
        </a>
      </div>

      {/* Alerts List */}
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {inventoryAlerts.map((item) => (
            <li
              key={item.id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item.stock}
                      <span className="text-gray-500">
                        {' '} / {item.threshold}
                      </span>
                    </p>
                    <p className="text-xs text-red-500">Low stock</p>
                  </div>

                  <button
                    onClick={() =>
                      openRestockModal(item.id, item.name, item.stock)
                    }
                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {restocking === item.id ? (
                      <RefreshCwIcon className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <RefreshCwIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {restocking === item.id ? 'Restocking...' : 'Restock'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Restock Modal */}
      {restockModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900">
              Restock Inventory
            </h3>

            <div className="mt-2 text-sm text-gray-500">
              <p>
                Restocking: <strong>{restockModal.itemName}</strong>
              </p>
              <p>
                Current stock:{' '}
                <strong>{restockModal.currentStock}</strong>
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restock Amount
              </label>
              <input
                type="number"
                min={1}
                value={restockModal.restockAmount}
                onChange={(e) =>
                  handleRestockAmountChange(Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() =>
                  setRestockModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 text-sm border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleRestock(
                    restockModal.itemId!,
                    restockModal.itemName!,
                    restockModal.currentStock!,
                    restockModal.restockAmount
                  )
                }
                disabled={
                  restocking === restockModal.itemId ||
                  restockModal.restockAmount <= 0
                }
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md disabled:opacity-50"
              >
                {restocking === restockModal.itemId
                  ? 'Restocking...'
                  : `Restock ${restockModal.restockAmount} Units`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryAlertsWidget
