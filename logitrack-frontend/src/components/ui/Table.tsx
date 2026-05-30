// File: src/components/ui/Table.tsx
import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export const Table: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-white">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => {
  return (
    <thead className={`bg-slate-50/75 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', children, ...props }) => {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors duration-200 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => {
  return (
    <th
      className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => {
  return (
    <td className={`px-6 py-4 text-sm text-slate-600 font-medium ${className}`} {...props}>
      {children}
    </td>
  );
};
