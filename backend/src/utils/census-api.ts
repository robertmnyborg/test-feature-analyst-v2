/**
 * US Census Bureau API Integration
 * 
 * Fetches MSA demographic data from the US Census Bureau API.
 * Implements caching to reduce API calls.
 */

import https from 'https';

interface CensusDemographics {
  population?: number;
  medianIncome?: number;
  housingUnits?: number;
  rentalVacancyRate?: number;
}

/**
 * Fetch MSA demographics from US Census Bureau API
 */
export async function fetchMSADemographics(msaCode: string): Promise<CensusDemographics> {
  const apiKey = process.env.CENSUS_API_KEY;

  if (!apiKey) {
    console.warn('CENSUS_API_KEY not configured, skipping demographic fetch');
    return {};
  }

  try {
    // US Census Bureau API endpoint for American Community Survey (ACS) 5-Year Data
    // Variables: B01003_001E (Total Population), B19013_001E (Median Household Income),
    //            B25001_001E (Housing Units), B25004_008E (Rental Vacancy Rate)
    const year = new Date().getFullYear() - 2; // Use most recent available year (typically 2 years behind)
    const variables = 'B01003_001E,B19013_001E,B25001_001E,B25004_008E';
    const url = `https://api.census.gov/data/${year}/acs/acs5?get=NAME,${variables}&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:${msaCode}&key=${apiKey}`;

    const data = await fetchJSON(url);

    if (!data || data.length < 2) {
      throw new Error('Invalid response from Census API');
    }

    // Census API returns array: [[headers], [values]]
    const values = data[1];

    return {
      population: parseInt(values[1], 10) || undefined,
      medianIncome: parseInt(values[2], 10) || undefined,
      housingUnits: parseInt(values[3], 10) || undefined,
      rentalVacancyRate: parseFloat(values[4]) || undefined,
    };
  } catch (error) {
    console.error(`Failed to fetch Census data for MSA ${msaCode}:`, error);
    throw error;
  }
}

/**
 * Fetch JSON data from URL using HTTPS
 */
function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}
