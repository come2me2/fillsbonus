# Настройка Tilda для реферальной программы Fils

## 1. JS-трекер на всех страницах

1. Откройте проект Tilda `8575135`.
2. Перейдите в **Настройки сайта → Ещё → HTML-код для вставки внутрь HEAD**.
3. Вставьте:

```html
<script src="https://bonus.fillsdesign.ru/tilda-ref-tracker.js"></script>
```

Либо вставьте содержимое файла [`tilda-ref-tracker.js`](./tilda-ref-tracker.js) напрямую в блок **T123 HTML** на Zero Block / в head.

Скрипт:
- читает `?ref=CODE` из URL;
- сохраняет код в `localStorage` и cookie на 365 дней;
- автоматически добавляет скрытое поле `ref_code` во все формы Tilda.

## 2. Скрытое поле в формах

Для каждой формы (главная, about, cooperation):

1. Откройте блок с формой.
2. Добавьте скрытое поле:
   - **Имя переменной:** `ref_code`
   - **Тип:** hidden / скрытое
3. Опционально добавьте видимое поле «Промокод» с именем `promo_code` или `ref_code`.

Скрипт сам заполнит `ref_code` перед отправкой.

## 3. Webhook Tilda Business

Для каждой формы:

1. **Форма → Настройки → Webhook**
2. URL:

```text
https://bonus.fillsdesign.ru/api/webhooks/tilda
```

3. Метод: `POST`
4. Если используете секрет, добавьте в webhook payload поле `secret` и укажите то же значение в переменной окружения `TILDA_WEBHOOK_SECRET`.

## 4. Проверка

1. Зарегистрируйтесь на `bonus.fillsdesign.ru`.
2. Откройте `https://fillsdesign.ru/?ref=ВАШ_КОД`.
3. Отправьте тестовую заявку с сайта.
4. Проверьте, что заявка появилась в `/admin`.

## 5. Поля, которые понимает webhook

| Поле | Варианты имён |
|---|---|
| Имя | `name`, `Name`, `Имя` |
| Телефон | `Phone`, `phone`, `Телефон` |
| Email | `email`, `Email` |
| Промокод | `ref_code`, `ref`, `promo`, `promocode`, `Промокод` |

## 6. Локальная отладка

Для локального теста webhook можно отправить POST:

```bash
curl -X POST http://localhost:3000/api/webhooks/tilda \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","Phone":"+79991234567","ref_code":"AB12CD34"}'
```
