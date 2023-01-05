# Nestjs + Prisma databases benchmark

Проект для тестирования производительности баз данных, используемых в Nestjs + Prisma.

Что используется в этом репо:

* NestJS `9.0.0`
* Prisma `4.7.1`
* Platform fastify  `9.2.1`
* PostgreSQL `15.1`
* MongoDB `6.0.1`

## Исследуемые кейсы и сценарии

Сравнение не реляционной и реляционной db (mongodb, postgres).

* [ ] Поиск
  * [ ] по нескольким значениям
  * [ ] по одному значению
  * [ ] по enum
  * [ ] полнотекстовый поиск
* [ ] Performance
  * [ ] Сравнение производительности
    * [ ] с использованием связей (1:1, 1:n, n:n)
    * [ ] без использования связей
  * [ ] Замер производительности при
    * [ ] записи всех данных в базу из kinopoiskdev api
    * [ ] чтении
    * [ ] удалении
* [ ] Влияние индексов на производительность
* [ ] Изучение запросов которые отправляет ORM в базу данных для
  * [ ] Mongo
  * [ ] Postgres

## Модель базы данных

### Postgres

![Postgres](./docs/images/pg-erd.svg)
Конфигурация кластера:

* Временно используется 1 экземпляр.

___

### Mongodb

![Mongodb](./docs/images/mongo-erd.svg)
Конфигурация кластера:  

* Config Server (3 member replica set): `configsvr01`, `configsvr02`, `configsvr03`
* 3 Shards (each a 3 member PSS replica set):
  * `shard01-a`, `shard01-b`, `shard01-c`
  * `shard02-a`, `shard02-b`, `shard02-c`
  * `shard03-a`, `shard03-b`, `shard03-c`
* 2 Routers (mongos): `router01`, `router02`

![Config](https://raw.githubusercontent.com/minhhungit/mongodb-cluster-docker-compose/master/images/sharding-and-replica-sets.png)

**Конфигурация была позаимствована из [этого репозитория](https://github.com/minhhungit/mongodb-cluster-docker-compose).**

## Тестирование

### Добавление персон в базу данных c использование метода upsert

Цель тестирования: сравнить производительность метода upsert в базах данных mongodb и postgresql при загрузке 5000000 персон с помощью метода upsert, по 100 персон синхронно и асинхронно. Метрикой измерения является время, потраченное на загрузку.

## Результаты тестирования

Это не все результаты, а всего лишь данные для показательности.

### mongodb
| Синхронная запись | Время (ms) | Асинхронная запись | Время (ms) |
|--------|------------|--------|------------|
| 1      | 1645       | 1      | 492        |
| 2      | 1066       | 2      | 316        |
| 3      | 1446       | 3      | 247        |
| 4      | 1514       | 4      | 248        |
| 5      | 1278       | 5      | 245        |
| 6      | 1254       | 6      | 282        |
| 7      | 1320       | 7      | 306        |
| 8      | 1261       | 8      | 250        |
| 9      | 1351       | 9      | 199        |
| 10     | 1345       | 10     | 238        |
|Среднее время| 1308 ms|Среднее время| 275 ms|

### postgresql
| Синхронная запись | Время (ms) | Асинхронная запись | Время (ms) |
|--------|------------|--------|------------|
| 1      | 4244       | 1      | 50         |
| 2      | 4577       | 2      | 32         |
| 3      | 6429       | 3      | 29         |
| 4      | 6735       | 4      | 33         |
| 5      | 6570       | 5      | 42         |
| 6      | 5563       | 6      | 41         |
| 7      | 5007       | 7      | 47         |
| 8      | 4685       | 8      | 30         |
| 9      | 4613       | 9      | 37         |
| 10     | 5174       | 10     | 40         |
|Среднее время| 5473 ms|Среднее время| 41 ms|

По результатам тестирования можно сделать следующие выводы:

* Метод upsert с синхронной записью в базе данных mongodb работает быстрее, чем в базе данных postgresql. Среднее время загрузки в mongodb составило *1308* мс, в то время как в postgresql - *5473* мс.
* А postgres выигрывает в асинхронной записи по времени, но это обманчиво, так как постгрес быстро отваливается из-за превышения коннектов, а в тоже время монга продолжает работать.  

В целом, метод upsert в базе данных mongodb оказался более производительным и стабильными, чем в postgresql. Однако, стоит учитывать, что результаты тестирования могут быть субъективны и зависеть от множества факторов.

Так же стоит отметить, что postgres оказался менее устойчивым к нагрузкам, и небольшой увеличение количества данных приводило к падению базы. В mongodb это происходило только после нескольких часов такой нагрузки, а postgres мог упасть уже спустя 5 минут. Но 100 персон оказались самым оптимальным значением и обе базы работали стабильно. Это происходило до тех пор пока не было сожрано почти 100% процессора. Что привело к этому я не могу сказать. Но оба приложения приводят к этому спустя короткое время.

## Потребление ресурсов базой без нагрузки
### mongodb
После загрузки 4млн персон сожрала максимум ресурсов CPU моего пк и перестала функционировать.
![Использование ресурсов монгой с персонами](./docs/images/persons-mongo-usage.jpg)

### postgresql
Смог сохранить все загружаемые в него персоны и остаться в рабочем состоянии. При этом потребление ресурсов не высокое.
![Использование ресурсов постгресом с персонами](./docs/images/persons-postgres-usage.jpg)

В этом тесте явно побеждает postgres.
## Наблюдения

Prisma не умеет работать с mongodb без транзакций, из-за чего приходится использовать репликасет. Что как по мне является недостатком, так как в старой реализации API мне нужна консистентность данных и транзакции.  

Такой подход скорее подходит для проектов где используются связи, но в этом изначально было 0 связей, и более правильно наверное было бы проверить без транзакций.

## Железо
![neofetch](./docs/images/neofetch.png)