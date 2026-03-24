[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vAcMEFxW)
# DeliverUS-Solution

## DeliverUS

Puede encontrar la documentación de DeliverUS en: <https://github.com/IISSI2-IS>

## Introducción

Este repositorio incluye el backend completo (carpeta `DeliverUS-Backend`), el frontend de `customer` (carpeta `DeliverUS-Frontend-Customer`) el frontend de `owner` (carpeta `DeliverUS-Frontend-Owner`).

## Preparación del entorno

### a) Windows

* Abra un terminal y ejecute el comando `npm run install:all:win`.

### b) Linux/MacOS

* Abra un terminal y ejecute el comando `npm run install:all:bash`.

## Ejecución

### 1. Backend

* Para **rehacer las migraciones y seeders**, abra un terminal y ejecute el comando

    ```Bash
    npm run migrate:backend
    ```

* Para **ejecutarlo**, abra un terminal y ejecute el comando

    ```Bash
    npm run start:backend
    ```

### 2. Frontend

* Para **ejecutar la aplicación frontend de `customer`**, abra un nuevo terminal y ejecute el comando

    ```Bash
    npm run start:frontend:customer
    ```

* Para **ejecutar la aplicación frontend de `owner`**, abra un nuevo terminal y ejecute el comando

    ```Bash
    npm run start:frontend:owner
    ```

## Depuración

* Para **depurar el backend**, asegúrese de que **NO** existe una instancia en ejecución, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Backend` en la lista desplegable, y pulse el botón de *Play*.

* Para **depurar el frontend**, asegúrese de que **EXISTE** una instancia en ejecución del frontend que desee depurar, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Frontend` en la lista desplegable, y pulse el botón de *Play*.

## Test

* Para comprobar el correcto funcionamiento de backend puede ejecutar el conjunto de tests incluido a tal efecto. Para ello ejecute el siguiente comando:

    ```Bash
    npm run test:backend
    ```

Una vez complete correctamente los requisitos del backend, los tests deberían completarse satisfactoriamente.

**Advertencia: Los tests no pueden ser modificados.**


## Entregables

### 1er Entregable

Implementa los siguientes requisitos funcionales en el **backend**:

| # | Requisito | Descripción |
|---|-----------|-------------|
| **RF4** | Confirmar nuevo pedido | Si se confirma, el pedido se crea con estado *pendiente* y se le aplica **BR1** *(pedidos > 10 € sin gastos de envío)*. Descartar pedidos es solo para el frontend. |
| **RF5** | Listar pedidos confirmados | El cliente puede ver sus pedidos confirmados, ordenados del más reciente al más antiguo. |
| **RF8** | Editar/eliminar pedido | Si el pedido está en estado *pendiente*, se pueden modificar o eliminar productos, cancelar el pedido completo, o cambiar la dirección de entrega. En estado *enviado* o *entregado* no se permite ninguna modificación. |

> Asegúrate de que los tests automáticos del backend pasan correctamente.

### 2º Entregable

Implementa los siguientes requisitos funcionales en la aplicación frontend de `customer`:

| # | Requisito | Descripción |
|---|-----------|-------------|
| **RF1** | Listado de restaurantes | El cliente puede consultar todos los restaurantes disponibles. |
| **RF2** | Detalles y menú del restaurante | El cliente puede consultar los detalles de un restaurante y los productos que ofrece. |
| **RF3** | Gestionar productos de un nuevo pedido | El cliente puede añadir varios productos (y varias unidades de cada uno) a un nuevo pedido. Antes de confirmarlo, puede editar cantidades o eliminar productos. |
| **RF4** | Confirmar o descartar nuevo pedido | Si se confirma, el pedido se crea con estado *pendiente* y se le aplica **BR1**. Si se descarta, no se crea nada. |
| **RF5** | Listar pedidos confirmados | El cliente puede ver sus pedidos confirmados, ordenados del más reciente al más antiguo. |
| **RF6** | Ver detalles de un pedido | El cliente puede consultar todos los detalles de un pedido, incluidos los productos y sus precios. |
| **RF7** | Top 3 productos | El cliente puede consultar los 3 productos más vendidos de todos los restaurantes. |

Una vez desarrollados estos requisitos, puedes proceder a implementar:

| # | Requisito | Descripción |
|---|-----------|-------------|
| **RF8** | Editar/eliminar pedido | Si el pedido está en estado *pendiente*, se pueden modificar o eliminar productos, cancelar el pedido completo, o cambiar la dirección de entrega. En estado *enviado* o *entregado* no se permite ninguna modificación. |