import { CheckIcon } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: 'cart' | 'shipping' | 'payment' | 'review';
  isCartEmpty?: boolean;  // Add this prop
}

export const CheckoutSteps = ({ currentStep, isCartEmpty = false }: CheckoutStepsProps) => {
  const steps = [
    { id: 'cart', number: 1, label: 'Cart' },
    { id: 'shipping', number: 2, label: 'Shipping' },
    { id: 'payment', number: 3, label: 'Payment' },
    { id: 'review', number: 4, label: 'Review' },
  ];

  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const isDisabled = isCartEmpty && index > 0; // Disable steps after cart if empty

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                (isCompleted || isCurrent) && !isDisabled 
                  ? 'bg-green-700' 
                  : 'bg-gray-300'
              }`}>
                {isCompleted && !isDisabled ? (
                  <CheckIcon className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">{step.number}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className={`ml-2 text-sm font-medium ${
                (isCompleted || isCurrent) && !isDisabled 
                  ? 'text-green-700' 
                  : 'text-gray-500'
              }`}>
                {step.label}
              </div>
              
              {/* Connector line (except after last step) */}
              {index < steps.length - 1 && (
                <div className={`h-1 w-16 mx-2 ${
                  isCompleted && !isDisabled ? 'bg-green-700' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};