import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { Id, Movie } from './movie.interface';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './response.interface';

export type ApiClientModuleOptions = {
  apiKey?: string;
  apiKeyProperty?: string;
} & AxiosRequestConfig;

export interface ApiClientModuleOptionsFactory {
  createApiClientOptions():
    | Promise<ApiClientModuleOptions>
    | ApiClientModuleOptions;
}

export interface ApiClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ApiClientModuleOptionsFactory>;
  useClass?: Type<ApiClientModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<ApiClientModuleOptions> | ApiClientModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
