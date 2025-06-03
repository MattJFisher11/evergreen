import {jest} from '@jest/globals';

// Mock fetch using jest.unstable_mockModule
const fetchMock = jest.fn();
await jest.unstable_mockModule('node-fetch', () => ({default: fetchMock}));

// Now import the actual module under test after mocking due to throwing console.log erros being thrown
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
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('returns expected output for valid heat pump', async () => {
    fetchMock.mockResolvedValueOnce({status: 200,json: async () => mockWeatherData});
    const result = await processHouse(suitableHouse);
    expect(result).toContain(suitableHouse.submissionId);
    expect(result).toContain(`Estimated Heat Loss = 96.00kWh`);
    expect(result).toContain(`Design Region = ${suitableHouse.designRegion}`);
    expect(result).toContain(`Power Heat Loss = 0.05kW`);
    expect(result).toContain(`Cost Breakdown`);
    expect(result).toContain(`Design & Supply of your Air Source Heat Pump System Components (8kW), £4216`);
    expect(result).toContain(`Installation of your Air Source Heat Pump and Hot Water Cylinder, £2900`);
    expect(result).toContain(`Supply & Installation of your Homely Smart Thermostat, £150`);
    expect(result).toContain(`Supply & Installation of a new Consumer Unit, £300`);
    expect(result).toContain(`MCS System Commissioning & HIES Insurance-backed Warranty, £1648`);
    expect(result).toContain(`Total Cost, including VAT = £9674.7`);
  });

  it('returns error message when no suitable heat pump found', async () => {
    fetchMock.mockResolvedValueOnce({status: 200,json: async () => mockWeatherData});
    const result = await processHouse(noSuitableHouse);
    expect(result).toContain('No suitable heat pump found');
  });

  it('returns expected output when 404', async () => {
    fetchMock.mockResolvedValueOnce({status: 404,json: async () => mockWeatherData});
    const result = await processHouse(suitableHouse);
    expect(result).toContain("Warning: Could not find design region")
  });

  it('returns error message when 500 status is returned', async () => {
    fetchMock.mockResolvedValueOnce({status: 500,json: async () => mockWeatherData});
    const result = await processHouse(suitableHouse);
    expect(result).toEqual("Error processing submission Suitable: API error: 500")
  });
});