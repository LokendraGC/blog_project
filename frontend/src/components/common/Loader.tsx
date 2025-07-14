const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="w-full absolute top-0 left-0 h-1 bg-blue-600 animate-pulse transition-all duration-500 ease-in-out" />
            <span className="text-blue-600 font-semibold">Loading...</span>
        </div>
    );
};

export default Loader;