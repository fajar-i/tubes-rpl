interface LoaderProps {
    fullScreen?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true, size = 'medium' }) => {
    const sizeClasses = {
        small: 'h-8 w-8 border-2',
        medium: 'h-12 w-12 border-3',
        large: 'h-16 w-16 border-4'
    };

    const containerClasses = fullScreen ? 'h-screen' : 'h-full min-h-[100px]';

    return (
        <div className={`flex flex-col justify-center items-center ${containerClasses}`}>
            <div className="relative">
                {/* Outer spinning circle */}
                <div 
                    className={`
                        ${sizeClasses[size]}
                        rounded-full 
                        border-[#E0F7FA]
                        border-t-[#00A1A9]
                        animate-spin
                    `}
                />
            </div>
            <p className="text-[#00A1A9] mt-4 text-base font-medium animate-pulse">
                Tunggu...
            </p>
        </div>
    );
};

export default Loader;