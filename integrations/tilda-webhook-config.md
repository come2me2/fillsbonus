# Webhook для форм Tilda (fillsdesign.ru)

Для **каждой** формы заявки: **Форма → Настройки → Webhook**

| Параметр | Значение |
|----------|----------|
| URL | `https://fillsbonus.vercel.app/api/webhooks/tilda` |
| Метод | POST |

После настройки DNS `bonus.fillsdesign.ru`:

| URL | `https://bonus.fillsdesign.ru/api/webhooks/tilda` |

## Скрытое поле в форме

Добавьте в блок формы:

- **Имя переменной:** `ref_code`
- **Тип:** Hidden (скрытое)

JS-трекер также подставляет это поле автоматически.

## Опционально: видимое поле «Промокод»

- **Имя переменной:** `promo_code` или `ref_code`

## Секрет webhook (рекомендуется)

1. Сгенерируйте строку и добавьте в Vercel → `TILDA_WEBHOOK_SECRET`
2. Добавьте в форму скрытое поле `secret` с тем же значением  
   (или передайте через настройки webhook, если Tilda поддерживает)

## Проверка

```bash
npm run test:tilda-webhook -- FILSADMN
```
