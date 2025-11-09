import { useRef, useState, useEffect } from "react";

export default function EditableText({
  text,
  onBlur,
  className = "",
}: {
  text: string;
  onBlur: (value: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  
  // 1. Ubah Ref ke HTMLTextAreaElement
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 2. Tambahkan useEffect untuk sinkronisasi
  // Ini penting jika 'text' prop berubah dari luar
  useEffect(() => {
    setValue(text);
  }, [text]);

  const handleClick = () => {
    setIsEditing(true);
    // 3. Sesuaikan fokus ke ref yang baru
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const handleBlur = () => {
    setIsEditing(false);
    let finalValue = value;
    if (!finalValue) {
      finalValue = "Text harus diisi";
      setValue(finalValue); // Update state internal juga
    }
    
    if (finalValue !== text) {
      onBlur(finalValue);
    }
  };

  return isEditing ? (
    // 4. Ganti <input> menjadi <textarea>
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={`w-full p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md dark:bg-gray-700 dark:text-white ${className}`}
      style={{ minHeight: '100px' }} // Tambahkan tinggi minimal
    />
  ) : (
    // 5. Tambahkan 'whitespace-pre-wrap' dan tampilkan 'value'
    <div
      onClick={handleClick}
      className={`cursor-pointer border-b border-gray-300 dark:border-gray-600 py-1 ${className} whitespace-pre-wrap`}
      style={{ minHeight: '1.5em' }} // Beri tinggi minimal agar mudah diklik
    >
      {value || "Text harus diisi"}
    </div>
  );
}