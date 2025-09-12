# Process service

A dedicated backend microservice responsible for orchestrating process creation and management within Open Proces Huis.

## Types

| Ontology                                              | Class                     | uri                                                                    |
| ----------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| <http://lblod.data.gift/vocabularies/openproceshuis/> | **oph:ConceptueelProces** | <http://lblod.data.gift/vocabularies/openproceshuis/ConceptueelProces> |

## Endpoints

| Method | Path                                  | Description                                                                                                 |
| ------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/conceptual-processes/table-content` | Returns an array for the requested (page,size & sort) entries to create a table of all conceptual processes |
| DELETE | `/conceptual-processes/download`      | This uses the get table-content methods to download the data from the conceptual-processes table            |

## Adding it to your project

This can easely be done by adding it as a service in your _docker-compose.yml_

```yml
services:
  process:
    image: lblod/openproceshuis-process-service
    restart: always
    labels:
      - "logging=true"
    logging: *default-logging
```

## Dispatcher

When using this service in your stack you probably want to update the dispatcher configuration.

The match below is the endpoint that the frontend can call (in this example is "process-api"). All these calls will be forwarded to this process-service.

```ex
  match "/process-api/*path",  %{ accept: [:any], layer: :api } do
    Proxy.forward conn, path, "http://process/"
  end
```
