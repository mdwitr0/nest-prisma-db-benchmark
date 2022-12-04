import { Inject } from '@nestjs/common';
import Axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';
import { map, Observable } from 'rxjs';
import { AXIOS_INSTANCE_TOKEN } from './api-client.constants';
import {
  ApiClientModuleOptions,
  Id,
  Movie,
  PaginatedResponse,
  Request,
} from './interfaces';

export class ApiClientService {
  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    protected readonly instance: AxiosInstance = Axios
  ) {
    this.axiosRef.interceptors.request.use(
      (config: ApiClientModuleOptions) => {
        if (!config.params) config.params = {};
        if (config.apiKey && config.apiKeyProperty) {
          config.params[config.apiKeyProperty] = config.apiKey;
        } else if (config.apiKey) {
          config.params.token = config.apiKey;
        }
        return config;
      },

      (error) => Promise.reject(error)
    );
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this.makeObservable<T>(this.instance.request, config);
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return this.makeObservable<T>(this.instance.get, url, config);
  }

  get axiosRef(): AxiosInstance {
    return this.instance;
  }

  protected makeObservable<T>(
    axios: (...args: any[]) => AxiosPromise<T>,
    ...args: any[]
  ) {
    return new Observable<AxiosResponse<T>>((subscriber) => {
      const config = { ...(args[args.length - 1] || {}) };

      let cancelSource: CancelTokenSource;
      if (!config.cancelToken) {
        cancelSource = Axios.CancelToken.source();
        config.cancelToken = cancelSource.token;
      }

      axios(...args)
        .then((res) => {
          subscriber.next(res);
          subscriber.complete();
        })
        .catch((err) => {
          subscriber.error(err);
        });
      return () => {
        if (config.responseType === 'stream') {
          return;
        }

        if (cancelSource) {
          cancelSource.cancel();
        }
      };
    });
  }

  findMovieById(request: Id): Observable<Movie> {
    return this.get<Movie>('/movie', {
      params: { search: request.id, field: 'id' },
    }).pipe(map((res) => res.data));
  }

  fundMovieAll(request: Request): Observable<PaginatedResponse<Movie>> {
    return this.get<PaginatedResponse<Movie>>('/movie', {
      params: {
        ...request,
        selectFields: [
          'id',
          'name',
          'names',
          'enName',
          'year',
          'description',
          'type',
          'genres',
          'rating',
          'externalId',
          'persons',
        ].join(' '),
      },
    }).pipe(map((res) => res.data));
  }
}
