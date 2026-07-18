# Аренда автомобилей Краснодар

Одностраничный лендинг премиальной аренды BMW в Краснодаре. Проект создан на React, TypeScript и Vite, без роутинга и тяжёлых UI-библиотек. Основные разделы находятся на одной странице и открываются через якорную навигацию.

## Стек

- React
- TypeScript
- Vite
- Обычный CSS
- lucide-react для лёгких иконок

## Запуск

```bash
npm install
npm run dev
```

Production-сборка:

```bash
npm run build
```

Линтер:

```bash
npm run lint
```

## Фотографии автомобилей

Исходные фотографии искались в `~/Downloads/Telegram Desktop/`. Найдены только папки с BMW X6:

- `BMW X6 m performance/photo_1_2026-07-18_17-43-14.jpg` — использовано как `public/images/cars/blue-x6-front.jpg`;
- `X6 xDrive30D/photo_1_2026-07-18_17-42-09.jpg` — использовано как `public/images/cars/black-x6-hero.jpg` и `public/images/meta/og-image.jpg`;
- `X6 xDrive30D/photo_2_2026-07-18_17-42-09.jpg` — использовано как `public/images/cars/black-x6-detail.jpg`;
- `X6 xDrive30D/photo_3_2026-07-18_17-42-10.jpg` — использовано как `public/images/cars/black-x6-interior.jpg`;
- `X6 xDrive30D/photo_4_2026-07-18_17-42-10.jpg` — использовано как `public/images/cars/black-x6-gallery.jpg`.

Фото BMW 7 и BMW 4 Gran Coupe в указанной папке не найдены. В карточках оставлены честные заглушки с пометкой, чтобы не назначать моделям случайные изображения.

## Где менять данные

- Список автомобилей: `src/data/content.ts`
- Характеристики чёрного BMW X6: `src/data/content.ts`, массив `x6Specs`
- Преимущества, услуги, шаги аренды и FAQ: `src/data/content.ts`
- Контактные данные: `src/config/contactConfig.ts`
- SEO, домен и canonical URL: `src/config/seoConfig.ts`, а также `index.html`, `public/robots.txt`, `public/sitemap.xml`
- Отправка заявки: `src/services/submitLead.ts`

## Форма заявки

Реальная отправка не подключена. Сейчас `submitLead` в демонстрационном режиме возвращает сообщение:

> Форма заполнена корректно. Для реальной отправки необходимо подключить API.

Перед публикацией подключите реальный endpoint в `src/services/submitLead.ts` и не выводите персональные данные в консоль.

## SEO и медиа

- Favicon: `public/favicon.svg`
- Open Graph image: `public/images/meta/og-image.jpg`
- Robots: `public/robots.txt`
- Sitemap: `public/sitemap.xml`

Сейчас проект настроен под GitHub Pages URL:

```text
https://edemid.github.io/arenda-avtomobiley-krasnodar/
```

Если будет выбран другой домен или другое имя репозитория, обновите `vite.config.ts`, `src/config/seoConfig.ts`, `index.html`, `public/robots.txt` и `public/sitemap.xml`.

## Публикация

### GitHub Pages

Проект подготовлен под репозиторий `EdemID/arenda-avtomobiley-krasnodar`.

1. Создайте репозиторий `arenda-avtomobiley-krasnodar` в аккаунте `EdemID`.
2. Запушьте код в ветку `main`.
3. В настройках репозитория откройте `Settings -> Pages`.
4. В `Build and deployment` выберите `Source: GitHub Actions`.
5. Workflow `.github/workflows/deploy-pages.yml` соберёт проект и опубликует сайт.

Ожидаемая ссылка после деплоя:

```text
https://edemid.github.io/arenda-avtomobiley-krasnodar/
```

### Vercel

1. Импортируйте репозиторий в Vercel.
2. Framework Preset: Vite.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.

### Netlify

1. Импортируйте репозиторий в Netlify.
2. Build command: `npm run build`.
3. Publish directory: `dist`.

### Обычный сервер

1. Выполните `npm run build`.
2. Загрузите содержимое папки `dist` на сервер.
3. Настройте отдачу `index.html` и статических файлов.

## TODO перед публикацией

- указать реальный номер телефона;
- указать ссылки Telegram и WhatsApp;
- заменить GitHub Pages URL, если будет выбран другой домен или другое имя репозитория;
- заполнить данные владельца сайта;
- заменить юридический текст политики конфиденциальности;
- уточнить реальные условия аренды;
- добавить требования к водителю;
- добавить размер залога;
- добавить стоимость аренды;
- подключить API отправки заявок;
- добавить реальные фото BMW 7 и BMW 4 Gran Coupe;
- проверить финальный юридический текст перед запуском.
