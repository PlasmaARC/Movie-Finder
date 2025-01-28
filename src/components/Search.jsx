import search from "../assets/search.svg";

// eslint-disable-next-line react/prop-types
const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src={search} alt="A serach Image" />
        <input type="text" placeholder="Search through thousand Movies"
        value={searchTerm}
        onChange={(e)=> setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
