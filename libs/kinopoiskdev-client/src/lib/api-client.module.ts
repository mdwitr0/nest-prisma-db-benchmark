import { DynamicModule, Module, Provider } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import Axios from 'axios';
import {
  API_CLIENT_MODULE_ID,
  API_CLIENT_MODULE_OPTIONS,
  AXIOS_INSTANCE_TOKEN,
} from './api-client.constants';
import {
  ApiClientModuleAsyncOptions,
  ApiClientModuleOptions,
  ApiClientModuleOptionsFactory,
} from './interfaces';
import { ApiClientService } from './api-client.service';

@Module({
  providers: [
    ApiClientService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios,
    },
  ],
  exports: [ApiClientService],
})
export class ApiClientModule {
  static register(config: ApiClientModuleOptions): DynamicModule {
    return {
      module: ApiClientModule,
      providers: [
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useValue: Axios.create(config),
        },
        {
          provide: API_CLIENT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
    };
  }

  static registerAsync(options: ApiClientModuleAsyncOptions): DynamicModule {
    return {
      module: ApiClientModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useFactory: (config: ApiClientModuleOptions) => Axios.create(config),
          inject: [API_CLIENT_MODULE_OPTIONS],
        },
        {
          provide: API_CLIENT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: ApiClientModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: ApiClientModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: API_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: API_CLIENT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: ApiClientModuleOptionsFactory) =>
        optionsFactory.createApiClientOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
