<h1 align="center">Вас вітає E-TICKET 👋<br>Программне забезпечення системи моніторингу технічних засобів оплати проїзду — моніторинг статусу обладнання</h1>
<h2 align="center">Моніторинг статусу обладнання</h2>
<p>
  <img alt="Версія" src="https://img.shields.io/badge/version-0.95-blue.svg?cacheSeconds=2592000" />
  <a href="-" target="_blank">
    <img alt="License: ttc Licenc #" src="https://img.shields.io/badge/License-ttc Licenc #-yellow.svg" />
  </a>
</p>

> Призначення програмного забезпечення «Моніторинг статусу обладнання» (автобус, тролейбус, трамвай - звичайний режим, контроллери турнікетних груп):,
>
> 1. Оперативний контроль наявності зв'язку з об'єктом по комунікаційній мережі АСОП;
> 2. Оперативний контроль технічного стану технічних засобів АСОП, що працюють на лінії;
> 3. Оперативний моніторинг технічного стану контролерів вестибюлю. Програмне забезпечення «Моніторинг статусу обладнання» оплати проїзду автоматизує наступні технологічні процеси:
>    отримання даних від API системи АСОП зі статусами обладнання,
>    > - контроль наявності статусів стану технічних засобах оплати проїзду,
>    > - контроль наявності зв'язку з об'єктом по комунікаційній мережі,
>    > - моніторинг та візуалізація статусу валідаторів, моніторинг та візуалізація статусу бортового комп'ютеру
>    > - моніторинг та візуалізація статусу терміналу водія.

### 🏠 [ Домашня сторінка ](http://monitoringasop.kyivcity.gov.ua/)

## Встановлення залежностей

> 1. Встановлення необхідного ПЗ.

- [ NodeJS+NPM/YARN (latest)](https://nodejs.org/uk/download/) [Обов'язково]
- [ MongoDB (latest) + MongoShell](https://docs.mongodb.com/manual/) [Обов'язково]

> 2. Встановлення модульних залежностей.

```sh
cd <distribution kit home catalog>
npm/yarn install
```

## Запуск синтетичних тестів

```sh
npm/yarn test
```

## Конфігурація і запуск

> 1.1. Імпорт колеції облікових даних користувачів  **../distribution kit home catalog/db/setupUsers.json**
  > - Необхідно запустити інтерфейс взаємодії з mongoDB — MongoShell;
  > - Необхідно створити/обрати базу даних;
  > - Імпортувати dump-файл з даними облікових даних користувачів за допомогою утиліти mongoimport.

```sh
Windows: cd <C:\Program Files\MongoDB\<version>\bin; cmd mongo;
*Unix/MAC: mongo or sudo mongo;
use назва БД
mongoimport --db назва БД --collection users --file ../шлях до файлу/setupUsers.json --jsonArray
```

> 1.2. Імпорт колеції рівнів доступу користувачів  **../distribution kit home catalog/db/setupAccesses.json**
  > - Необхідно запустити інтерфейс взаємодії з mongoDB — MongoShell;
  > - Необхідно створити/обрати базу даних;
  > - Імпортувати dump-файл з даними рівнів доступу користувачів за допомогою утиліти mongoimport.

```sh
Windows: cd <C:\Program Files\MongoDB\<version>\bin; cmd mongo;
*Unix/MAC: mongo or sudo mongo;
use назва БД
mongoimport --db назва БД --collection useraccesses --file ../шлях до файлу/setupAccesses.json --jsonArray
```

> 2. Налаштування файлу конфігурації **../distribution kit home catalog/config.json**

```{
  "ServerPort": порт серверу,
  "urldb": "mongodb://localhost:27017/назва БД",
  "asop_auth": "mongodb://localhost:27017/назва БД модуля автентифікації",
  "urls_services": {
    "hostGetAsdu": "http://адреса сервісу формулярів АСДУ/"
  },
  "email":{
    "smtp_host": "хост серверу для  email сповіщень",
    "port": порт,
    "user": "користувач",
    "pass": "пароль"
  }
}
```

> 3. Запуск виконуваючого файлу **../distribution kit home catalog/app.js**

```sh
node app.js
```

## Автентифікація

Тестові дані для автентифікації користувачів в системі знаходяться: **../distribution kit home catalog/AuthData.txt**.
Увага! Для забезпечення інформаційної безпеки у промисловому використанні ПЗ — необхідно змінити дані автентифікації.

### 📚 [ Документація ](https://drive.google.com/drive/folders/1afCizQ-fvPfLuItan9adLekiP9orDu59)

## Автори

👤 **ТОВ Транстелеком©**

- Веб-сайт: http://ttc.net.ua/
- 04119, м.Київ, вул.Деревлянська, 13
- Офіс 044-454-00-98
- Відділ продажів: sales@ttc.net.ua
- Бугалтерія: office@ttc.net.ua
- Техпідтримка: admin@ttc.net.ua
- Факс: 044-454-00-98

## 📝 Ліцензія

Даний продукт має ліцензію [TTC License #Серія МО №001] всі права захищені.

---
