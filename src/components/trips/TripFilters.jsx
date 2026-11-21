import { tripTypes } from "./tripText";

function TripFilters({ text, search, type, onSearch, onType, showType }) {
  return (
    <div className="trip-filters" role="search">
      <label>
        {text.search}
        <input type="search" dir="auto" value={search} placeholder={text.searchHint}
          onChange={(event) => onSearch(event.target.value)} />
      </label>
      {showType && (
        <label>
          {text.type}
          <select value={type} onChange={(event) => onType(event.target.value)}>
            <option value="">{text.allTypes}</option>
            {tripTypes.map((value) => <option key={value} value={value}>{text.types[value]}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

export default TripFilters;
