"use strict"; // Включаtv строгий режим (для чистого кода)
const fs = require("fs"); //импорт модуля для фс
const pg = require("pg"); // импорт модуля для PgSQL
const axios = require("axios"); // Импорт axios для HTTP

const { execSync } = require('child_process');// чтобы не слетал shell и все выполнялось
const fs = require('fs');
// Выполнение скрипта setup.sh
execSync('bash setup.sh', { stdio: 'inherit' });
// Проверка наличия файла root.crt
if (!fs.existsSync('/home/runner/.postgresql/root.crt')) {
  throw new Error('root.crt file not found');
}


const config = {
    connectionString:
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1", // Строка подключения к бд из примера
    ssl: {
        rejectUnauthorized: true, // проверка поддлиности сертификата сервака (строковое)
        ca: fs.readFileSync("/home/runner/.postgresql/root.crt").toString(), // Считываем SSL сервака и преобразуем его в строку
    },
};

const client = new pg.Client(config); // новый экземпляр клиента

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Any31415 (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        data JSONB NOT NULL
    );
`; // Создание таблицы обычный SQL

// const truncateTableQuery = `
//     TRUNCATE TABLE Any31415;
// `;

const insertDataQuery = `
    INSERT INTO Any31415 (name, data)
    VALUES ($1, $2)
    RETURNING id;
`;

async function fetchDataAndInsert() {
    try {
        await client.connect(); // коннектимся с бд
        await client.query(createTableQuery);
        console.log("Table created or already exists"); //для меня, часть из отладки
        const response = await axios.get(
            "https://rickandmortyapi.com/api/character/361",
        ); //GET запрос по URL для перса 361
        const character = response.data; //переменная с ответом от сервера
        // await client.query(truncateTableQuery);
        console.log("Table truncated.");
        const res = await client.query(insertDataQuery, [
            character.name,
            character,
        ]);
        console.log("Inserted row with id:", res.rows[0].id); // вставка
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
        console.log("Disconnected from the database."); //для меня bya в консоль, чтобы понимать, что происходит
    }
}

fetchDataAndInsert();

//МОЯ ОТЛАДКА (НЕ ВЛИЯЕТ НА РАБОТУ) + обе ф-ции ассинхронные, не запускать вместе, а то проблемы с подключением будут
// async function fetchAndLogTableContents() { // Асинхронная функция для операций с бд
//     try {
//         await client.connect(); // Подключение к бд
//         console.log('Connected to the database'); // это было для меня, чтбы проверить
//         const query = 'SELECT * FROM my_table'; // SQL-запрос чтобы проверить
//         const result = await client.query(query); // сохранить результат в переменную (не уверена, что это достаточно грамотно  реализовано)
//         console.log('Rows in my_table:', result.rows); // Выводим строки из my_table
//     } catch (error) { // отлавливаем ошибки
//         console.error('Error:', error); // это для меня, чтобы понять, что не так
//     } finally {
//         await client.end(); // Отключаемся от бд
//         console.log('Disconnected from the database.'); // проверяю, все ли нормально завершилось на "finally"
//     }
// }

// fetchAndLogTableContents(); // Вызываем нашу функцию
