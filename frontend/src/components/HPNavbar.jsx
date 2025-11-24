import React from "react";
import LOGO from "../../public/images/logo1.png";
import { useNavigate } from "react-router-dom";
import SearchBar from "./Input/SearchBar";

const HPNavbar = ({ searchQuery, setSearchQuery, onSearchNote, handleClearSearch }) => {
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery) {
            onSearchNote(searchQuery);
        }
    };

    const onClearSearch = () => {
        handleClearSearch();
        setSearchQuery("");
    };

    return (
        <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
            <img src={LOGO} alt="travel story" className="h-25 mx-15" onClick={() => navigate("/")}/>
            
            <div className="flex items-center gap-4">
                <SearchBar
                    value={searchQuery}
                    onChange={({ target }) => setSearchQuery(target.value)}
                    handleSearch={handleSearch}
                    onClearSearch={onClearSearch}
                />                
            </div>
            <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    onClick={() => navigate("/login")}
                >
                    Login / Signup
                </button>
        </div>
    );
};

export default HPNavbar;
