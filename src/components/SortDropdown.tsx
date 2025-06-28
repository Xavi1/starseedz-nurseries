import React, { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon } from 'lucide-react';
type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};
export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = [{
    value: 'featured',
    label: 'Featured'
  }, {
    value: 'price-low',
    label: 'Price: Low to High'
  }, {
    value: 'price-high',
    label: 'Price: High to Low'
  }, {
    value: 'name-asc',
    label: 'Name: A to Z'
  }, {
    value: 'name-desc',
    label: 'Name: Z to A'
  }, {
    value: 'rating',
    label: 'Top Rated'
  }];
  const selectedOption = options.find(option => option.value === value) || options[0];
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  return <div className="relative" ref={dropdownRef}>
      <button type="button" className="flex items-center justify-between w-full sm:w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
        <span>Sort by: {selectedOption.label}</span>
        <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
      </button>
      {isOpen && <div className="absolute right-0 z-10 w-full sm:w-48 mt-1 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map(option => <button key={option.value} onClick={() => handleSelect(option.value)} className={`block px-4 py-2 text-sm w-full text-left ${option.value === value ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                {option.label}
              </button>)}
          </div>
        </div>}
    </div>;
};