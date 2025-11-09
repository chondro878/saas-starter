'use client';

import { useState, useMemo } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

interface SentOrdersSectionProps {
  sentOrders: Order[];
}

export function SentOrdersSection({ sentOrders }: SentOrdersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [occasionDateFrom, setOccasionDateFrom] = useState('');
  const [occasionDateTo, setOccasionDateTo] = useState('');
  const [mailedDateFrom, setMailedDateFrom] = useState('');
  const [mailedDateTo, setMailedDateTo] = useState('');

  // Get unique cities and states for dropdowns
  const { cities, states } = useMemo(() => {
    const citySet = new Set<string>();
    const stateSet = new Set<string>();
    
    sentOrders.forEach(order => {
      citySet.add(order.recipientCity);
      stateSet.add(order.recipientState);
    });
    
    return {
      cities: Array.from(citySet).sort(),
      states: Array.from(stateSet).sort(),
    };
  }, [sentOrders]);

  // Filter orders based on all criteria
  const filteredOrders = sentOrders.filter((order) => {
    // Text search
    const query = searchQuery.toLowerCase();
    const fullName = `${order.recipientFirstName} ${order.recipientLastName}`.toLowerCase();
    const occasionType = order.occasionType.toLowerCase();
    const city = order.recipientCity.toLowerCase();
    const state = order.recipientState.toLowerCase();
    
    const matchesSearch = !searchQuery || (
      fullName.includes(query) ||
      occasionType.includes(query) ||
      city.includes(query) ||
      state.includes(query)
    );

    // City filter
    const matchesCity = !selectedCity || order.recipientCity === selectedCity;

    // State filter
    const matchesState = !selectedState || order.recipientState === selectedState;

    // Occasion date filter
    const orderOccasionDate = new Date(order.occasionDate);
    const matchesOccasionDateFrom = !occasionDateFrom || orderOccasionDate >= new Date(occasionDateFrom);
    const matchesOccasionDateTo = !occasionDateTo || orderOccasionDate <= new Date(occasionDateTo);

    // Mailed date filter
    const orderMailedDate = order.mailDate ? new Date(order.mailDate) : null;
    const matchesMailedDateFrom = !mailedDateFrom || (orderMailedDate && orderMailedDate >= new Date(mailedDateFrom));
    const matchesMailedDateTo = !mailedDateTo || (orderMailedDate && orderMailedDate <= new Date(mailedDateTo));
    
    return (
      matchesSearch &&
      matchesCity &&
      matchesState &&
      matchesOccasionDateFrom &&
      matchesOccasionDateTo &&
      matchesMailedDateFrom &&
      matchesMailedDateTo
    );
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedState('');
    setOccasionDateFrom('');
    setOccasionDateTo('');
    setMailedDateFrom('');
    setMailedDateTo('');
  };

  if (sentOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Sent Orders ({sentOrders.length})
          </h2>
          {(searchQuery || selectedCity || selectedState || occasionDateFrom || occasionDateTo || mailedDateFrom || mailedDateTo) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, occasion, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* City Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Occasion Date From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={occasionDateFrom}
                onChange={(e) => setOccasionDateFrom(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Occasion Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Occasion Date To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={occasionDateTo}
                onChange={(e) => setOccasionDateTo(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Mailed Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mailed Date From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={mailedDateFrom}
                onChange={(e) => setMailedDateFrom(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Mailed Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mailed Date To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={mailedDateTo}
                onChange={(e) => setMailedDateTo(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No orders match your filters</p>
        </div>
      ) : (
        <>
          {filteredOrders.length !== sentOrders.length && (
            <div className="mb-3 text-sm text-gray-600">
              Showing {filteredOrders.length} of {sentOrders.length} orders
            </div>
          )}
          <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-start justify-between bg-white p-4 rounded shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">
                    {order.recipientFirstName} {order.recipientLastName}
                  </p>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-700">
                    {order.occasionType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    order.cardType === 'subscription' ? 'bg-green-100 text-green-800' :
                    order.cardType === 'bulk' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.cardType === 'subscription' ? 'Subscription' :
                     order.cardType === 'bulk' ? 'Bulk Pack' :
                     'Individual'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {order.recipientCity}, {order.recipientState} {order.recipientZip}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>
                    Occasion: {new Date(order.occasionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {order.mailDate && (
                    <span>
                      Mailed: {new Date(order.mailDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                  Sent
                </span>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}

