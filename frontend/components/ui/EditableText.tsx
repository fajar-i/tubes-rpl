import { useRef, useState } from "react";

export default function EditableText({
  text,
  onBlur,
  className = '',
}: {
  text: string;
  onBlur: (value: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!value) setValue('Text harus diisi');
    if (value !== text) onBlur(value);
  };

  return isEditing ? (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={`w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md dark:bg-gray-700 dark:text-white ${className}`}
    />
  ) : (
    <div onClick={handleClick} className={`cursor-pointer border-b border-gray-300 dark:border-gray-600 py-1 ${className}`}>
      {text || 'Text harus diisi'}
    </div>
  );
}