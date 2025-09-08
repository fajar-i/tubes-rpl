"use client";

interface HeaderProps {
  userEmail: string;
  userRole: string;
}

const Header = ({ userEmail, userRole }: HeaderProps) => {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white p-4 border-b border-gray-200 flex justify-end items-center">
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-800">{userEmail}</p>
          <p className="text-xs text-gray-500">{userRole}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Header;
