import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface TabProps {
  params: string;
  children: React.ReactNode;
  title: string;
}

interface LinkItem {
  href: string;
  title: string;
}

const Tabs: React.FC<TabProps> = ({ params, children, title }) => {
  const pathname = usePathname();
  const link: LinkItem[] = [
    {
      href: `/dashboard/project/${params}/form`,
      title: "Soal",
    },
    {
      href: `/dashboard/project/${params}/analisis_ai`,
      title: "Analisis AI"
    },
    {
      href: `/dashboard/project/${params}/jawaban`,
      title: "Jawaban",
    },
    {
      href: `/dashboard/project/${params}/result`,
      title: "Hasil",
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <div className="mb-4 border-b border-gray-200">
        <ul
          className="flex flex-wrap -mb-px text-sm font-medium text-center"
          role="tablist"
        >
          {link.map((item, index) => (
            <li key={index} className="me-2" role="presentation">
              <Link
                href={item.href}
                className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 ${
                  pathname === item.href
                    ? 'border-[#00A1A9] text-[#00A1A9]'
                    : 'border-transparent'
                }`}
                role="tab"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {children}
    </div>
  );
};

export default Tabs;
