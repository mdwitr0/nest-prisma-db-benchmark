export class PaginationResponseDto<T> {
  docs: T[];

  count: number;

  page: number;

  pages: number;
}
