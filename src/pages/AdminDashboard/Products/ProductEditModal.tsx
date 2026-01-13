import React from 'react';

interface ProductEditModalProps {
  show: boolean;
  form: any;
  showEditConfirm: boolean;
  onCancelEditSave: () => void;
  onConfirmEditSave: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  show,
  form,
  showEditConfirm,
  onCancelEditSave,
  onConfirmEditSave,
  onClose,
  children,
}) => {
  if (!show || !form) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Confirmation Popup */}
      {showEditConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center w-full">Confirm Save Changes</h3>
            <p className="mb-6 text-gray-700 text-center">Are you sure you want to save changes to this product?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={onCancelEditSave} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirmEditSave} 
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
        {children}
      </div>
    </div>
  );
};

export default ProductEditModal;
