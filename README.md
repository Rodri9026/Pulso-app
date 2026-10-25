# Pulso-app
Aplicación de seguimiento de entrenamiento y salud
# PULSO v1.2 · Entrenamiento + sincronización Apple Salud (Atajos)

PWA gratuita de gimnasio, cardio y medidas corporales, basada en PULSO v1.1. Incluye rutinas, ejercicios/series/repeticiones/kg, temporizador, récords, gráficos de progreso, registro corporal, importación XML/ZIP de Apple Salud, respaldo JSON, uso sin conexión y conexión opcional de medidas mediante Atajos.

## Qué es automático y qué no

- La **báscula** actualiza Apple Salud mediante su propia app compatible (fuera de PULSO).
- El atajo **Sincronizar PULSO** consulta la última muestra de peso y grasa en Apple Salud y la envía con HTTPS al Worker privado cuando se ejecuta: **manual con un toque o programado diariamente**. La ejecución automática puede fallar si Salud no permite lectura con el iPhone bloqueado.
- PULSO **descarga** las mediciones enviadas desde Cloudflare al abrirse con internet o pulsando «Sincronizar ahora», y las combina con su historial local sin duplicar fechas de Apple Salud.
- La PWA **no** puede consultar HealthKit directamente. El atajo **no** se genera automáticamente como archivo `.shortcut`: debe crearse en iOS con las instrucciones en `ATAJOS_IPHONE_PASO_A_PASO.md`. Nunca se ha probado el atajo en un iPhone físico en este entorno.
- El mecanismo **no** sincroniza entrenamientos, ni garantiza actualizaciones instantáneas o recuperar automáticamente días omitidos. Usa la importación XML para recuperar el historial antiguo.

## Estructura

```text
index.html                PWA (subir a GitHub Pages)
app.js
styles.css
service-worker.js
health-import-worker.js
manifest.webmanifest
icons/                    Iconos PWA
vendor/                   Dependencia JSZip local + licencia
.nojekyll
backend/                  Servicio privado Cloudflare Worker + D1 (NO subir a GitHub Pages)
  worker.mjs
  schema.sql
  wrangler.toml
  CREAR_CLAVES.py
  package.json
  .gitignore
tests/                    Pruebas del servicio
ATAJOS_IPHONE_PASO_A_PASO.md
PRIVACIDAD_Y_SEGURIDAD.md
INSTALAR_EN_IPHONE.txt
```

## Requisitos gratuitos

- Una cuenta de GitHub, para alojar la PWA con **GitHub Pages** en HTTPS. Uso público de Pages sin costo en repositorios públicos elegibles.
- Cuenta gratuita en **Cloudflare**, para alojar tu Worker y base **D1** dentro de las cuotas del plan sin pago. Estas cuotas pueden cambiar; revisa los límites. No se exige la suscripción del Apple Developer Program.
- PC con Windows, Mac o Linux y **Node.js** (incluye npm) para desplegar el Worker; Python 3 opcional solo para generar dos secretos (también puedes usar otro generador criptográfico).
- iPhone con Atajos y Salud. La báscula debe registrar peso y grasa en Salud si quieres ambas métricas.

## A. Poner PULSO 1.2 en GitHub Pages

1. Antes de cambiar v1.1, en PULSO → Ajustes → **Exportar copia de seguridad**. Guarda el JSON en Archivos/iCloud Drive.
2. En tu repositorio anterior de GitHub Pages, **conserva la misma URL de la app** para mantener el almacenamiento local. Reemplaza solamente `index.html`, `app.js`, `styles.css`, `service-worker.js`, `health-import-worker.js`, `manifest.webmanifest`, `.nojekyll` y las carpetas `icons/`, `vendor/`.
3. No subas los archivos de `backend/` a la raíz pública de Pages y, sobre todo, nunca publiques `READ_TOKEN` o `WRITE_TOKEN`.
4. Si es una publicación nueva, habilita Settings → Pages → Deploy from a branch → `main` y `/(root)`. Después de publicar, abre la URL HTTPS del repositorio en Safari → Compartir → Añadir a pantalla de inicio.
5. Ábrela con internet una vez para actualizar el Service Worker. Si muestra interfaz antigua, cierra/reabre y vuelve a cargar la página online. Los registros existentes se conservan si no cambias origen/ruta y Safari no borró datos locales.

## B. Crear el servicio Cloudflare

En un PC, descarga el ZIP, descomprímelo y abre una terminal en la carpeta `backend`.

