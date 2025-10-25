/**
 * Feature Analyst V2 - API Client
 *
 * Centralized API client for all backend communication.
 * Uses relative paths (/api/*) to work seamlessly in both
 * development (Vite proxy) and production (CloudFront routing).
 */

import axios, { AxiosInstance } from 'axios';
import type {
  GetCommunitiesRequest,
  GetCommunitiesResponse,
  GetCommunityResponse,
  SearchUnitsRequest,
  SearchUnitsResponse,
  GetFeaturesRequest,
  GetFeaturesResponse,
  GetMSAsResponse,
  GetMSADemographicsResponse,
  ExportRequest,
  ExportResponse,
} from '@feature-analyst/shared';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor (for auth tokens, etc.)
    this.client.interceptors.request.use(
      (config) => {
        // TODO: Add authentication token if needed
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (for error handling)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Community Endpoints
  // ============================================================================

  async getCommunities(params?: GetCommunitiesRequest): Promise<GetCommunitiesResponse> {
    const response = await this.client.get<GetCommunitiesResponse>('/communities', { params });
    return response.data;
  }

  async getCommunity(id: string): Promise<GetCommunityResponse> {
    const response = await this.client.get<GetCommunityResponse>(`/communities/${id}`);
    return response.data;
  }

  // ============================================================================
  // Unit Endpoints
  // ============================================================================

  async searchUnits(filters: SearchUnitsRequest): Promise<SearchUnitsResponse> {
    const response = await this.client.post<SearchUnitsResponse>('/units/search', filters);
    return response.data;
  }

  // ============================================================================
  // Feature Endpoints
  // ============================================================================

  async getFeatures(params?: GetFeaturesRequest): Promise<GetFeaturesResponse> {
    const response = await this.client.get<GetFeaturesResponse>('/features', { params });
    return response.data;
  }

  // ============================================================================
  // MSA Endpoints
  // ============================================================================

  async getMSAs(): Promise<GetMSAsResponse> {
    const response = await this.client.get<GetMSAsResponse>('/msa');
    return response.data;
  }

  async getMSADemographics(code: string): Promise<GetMSADemographicsResponse> {
    const response = await this.client.get<GetMSADemographicsResponse>(`/msa/${code}`);
    return response.data;
  }

  // ============================================================================
  // Export Endpoints
  // ============================================================================

  async exportData(request: ExportRequest): Promise<ExportResponse> {
    const response = await this.client.post<ExportResponse>('/export', request);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
