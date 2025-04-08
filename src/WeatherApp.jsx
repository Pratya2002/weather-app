import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { BsSunFill, BsMoonFill } from "react-icons/bs";
import { BiRefresh } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const apiKey = "c1bbf9dc91be4fb166da4ca1f05cdbe7";
  const apiUrl = (cityName) =>
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  useEffect(() => {
    // Clear all saved data on start
    localStorage.removeItem("recentCities");
    localStorage.removeItem("lastCity");
    setRecentCities([]);
  }, []);

  const fetchWeather = async (customCity) => {
    const queryCity = customCity || city;
    if (!queryCity) return;
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(queryCity));
      setWeather(response.data);
      setCity(queryCity);

      // Only update if new search (not on refresh)
      if (!customCity) {
        const updated = [queryCity, ...recentCities.filter((c) => c !== queryCity)].slice(0, 5);
        setRecentCities(updated);
        localStorage.setItem("recentCities", JSON.stringify(updated));
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      alert("City not found");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  const getWeatherIcon = () => {
    const weatherMain = weather.weather[0].main.toLowerCase();
    switch (weatherMain) {
      case "clouds":
        return "/images/clouds.png";
      case "clear":
        return "/images/clear.png";
      case "drizzle":
        return "/images/drizzle.png";
      case "mist":
        return "/images/mist.png";
      case "rain":
        return "/images/rain.png";
      case "snow":
        return "/images/snow.png";
      default:
        return "/images/clear.png";
    }
  };

  const handleDeleteCity = (cityToDelete) => {
    const updated = recentCities.filter((c) => c !== cityToDelete);
    setRecentCities(updated);
    localStorage.setItem("recentCities", JSON.stringify(updated));
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-teal-400 to-blue-500"
      }`}
    >
      <div
        className={`$${
          isDarkMode ? "bg-gray-700 text-white" : "bg-slate-100 text-gray-800"
        } backdrop-blur-lg rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-colors duration-500`}
      >
        {/* Toggle Button */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition transform hover:scale-110 hover:rotate-6 duration-300 ease-in-out ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <BsSunFill className="text-yellow-400 transition-transform duration-300" />
            ) : (
              <BsMoonFill className="text-blue-800 transition-transform duration-300" />
            )}
          </button>

          {weather && (
            <button
              onClick={() => fetchWeather(weather.name)}
              className={`p-2 rounded-full transition transform hover:scale-110 hover:rotate-6 duration-300 ease-in-out ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              title="Refresh"
            >
              <BiRefresh
                size={22}
                className={`transition-transform duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              />
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full mb-2 ${
              isDarkMode ? "bg-gray-600" : "bg-white"
            }`}
          >
            <input
              type="text"
              placeholder="Search city..."
              className={`bg-transparent outline-none flex-1 text-lg transition duration-300 transform focus:scale-105 ${
                isDarkMode
                  ? "text-white placeholder-gray-300 focus:text-white"
                  : "text-gray-800 placeholder-gray-500 focus:text-gray-900"
              }`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowDropdown(true)}
            />
            <button onClick={() => fetchWeather()} className="transition transform hover:scale-110 duration-300">
              <FiSearch
                size={22}
                className={isDarkMode ? "text-white" : "text-gray-700"}
              />
            </button>
          </div>

          {showDropdown && recentCities.length > 0 && (
            <ul
              className={`absolute left-0 right-0 z-10 mt-1 rounded-xl border border-gray-300 dark:border-gray-600 shadow-xl overflow-hidden text-left max-h-60 overflow-y-auto transition-all duration-200 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              {recentCities.map((c, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300"
                >
                  <span
                    onClick={() => {
                      setCity(c);
                      fetchWeather(c);
                      setShowDropdown(false);
                    }}
                    className="transition-transform hover:translate-x-1"
                  >
                    {c}
                  </span>
                  <IoMdClose
                    className="ml-4 hover:text-red-500 transition-transform duration-300 hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCity(c);
                    }}
                  />
                </li>
              ))}
              <li
                onClick={() => setShowDropdown(false)}
                className="px-4 py-2 text-center text-sm font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
              >
                Hide History
              </li>
            </ul>
          )}
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center mb-6">
            <div
              className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${
                isDarkMode ? "border-white" : "border-gray-800"
              }`}
            ></div>
          </div>
        )}

        {/* Weather Data */}
        {!loading && weather && (
          <>
            <img
              src={getWeatherIcon()}
              alt="weather icon"
              className="w-28 h-28 mx-auto mb-4 transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-5xl font-bold">
              {Math.round(weather.main.temp)}°C
            </h1>
            <h2 className="text-2xl font-medium mt-1">{weather.name}</h2>

            <div className="flex justify-around mt-6 text-center">
              <div className="flex flex-col items-center">
                <img
                  src="/images/humidity.png"
                  alt="Humidity"
                  className="w-10 h-10 mb-2 transition-transform duration-300 hover:scale-110"
                />
                <p className="text-xl">{weather.main.humidity}%</p>
                <p className="text-sm">Humidity</p>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src="/images/wind.png"
                  alt="Wind Speed"
                  className="w-10 h-10 mb-2 transition-transform duration-300 hover:scale-110"
                />
                <p className="text-xl">{weather.wind.speed} km/h</p>
                <p className="text-sm">Wind Speed</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
