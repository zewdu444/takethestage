import React from 'react';
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 

interface SearchBarProps {
    search: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange, onSearchClick }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSearchClick();
        }
    };

    return (
        <div className="flex mb-4">
            <Input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={onSearchChange}
                onKeyDown={handleKeyDown}
                className="mr-2"
            />
            <Button onClick={onSearchClick}>Search</Button>
        </div>
    );
};

export default SearchBar;