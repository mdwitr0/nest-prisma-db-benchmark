# Nestjs + Prisma databases benchmark
Проект для тестирования производительности баз данных, используемых в Nestjs + Prisma.

## Исследуемые кейсы и сценарии
Сравнение не реляционной и реляционной db (mongodb, postgres).
- [ ] Поиск
  - [ ] по нескольким значениям
  - [ ] по одному значению
  - [ ] по enum
  - [ ] полнотекстовый поиск
- [ ] Performance
  - [ ] Сравнение производительности
    - [ ] с использованием связей (1:1, 1:n, n:n)
    - [ ] без использования связей
  - [ ] Замер производительности при
    - [ ] записи всех данных в базу из kinopoiskdev api
    - [ ] чтении
    - [ ] удалении
- [ ] Влияние индексов на производительность

## Модель базы данных
### Postgres
![Postgres](./docs/images/pg-erd.svg)

### Mongodb
![Mongodb](./docs/images/mongo-erd.svg)
Для mongodb была использована следующая конфигурация:
* Config Server (3 member replica set): `configsvr01`, `configsvr02`, `configsvr03`
* 3 Shards (each a 3 member PSS replica set):
  * `shard01-a`, `shard01-b`, `shard01-c` 
  * `shard02-a`, `shard02-b`, `shard02-c` 
  * `shard03-a`, `shard03-b`, `shard03-c`
* 2 Routers (mongos): `router01`, `router02`

![Config](https://raw.githubusercontent.com/minhhungit/mongodb-cluster-docker-compose/master/images/sharding-and-replica-sets.png)

**Конфигурация была позаимствована из [этого репозитория](https://github.com/minhhungit/mongodb-cluster-docker-compose).**





## Наблюдения
Большая нагрузка приводит к тому, что mongodb не справляется с ней и все данные в базе становятся неконсистентными, что приводит к потере всех данных.
Данная проблема проявилась при попытке записать 10000 записей в базу данных.

Образ mongodb: `prismagraphql/mongo-single-replica:4.4.3-bionic`.
Он реализует простую репликацию на основе одного экземпляра mongodb. Вероятно это и стало причиной потери данных.