1. Crea una cuenta gratis en <https://dash.cloudflare.com/>. Instala Node.js desde <https://nodejs.org/> y comprueba `node --version` y `npm --version`.
2. Desde **backend/**, ejecuta:

   ```bash
   npm install
   npx wrangler login
   npx wrangler d1 create pulso-medidas
   ```

3. Copia el `database_id` (UUID) que devuelve D1. En `backend/wrangler.toml`, reemplaza `REEMPLAZAR-CON-ID-DE-D1` con ese UUID. Cambia `ALLOWED_ORIGIN` a tu origen exacto de GitHub Pages, por ejemplo `https://rodrigo.github.io` (sin ruta `/pulso-app` ni `/` final). Si el comando pregunta si deseas agregar automáticamente el binding de D1, puedes contestar **No** porque `wrangler.toml` ya lo define; o revisa que solo quede un binding con `binding = "DB"`.
4. Crea tablas remotas sin borrar datos:

   ```bash
   npx wrangler d1 execute pulso-medidas --remote --file=./schema.sql
   ```

5. Genera dos secretos distintos. Si tienes Python instalado:

   ```bash
   python CREAR_CLAVES.py
   ```

   Copia y guarda **privadamente** ambos valores en un administrador de contraseñas. Si no tienes Python, puedes generar dos cadenas aleatorias fuertes con Node.js:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(36).toString('base64url'))"
   ```

   Ejecútalo **dos veces** para obtener claves diferentes.
6. Registra ambas claves como secretos del Worker (los valores se ingresan por la terminal de forma interactiva; **nunca** dentro de `wrangler.toml`):

   ```bash
   npx wrangler secret put WRITE_TOKEN
   npx wrangler secret put READ_TOKEN
   npx wrangler deploy
   ```

   `wrangler secret put` puede publicar una versión del Worker al guardar cada clave; es normal. Mientras falte alguna clave, el Worker responde 503 (modo seguro).
7. El despliegue devuelve una URL real del tipo `https://pulso-sync-personal.TU-SUBDOMINIO.workers.dev`. Pruébala en el navegador añadiendo `/v1/status`: debe mostrar `{"ok":true,...}`. Esta URL es la **base del servicio**, y la única que debes poner en PULSO. Es distinta de tu dirección de GitHub Pages.

## C. Configurar PULSO + Atajos

1. En PULSO v1.2 → **Ajustes → Atajos · Sincronización automática**, introduce URL base del Worker y `READ_TOKEN`, y pulsa **Guardar conexión**.
2. En el iPhone, crea el atajo «Sincronizar PULSO» siguiendo **`ATAJOS_IPHONE_PASO_A_PASO.md`**. Usa `WRITE_TOKEN` en el encabezado HTTP y las rutas:

   ```text
   POST https://TU-WORKER.workers.dev/v1/ingest/weight
   POST https://TU-WORKER.workers.dev/v1/ingest/bodyFat
   ```

3. En PULSO, pulsa **Sincronizar ahora** para leer del Worker → revisa **Progreso**.
4. En Atajos → Automatización → **Hora del día → Diariamente**, elige ejecutar el mismo atajo sin confirmar (si tu iOS lo permite). Mantén la opción de ejecución manual siempre disponible.

## D. Mantenimiento y comandos

- Verificar el Worker: visita `/v1/status` de tu propia URL.
- Revocar la conexión local (sin borrar datos en el servidor): PULSO → Ajustes → **Borrar claves de este iPhone**.
- Probar servicio en este ZIP (sin conectar con Salud): `node --test ../tests/backend.test.mjs` desde `backend/`. Estas pruebas usan una base D1 simulada en memoria; no se han probado sobre tu infraestructura Cloudflare real.
- Consultar las mediciones almacenadas: `npx wrangler d1 execute pulso-medidas --remote --command="SELECT metric,day,value,sample_at FROM measurements ORDER BY day DESC LIMIT 20"` **en terminal privada**.
- Borrar TODAS las mediciones remotas: `npx wrangler d1 execute pulso-medidas --remote --command="DELETE FROM measurements"`. Esta operación NO elimina los datos locales del iPhone; para eso utiliza los ajustes de la PWA. Haz respaldo si te interesa conservar el historial.
- Cambiar clave comprometida: `npx wrangler secret put WRITE_TOKEN` (o `READ_TOKEN`), introduce una nueva y actualiza Atajos o Ajustes de PULSO.

## Privacidad y seguridad

Lee `PRIVACIDAD_Y_SEGURIDAD.md`. Las mediciones se almacenan **en la base de datos de Cloudflare**, bajo tu cuenta, no exclusivamente en el teléfono. Se transmiten mediante HTTPS y están protegidas con claves; **no hay cifrado extremo a extremo de los valores en D1**. El código no incluye telemetría ni publicidad. Los datos importados de export.xml continúan procesándose localmente y no se suben automáticamente al servidor.
