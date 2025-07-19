import { CheckIcon } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: 'cart' | 'shipping' | 'payment' | 'review';
  isCartEmpty?: boolean;
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
    <div className="mb-6 md:mb-8 px-4">
      {/* Mobile - Compact View */}
      <div className="md:hidden flex flex-col items-center">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Step {currentIndex + 1} of {steps.length}: {steps[currentIndex].label}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full" 
            style={{ width: `${(currentIndex + 1) * 25}%` }}
          ></div>
        </div>
      </div>

      {/* Desktop - Full Steps View */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isDisabled = isCartEmpty && index > 0;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className={`
                rounded-full h-6 w-6 md:h-8 md:w-8 flex items-center justify-center
                ${(isCompleted || isCurrent) && !isDisabled ? 'bg-green-600' : 'bg-gray-300'}
              `}>
                {isCompleted && !isDisabled ? (
                  <CheckIcon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                ) : (
                  <span className="text-white text-xs md:text-sm font-medium">
                    {step.number}
                  </span>
                )}
              </div>
              
              {/* Step label - hidden on smallest screens */}
              <div className={`
                ml-1 md:ml-2 text-xs md:text-sm font-medium
                ${(isCompleted || isCurrent) && !isDisabled ? 'text-green-600' : 'text-gray-500'}
                hidden sm:block
              `}>
                {step.label}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  h-1 w-8 md:w-16 mx-1 md:mx-2
                  ${isCompleted && !isDisabled ? 'bg-green-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};