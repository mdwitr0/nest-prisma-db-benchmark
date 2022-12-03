import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

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
