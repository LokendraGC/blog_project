import { useEffect, useState } from "react";
import { Input } from "./ui/input"
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Search = ({ placeholder }: { placeholder: string }) => {

    const searchParams = useSearchParams();
    const [query, setQuery] = useState('');
    const pathname = usePathname();
    const { replace } = useRouter();


    const handleSearch = (term: string) => {

        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }

        replace(`${pathname}?${params.toString()}`);

    }

    useEffect(() => {
        const currentQuery = searchParams.get('query') || '';
        setQuery(currentQuery);
    }, [pathname, searchParams.toString()]);

    return (

        <div className="relative ml-8">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 4a7 7 0 017 7c0 1.65-.56 3.17-1.5 4.38l4.12 4.12a1 1 0 01-1.42 1.42l-4.12-4.12A7 7 0 1111 4z" />
                </svg>
            </span>

            <Input
                className="pl-10 pr-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border border-gray-300 dark:border-gray-600 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                value={query}
                placeholder={placeholder}
                onChange={(e) => {
                    setQuery(e.target.value);
                    handleSearch(e.target.value);
                }}
            />
        </div>
    )
}

export default Search