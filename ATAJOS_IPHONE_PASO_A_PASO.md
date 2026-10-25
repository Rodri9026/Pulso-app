# PULSO 1.2 — Atajos de Apple Salud en iPhone

Este documento explica cómo construir UN atajo «Sincronizar PULSO» que envía la última medición disponible de **peso** y **porcentaje de grasa corporal** a tu servicio privado. El mismo atajo se puede ejecutar con un toque y mediante una automatización diaria.

**Antes de comenzar**: asegúrate de que tu báscula ya comparte ambos valores con **Salud**. En Salud → Explorar → Medidas corporales → Peso / Porcentaje de grasa corporal, comprueba la fecha y el valor más recientes. Tu iPhone debe tener internet para enviar datos al servidor. No hace falta que PULSO esté abierto durante el envío.

**Necesitas**: (a) tu URL HTTPS de Cloudflare (`https://...workers.dev`, real, proporcionada al desplegar); (b) tu `WRITE_TOKEN` privado. NO uses el `READ_TOKEN` del PWA para enviar muestras.

## 1. Crea el atajo «Sincronizar PULSO»

1. Abre **Atajos** en el iPhone → pestaña **Atajos** → botón **+** → ponle nombre **Sincronizar PULSO**.
2. Añade acción **Buscar muestras de Salud** (en algunas versiones «Buscar muestras de salud»).
   - Filtrar por **Tipo = Peso corporal** (el nombre puede mostrarse como «Peso»).
   - Ordenar por **Fecha de inicio**, **más reciente primero**.
   - Activar **Límite** y seleccionar **1** muestra.
3. Añade **Contar** los elementos encontrados y después **Si** el número es mayor que **0**; mete los pasos siguientes dentro del `Si` para no enviar campos vacíos.
4. Dentro del `Si`, agrega **Obtener ítem de la lista** (primer elemento) sobre el resultado de «Buscar muestras de Salud»; es la muestra que usaremos.
5. Añade **Obtener detalles de muestras de Salud** (o selecciona la propiedad desde la variable mágica de la muestra). Selecciona la propiedad **Valor** de la muestra. Guarda la salida con **Definir variable** → nombre `PesoValor`.
   - **Comprueba** ejecutando el atajo en modo prueba que `PesoValor` sea un número en **kg**, o un texto como `78,5 kg`. Si usa libras, primero conviértelo a kg. El servicio rechaza unidades distintas de kg para evitar errores silenciosos.
6. Añade otro **Obtener detalles de muestras de Salud** sobre la misma muestra, pero selecciona **Fecha de inicio**. Agrega **Formatear fecha** → formato **Personalizado** y usa exactamente:

   ```text
   yyyy-MM-dd'T'HH:mm:ssXXXXX
   ```

   Ejemplo del resultado esperado: `2026-10-25T08:25:00-03:00`. Define variable `PesoFecha`.
   - Si tu versión de Atajos no acepta `XXXXX`, utiliza el formato alternativo `yyyy-MM-dd HH:mm:ss Z`, cuyo resultado debe parecerse a `2026-10-25 08:25:00 -0300`. El servidor admite ambos formatos.
7. Agrega una acción **URL** y escribe (reemplaza la dirección de ejemplo por TU dirección real):

   ```text
   https://TU-WORKER.workers.dev/v1/ingest/weight
   ```

8. Añade **Obtener contenido de URL** sobre la URL anterior:
   - **Método**: `POST`
   - **Solicitar cuerpo / Cuerpo de solicitud**: `JSON`
   - **Campos JSON**:
     - `value` → tipo **Texto** → insertar variable mágica **PesoValor** (no escribir «PesoValor» literalmente)
     - `sampleAt` → tipo **Texto** → insertar variable mágica **PesoFecha**.
   - **Encabezados / Headers**:
     - Nombre: `Authorization`
     - Valor: `Bearer TU_WRITE_TOKEN` (un espacio después de Bearer y a continuación tu clave completa)
   - La propia acción elige `application/json` para un cuerpo JSON. Si no lo hace, añade `Content-Type: application/json`.
9. Cierra `Fin del Si`. La respuesta al éxito tiene el campo `ok` en `true` y el HTTP debe ser `200`. Para probar, puedes mostrar temporalmente el resultado; quita «Mostrar resultado» antes de automatizar.

## 2. Repite el bloque para la grasa corporal

10. Después del bloque anterior, crea otra acción **Buscar muestras de Salud**, esta vez con tipo **Porcentaje de grasa corporal** (a veces «Grasa corporal»), orden **más reciente primero**, límite **1**. Verifica que realmente exista el dato en Salud.
11. Repite **Contar → Si mayor que 0 → Obtener primer elemento → Obtener detalles**:
    - **Valor** → `GrasaValor` (habitualmente un texto como `23,8 %`).
    - **Fecha de inicio** → **Formatear fecha**, igual que antes → `GrasaFecha`.
