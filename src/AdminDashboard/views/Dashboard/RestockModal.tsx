import React from 'react'
import { RefreshCwIcon } from 'lucide-react'

interface RestockModalProps {
  isOpen: boolean
  itemId?: string
  itemName?: string
  currentStock?: number
  restockAmount: number
  restocking: string | null
  onClose: () => void
  onAmountChange: (amount: number) => void
  onConfirm: (
    id: string,
    name: string,
    currentStock: number,
    amount: number
  ) => void
}

const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  itemId,
  itemName,
  currentStock,
  restockAmount,
  restocking,
  onClose,
  onAmountChange,
  onConfirm
}) => {
  if (!isOpen || !itemId || !itemName || currentStock == null) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900">
          Restock Inventory
        </h3>

        <div className="mt-2 text-sm text-gray-500">
          <p>
            Restocking: <strong>{itemName}</strong>
          </p>
          <p>
            Current stock: <strong>{currentStock}</strong>
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restock Amount
          </label>
          <input
            type="number"
            min={1}
            value={restockAmount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onConfirm(itemId, itemName, currentStock, restockAmount)
            }
            disabled={restocking === itemId || restockAmount <= 0}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-md disabled:opacity-50"
          >
            {restocking === itemId ? (
              <span className="flex items-center">
                <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" />
                Restocking...
              </span>
            ) : (
              `Restock ${restockAmount} Units`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestockModal
