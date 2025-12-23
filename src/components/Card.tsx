import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  linkText?: string;
  onLinkClick?: () => void;
  linkHref?: string;
}

const Card: React.FC<CardProps> = ({ icon, title, value, linkText, onLinkClick, linkHref }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    {linkText && (
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <a
            href={linkHref || '#'}
            className="font-medium text-green-700 hover:text-green-900 flex items-center"
            onClick={e => {
              if (onLinkClick) {
                e.preventDefault();
                onLinkClick();
              }
            }}
          >
            {linkText}
            <span className="ml-1 h-4 w-4">&rarr;</span>
          </a>
        </div>
      </div>
    )}
  </div>
);

export default Card;