12. Envía un segundo **Obtener contenido de URL**, método `POST`, JSON, encabezado `Authorization: Bearer TU_WRITE_TOKEN`, con:

   ```text
   URL: https://TU-WORKER.workers.dev/v1/ingest/bodyFat
   Cuerpo JSON:
     value:   [variable GrasaValor]
     sampleAt:[variable GrasaFecha]
   ```

    Si Atajos entrega grasa como `0,238` en lugar de `23,8 %`, agrega un tercer campo JSON `unit` → `fraction`, para que el servidor convierta 0,238 a 23,8 %. Si entrega 23,8, NO uses `fraction`. Verifica contra Salud antes de automatizar: una diferencia por factor 100 suele indicar que elegiste mal la unidad.
13. Guarda el atajo y ejecútalo desde Atajos. Verifica que cada consulta no muestre errores. No compartas el atajo exportado si contiene la clave de escritura.

## 3. Conectar la PWA y comprobar que funciona

1. Abre PULSO en tu iPhone → **Ajustes → Atajos · Sincronización automática**.
2. Introduce la URL base del Worker, por ejemplo `https://TU-WORKER.workers.dev` (sin `/v1/...`).
3. Introduce el `READ_TOKEN` privado (NO el `WRITE_TOKEN`). Pulsa **Guardar conexión**.
4. Ejecuta en el iPhone «Sincronizar PULSO», vuelve a PULSO y toca **Sincronizar ahora**.
5. Abre **Progreso** y revisa que los últimos valores de peso y grasa coincidan exactamente con Salud, así como las fechas. Desde ahora, cuando abras PULSO con internet, consultará nuevas mediciones del servicio. Sin conexión siguen disponibles las mediciones ya guardadas.

## 4. Automático todos los días

1. Ve a **Atajos → Automatización → +** → **Hora del día**.
2. Selecciona **Diariamente** y una hora en la que normalmente tengas el iPhone desbloqueado; por ejemplo, poco después de pesarte.
3. Elige **Ejecutar inmediatamente** o desactiva **Preguntar antes de ejecutar**, según la versión de iOS.
4. Añade **Ejecutar atajo** → selecciona **Sincronizar PULSO**. Guarda.
5. En la configuración de privacidad del atajo, si está disponible y lo deseas, habilita **Permitir ejecutar cuando esté bloqueado**. *Los registros de Salud pueden seguir siendo inaccesibles mientras el iPhone esté bloqueado*: esto no garantiza éxito sin desbloquear.
6. Al día siguiente verifica en PULSO → Ajustes → **Sincronizar ahora** que llegaron los datos.

### Cómo activar el modo con un toque

El mismo «Sincronizar PULSO» estará disponible en Atajos. Mantén pulsado el icono → **Detalles** / menú para añadirlo a la pantalla de inicio, o colócalo como widget de Atajos. Ejecútalo justo después de pesarte si quieres ver las cifras en PULSO ese mismo día.

## Solución de problemas

| Mensaje | Qué revisar |
|---|---|
| HTTP 401 | Usaste la clave errónea: los POST utilizan `WRITE_TOKEN`, la PWA utiliza `READ_TOKEN`. |
| HTTP 422 | El valor o la fecha no tiene el formato válido. Revisa `sampleAt` con zona horaria y que el peso esté en kg y la grasa sea un porcentaje. |
| HTTP 503 | Faltan claves o bindings del Worker en Cloudflare. |
| PULSO: error de red / CORS | `ALLOWED_ORIGIN` no coincide exactamente con el origen del GitHub Pages (`https://USUARIO.github.io`), o el Worker no está desplegado. |
| No llegan valores | Comprueba que Salud tenga peso *y* grasa, y que Atajos tenga permiso de lectura para ambos. Algunas básculas solo escriben el peso. |
| No se ejecutó en horario | iOS puede bloquear la lectura de Salud cuando el teléfono está bloqueado; prueba con la pantalla desbloqueada o usa el botón manual. |
| Porcentaje 100 veces demasiado pequeño | La báscula / Atajos podría entregar una fracción (0,238); agrega `unit: fraction` únicamente en el POST de grasa. |
| Valores del día anterior | Solo se envía la **última muestra disponible** por cada tipo. Si la báscula todavía no ha sincronizado con Salud, el atajo no genera una nueva muestra. |

**Importante sobre el historial:** este atajo envía la medición más reciente de cada tipo en cada ejecución, *no* todos los registros de los últimos 30 días. Si se pierde una ejecución diaria, no puede recuperar automáticamente la muestra de aquel día si aparece una más nueva. Para reconstruir el pasado, PULSO conserva la opción de importar `export.zip`/`export.xml` desde Apple Salud. Se guarda como máximo un peso y un porcentaje por día, el más reciente por tipo.

**Privacidad:** Atajos solo lee las muestras que autorices. El acceso al endpoint usa HTTPS y claves separadas. La base D1 de Cloudflare almacena los valores y fechas en texto dentro de tu cuenta (no es cifrado extremo a extremo); los registros de gimnasio nunca se envían. No publiques el atajo con la clave ni subas claves a GitHub.
