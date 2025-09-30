import React from 'react';

interface FormattedDateProps {
  date: string | Date | undefined | null;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date }) => {
  if (!date) return null;
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return (
    <span>{`${yyyy}-${mm}-${dd} at ${hours}:${minutes} ${ampm}`}</span>
  );
};

export default FormattedDate;
