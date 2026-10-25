# Privacidad y seguridad — PULSO 1.2

## Qué datos salen del iPhone

Exclusivamente las muestras de **peso**, **porcentaje de grasa corporal** y **fecha/hora** que el atajo envíe. En Cloudflare D1 se guardan `metric,day,value,sample_at,updated_at`. NO se envían frecuencia cardíaca, ejercicios, rutinas, nombres, correo electrónico ni registros completos de Salud. El importador XML/ZIP procesa el archivo localmente.

## Protecciones implementadas

- HTTPS para el Worker y para la PWA alojada en GitHub Pages.
- Dos secretos diferentes (generados por el usuario): `WRITE_TOKEN` únicamente para ingesta del Atajo; `READ_TOKEN` únicamente para consulta de la PWA. Sin secretos el Worker falla cerrado con HTTP 503.
- Control CORS limitado al origen configurado de la PWA. CORS NO sustituye la autenticación y no restringe scripts que se ejecuten en ese mismo origen.
- Validación estricta de fecha, valor, tipo y tamaño de los envíos, consultas parametrizadas D1, límites de 1–500 kg y 0–100 %, `Cache-Control: no-store`, respuestas sin datos privados en mensajes de error.
- Una medición más antigua nunca sobrescribe una más reciente del mismo tipo y día. Un registro repetido no crea duplicados remotos.
- El endpoint `/v1/status` es público pero no expone mediciones.

## Limitaciones reales

- **No hay cifrado extremo a extremo de las mediciones**: se almacenan en D1 dentro de la cuenta Cloudflare y el propietario de esa cuenta / el proveedor puede técnicamente acceder. Evalúa si te resulta aceptable alojar datos personales de Salud allí.
- La clave `READ_TOKEN` se guarda en `localStorage` de Safari para sincronizar automáticamente al abrir la PWA. Puede quedar accesible para scripts que corran bajo el mismo origen o alguien con acceso a la sesión del teléfono. Evita dispositivos compartidos, mantén GitHub bajo tu control y no añadas scripts externos a PULSO.
- El `WRITE_TOKEN` se almacena dentro del atajo de iOS; **no compartas ni exportes el atajo** con la clave puesta. No las escribas en capturas, comentarios ni repositorios.
- La app no es un dispositivo médico y no realiza diagnósticos. La medición de grasa de básculas domésticas es orientativa.
- La lectura automática de Salud con Atajos puede fallar si el iPhone está bloqueado; verifica cada cierto tiempo.
- Si borras los datos locales, los registros de Cloudflare seguirán existiendo. Y si borras Cloudflare, permanecerán los ya descargados en PULSO hasta que los borres allí.
- La sincronización solo importa la última muestra de peso y de grasa por ejecución. Si tu báscula incorpora datos atrasados, no serán recuperados salvo que sean los más recientes del tipo. Para poblar historial largo, importa el export.xml/ZIP a la PWA (local).

## Eliminar datos y revocar acceso

1. Revoca **los permisos de lectura de Salud** de Atajos desde los ajustes de privacidad/permisos de Salud en tu iPhone si ya no quieres que consulte mediciones.
2. Elimina o desactiva tu automatización «Sincronizar PULSO».
3. Elimina todos los registros remotos en D1 desde `backend/`:

   ```bash
   npx wrangler d1 execute pulso-medidas --remote --command="DELETE FROM measurements"
   ```

4. Para impedir nuevos accesos, rota `WRITE_TOKEN` y `READ_TOKEN` o elimina el Worker de Cloudflare.
5. En PULSO puedes borrar datos locales desde Ajustes (después de exportar respaldo si quieres). También puedes borrar datos del sitio en Safari, lo cual elimina la configuración local guardada.

**Aviso:** en el caso de registros de salud personales, un servicio backend alojado de forma gratuita no significa que sea un sistema auditado o certificado para uso clínico. Este proyecto es un registro personal, no un servicio sanitario regulado.
