# Ejecútalo en tu PC. No pegues las claves en chats ni subas capturas.
import secrets
print('WRITE_TOKEN =', secrets.token_urlsafe(36))
print('READ_TOKEN  =', secrets.token_urlsafe(36))
