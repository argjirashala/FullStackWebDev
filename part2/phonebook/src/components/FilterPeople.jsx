const FilterPeople = ({ filter, handleFilterChange }) => (
    <div>
      filter shown with <input value={filter} onChange={handleFilterChange} />
    </div>
)

export default FilterPeople