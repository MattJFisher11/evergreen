import {jest} from '@jest/globals';

// Now import the actual module under test (after mocking)
const {processHouse} = await import('../src/index.js');

// Sample weather data for mocking
const mockWeatherData = {
    location: {
    location: 'Thames Valley (Heathrow)',
    degreeDays: '2033',
    groundTemp: '11.3',
    postcode: 'TW6',
    lat: '51.470022',
    lng: '-0.454296'
  }
}

// Very large heat loss to ensure no pump matches
const noSuitableHouse = {
  submissionId: 'NotSuitable',
  floorArea: 1000000, 
  heatingFactor: 100,
  insulationFactor: 100,
  designRegion: 'Thames Valley (Heathrow)'
};

//suitable data for heat pump to be reccomended
const suitableHouse = {
  submissionId: 'Suitable',
  floorArea: 100,
  heatingFactor: 1.2,
  insulationFactor: 0.8,
  designRegion: 'Thames Valley (Heathrow)'
};

describe('Test Heat Pump Validity', () => {

  it('returns expected output for valid heat pump', async () => {
  
  });

  it('returns error message when no suitable heat pump found', async () => {

  });

  it('returns expected output when 404', async () => {

  });

  it('returns error message when 500 status is returned', async () => {

  });
});