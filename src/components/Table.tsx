import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  className?: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  rowKey?: string;
  className?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  emptyMessage?: React.ReactNode;
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  rowKey = 'id',
  className = 'min-w-full divide-y divide-gray-200',
  theadClassName = 'bg-gray-50',
  tbodyClassName = 'bg-white divide-y divide-gray-200',
  emptyMessage = <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">No data found.</td></tr>,
  children,
}) => (
  <div className="overflow-x-auto">
    <table className={className}>
      <thead className={theadClassName}>
        <tr>
          {columns.map(col => (
            <th key={col.key} className={col.className || 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={tbodyClassName}>
        {data.length === 0
          ? emptyMessage
          : data.map(row => (
              <tr key={row[rowKey] || Math.random()} className="hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={col.className || 'px-6 py-4 whitespace-nowrap text-sm text-gray-700'}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
      {children}
    </table>
  </div>
);

export default Table;
