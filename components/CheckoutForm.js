import { useState } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const streetTypeAbbreviations = {
    Street: "ST",
    Avenue: "AVE",
    Boulevard: "BLVD",
    Drive: "DR",
    Road: "RD",
    Lane: "LN",
    Court: "CT",
    Parkway: "PKWY",
    Place: "PL",
    Square: "SQ",
    Trail: "TRL",
    Terrace: "TER",
    Highway: "HWY",
    Circle: "CIR",
    Way: "WAY",
    Loop: "LOOP",
  };

const stateAbbreviations = {
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
  };  

export default function CheckoutForm({ onSubmit, onOpenModal }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const handlePlaceSelect = () => {
    const place = window.autocomplete.getPlace();

    let streetAddress = "";
    let streetNumber = "";
    let route = "";
    let city = "";
    let formattedState = "";
    let state = "";
    let zipCode = "";
    let zipCodeSuffix = "";
    let country = "";

    // Extract the components from the place object
    place.address_components.forEach((component) => {
      if (component.types.includes("street_number")) {
        streetAddress = component.long_name + " " + streetAddress;
        streetNumber = component.long_name || "";
      }
      if (component.types.includes("route")) {
        streetAddress += component.long_name;
        // Convert street type to an acronym
        const routeParts = component.long_name.split(" ");
        const lastWord = routeParts.pop();
        const streetType = streetTypeAbbreviations[lastWord] || lastWord;
        route = (routeParts.join(" ") + " " + streetType) || "";
      }
      if (component.types.includes("locality")) {
        city = component.long_name || "";
      }
      if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name || "";
        // Convert full state name to abbreviation
        formattedState = stateAbbreviations[component.long_name] || component.long_name;
      }
      if (component.types.includes("postal_code")) {
        zipCode = component.long_name || "";
      }
      if (component.types.includes("postal_code_suffix")) {
        zipCodeSuffix = component.long_name || "";
      }
      if (component.types.includes("country")) {
        country = component.long_name || "";
      }
    });

    // Combine ZIP and ZIP+4 if both exist
    const fullZipCode = zipCodeSuffix ? `${zipCode}-${zipCodeSuffix}` : zipCode;

    // Format the final address
    const formattedNames = `${formData.firstName} ${formData.lastName}`;
    const formattedRoute = `${streetNumber} ${route}`.toUpperCase();
    const formattedCityStateZipCode = `${city}, ${formattedState} ${fullZipCode}`.toUpperCase();
    const formattedAddress = `${formattedNames}${formattedRoute}${formattedCityStateZipCode}${country}`;

    console.log("formattedAddress: ", formattedAddress);

    setFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: streetAddress || "",
        formattedAddress: formattedAddress,
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        country: country || "",
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    console.log('Opening modal...');
    onOpenModal();
  };
  
  const YOUR_GOOGLE_API_KEY = "AIzaSyD-9yXsoTGIKhwrMe2wEWGpHQLfGkKJcd0"

  return (
    <LoadScript googleMapsApiKey={YOUR_GOOGLE_API_KEY} libraries={['places']}>
      {/* 
        Container with spacing so it matches your original layout,
        but no border, no card outline, no title/subtitle.
      */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                         rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                         rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Address + Autocomplete */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <Autocomplete
            onLoad={(autocomplete) => (window.autocomplete = autocomplete)}
            onPlaceChanged={handlePlaceSelect}
          >
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                         rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
              placeholder="Street address"
            />
          </Autocomplete>
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                       rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
            placeholder="Enter city"
          />
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                       rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
            placeholder="Enter state"
          />
        </div>

        {/* Zip */}
        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700"
          >
            Zip Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                       rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
            placeholder="12345"
          />
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm 
                       rounded-lg focus:border-blue-500 focus:ring-blue-500 mt-1"
            placeholder="USA"
          />
        </div>

        {/* Full-width Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 inline-flex items-center justify-center gap-x-2 text-sm font-medium
                     rounded-lg border border-transparent bg-blue-600 text-white
                     hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
        >
          Complete Checkout
        </button>
      </form>
    </LoadScript>
  );
}