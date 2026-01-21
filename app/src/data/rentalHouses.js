import rentalHouses from './rental-houses.json';

const formatRentalHouseDetails = (house) => {
  const parts = [house?.address, house?.phone].filter(Boolean);
  return parts.join(' | ');
};

const formatRentalHouseValue = (house) => {
  if (!house) {
    return '';
  }
  if (house.value) {
    return house.value;
  }
  const details = formatRentalHouseDetails(house);
  return [house.name, details].filter(Boolean).join(' | ');
};

const rentalHouseSuggestions = rentalHouses
  .map((house) => {
    const details = formatRentalHouseDetails(house);
    return {
      name: house.name,
      details,
      value: formatRentalHouseValue(house)
    };
  })
  .filter((house) => house.name);

export { rentalHouseSuggestions, formatRentalHouseValue };
