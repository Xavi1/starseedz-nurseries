import React from "react";
import { CheckCircleIcon, ClockIcon, ChevronRightIcon } from "lucide-react";
import { format } from "date-fns";

interface TrackingStep {
  label: string;
  status: "complete" | "current" | "upcoming";
}

interface OrderTrackingWidgetProps {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  estimatedDelivery: string;
  trackingUrl?: string;
}



const getStepIndex = (status: string) => {
  switch (status) {
    case "Pending": return 0;
    case "Processing": return 1;
    case "Shipped": return 2;
    case "Delivered": return 3;
    default: return 0;
  }
};

export const OrderTrackingWidget: React.FC<OrderTrackingWidgetProps> = ({ status, estimatedDelivery, trackingUrl }) => {
  const currentStep = getStepIndex(status);
  let readableDelivery = estimatedDelivery;
  try {
    const date = new Date(estimatedDelivery);
    if (!isNaN(date.getTime())) {
      readableDelivery = format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
    }
  } catch {
    // Ignore invalid date format
  }
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 mt-6">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Tracking</h3>
      </div>
      <div className="px-5 pt-6 pb-4">
        <ol className="flex items-center justify-between w-full">
          {["Placed", "Processed", "Shipped", "Delivered"].map((step, idx) => (
            <li key={step} className="flex-1 flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1
                ${idx < currentStep ? "bg-green-600" : idx === currentStep ? "bg-green-100" : "bg-gray-200"}
              `}>
                {idx < currentStep ? (
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                ) : idx === currentStep ? (
                  <ClockIcon className="h-5 w-5 text-green-700" />
                ) : (
                  <span className="block w-3 h-3 bg-gray-400 rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${idx <= currentStep ? "text-green-700" : "text-gray-400"}`}>{step}</span>
              {idx < 3 && <div className={`w-8 h-0.5 ${idx < currentStep ? "bg-green-600" : "bg-gray-200"}`}></div>}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Estimated Delivery</p>
            <p className="text-sm font-medium text-gray-900">{readableDelivery}</p>
          </div>
          {trackingUrl && (
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-green-700 text-white text-xs font-semibold rounded-md shadow hover:bg-green-800 transition">
              Track Package <ChevronRightIcon className="ml-2 h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingWidget;
