export enum QueueProcess {
  MONGO_UPSERT = 'mongo:upsert',
  MONGO_PARSE_PAGE = 'mongo:parse-pages',
  POSTGRES_UPSERT = 'postgres:upsert',
  POSTGRES_PARSE_PAGE = 'postgres:parse-pages',
}
