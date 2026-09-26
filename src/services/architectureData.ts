export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  description?: string;
}

export const xcloudProjectTree: FileNode = {
  name: 'XCLOUD',
  type: 'folder',
  path: 'XCLOUD',
  children: [
    {
      name: 'backend',
      type: 'folder',
      path: 'XCLOUD/backend',
      children: [
        {
          name: 'manage.py',
          type: 'file',
          path: 'XCLOUD/backend/manage.py',
          description: 'Django CLI entry point',
          content: `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()`
        },
        {
          name: 'requirements.txt',
          type: 'file',
          path: 'XCLOUD/backend/requirements.txt',
          description: 'Python dependencies',
          content: `django>=5.0,<5.1
djangorestframework>=3.15.0
django-cors-headers>=4.3.0
psycopg2-binary>=2.9.9
celery>=5.3.6
redis>=5.0.3
pycryptodome>=3.20.0
requests>=2.31.0
pyrad>=2.4
python-dotenv>=1.0.1
gunicorn>=21.2.0
uvicorn>=0.28.0`
        },
        {
          name: 'apps',
          type: 'folder',
          path: 'XCLOUD/backend/apps',
          children: [
            {
              name: 'payments',
              type: 'folder',
              path: 'XCLOUD/backend/apps/payments',
              children: [
                {
                  name: 'mpesa.py',
                  type: 'file',
                  path: 'XCLOUD/backend/apps/payments/mpesa.py',
                  description: 'Daraja / Vodacom M-Pesa STK Push Gateway Integration',
                  content: `import requests
import base64
from datetime import datetime
from django.conf import settings

class MpesaClient:
    def __init__(self, shortcode, passkey, consumer_key, consumer_secret, env='production'):
        self.shortcode = shortcode
        self.passkey = passkey
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.base_url = "https://api.safaricom.co.ke" if env == 'production' else "https://sandbox.safaricom.co.ke"

    def get_auth_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        res = requests.get(url, auth=(self.consumer_key, self.consumer_secret), timeout=10)
        res.raise_for_status()
        return res.json().get('access_token')

    def trigger_stk_push(self, phone_number: str, amount: int, account_reference: str, callback_url: str):
        token = self.get_auth_token()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        raw_password = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(raw_password.encode('utf-8')).decode('utf-8')

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": "XCLOUD Hotspot Access"
        }

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.post(f"{self.base_url}/mpesa/stkpush/v1/processrequest", json=payload, headers=headers, timeout=15)
        return response.json()`
                },
                {
                  name: 'webhooks.py',
                  type: 'file',
                  path: 'XCLOUD/backend/apps/payments/webhooks.py',
                  description: 'Mobile money IPN callback webhook processor',
                  content: `from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.hotspot.vouchers import generate_voucher_for_customer
from apps.notifications.sms import send_sms_voucher

@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_stk_callback(request):
    data = request.data
    stk_callback = data.get('Body', {}).get('stkCallback', {})
    result_code = stk_callback.get('ResultCode')

    if result_code == 0:
        # Successful payment
        meta_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
        meta = {item['Name']: item.get('Value') for item in meta_items}
        phone = str(meta.get('PhoneNumber'))
        amount = meta.get('Amount')
        mpesa_receipt = meta.get('MpesaReceiptNumber')

        # Auto generate voucher & notify customer via SMS
        voucher = generate_voucher_for_customer(phone=phone, amount=amount, tx_ref=mpesa_receipt)
        send_sms_voucher(phone=phone, voucher_code=voucher.code, pin=voucher.pin)
        return Response({"ResultCode": 0, "ResultDesc": "Success"})
    
    return Response({"ResultCode": 1, "ResultDesc": "Payment declined or cancelled"})`
                }
              ]
            },
            {
              name: 'radius',
              type: 'folder',
              path: 'XCLOUD/backend/apps/radius',
              children: [
                {
                  name: 'services.py',
                  type: 'file',
                  path: 'XCLOUD/backend/apps/radius/services.py',
                  description: 'RADIUS Packet-of-Disconnect (PoD) and Change of Authorization (CoA)',
                  content: `import socket
import pyrad.packet
from pyrad.client import Client
from pyrad.dictionary import Dictionary

def disconnect_user_coa(nas_ip: str, secret: str, username: str, user_ip: str, coa_port: int = 3799):
    """
    Sends RFC 3576 / RFC 5176 Disconnect-Request to MikroTik RouterOS
    """
    client = Client(server=nas_ip, secret=secret.encode('utf-8'), dict=Dictionary("radius/freeradius/dictionary"))
    client.disconnect_port = coa_port
    
    req = client.CreateCoAPacket(code=pyrad.packet.DisconnectRequest)
    req["User-Name"] = username
    req["Framed-IP-Address"] = user_ip
    
    try:
        reply = client.SendPacket(req)
        return reply.code == pyrad.packet.DisconnectACK
    except Exception as e:
        print(f"RADIUS CoA Disconnect Error: {e}")
        return False`
                }
              ]
            },
            {
              name: 'routers',
              type: 'folder',
              path: 'XCLOUD/backend/apps/routers',
              children: [
                {
                  name: 'heartbeat.py',
                  type: 'file',
                  path: 'XCLOUD/backend/apps/routers/heartbeat.py',
                  description: 'RouterOS live heartbeat webhook handler',
                  content: `from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import RouterDevice

@api_view(['POST'])
@permission_classes([AllowAny])
def router_heartbeat_api(request):
    token = request.data.get('token')
    cpu = request.data.get('cpu', 0)
    active_users = request.data.get('active_users', 0)
    uptime = request.data.get('uptime', '')
    version = request.data.get('version', '')

    router = RouterDevice.objects.filter(provision_token=token).first()
    if not router:
        return Response({"error": "Invalid router token"}, status=401)

    router.cpu_load = cpu
    router.active_sessions = active_users
    router.uptime = uptime
    router.routeros_version = version
    router.status = 'online'
    router.last_heartbeat = timezone.now()
    router.save(update_fields=['cpu_load', 'active_sessions', 'uptime', 'routeros_version', 'status', 'last_heartbeat'])

    return Response({"status": "ok", "ack": True})`
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'radius',
      type: 'folder',
      path: 'XCLOUD/radius',
      children: [
        {
          name: 'freeradius',
          type: 'folder',
          path: 'XCLOUD/radius/freeradius',
          children: [
            {
              name: 'clients.conf',
              type: 'file',
              path: 'XCLOUD/radius/freeradius/clients.conf',
              description: 'FreeRADIUS client configuration for WireGuard subnet',
              content: `# FreeRADIUS 3.x Clients configuration for XCLOUD
# All routers connect via WireGuard VPN subnet 10.99.0.0/24

client xcloud_routers {
    ipaddr = 10.99.0.0/24
    proto = *
    secret = xCloud_R4dius_S3cr3t_2026
    require_message_authenticator = no
    nas_type = mikrotik
    limit {
        max_connections = 1000
        lifetime = 0
        idle_timeout = 30
    }
}`
            },
            {
              name: 'sql.conf',
              type: 'file',
              path: 'XCLOUD/radius/freeradius/sql.conf',
              description: 'FreeRADIUS PostgreSQL backend connection',
              content: `sql {
    driver = "rlm_sql_postgresql"
    dialect = "postgresql"
    server = "\${DB_HOST:-postgres}"
    port = 5432
    login = "\${DB_USER:-xcloud_radius}"
    password = "\${DB_PASSWORD:-secret}"
    radius_db = "\${DB_NAME:-xcloud_db}"
    read_clients = yes
    client_table = "nas"
    
    # Tables for radcheck, radreply, radacct
    authorize_check_query = "SELECT id, username, attribute, value, op FROM radcheck WHERE username = '%{SQL-User-Name}' ORDER BY id"
    authorize_reply_query = "SELECT id, username, attribute, value, op FROM radreply WHERE username = '%{SQL-User-Name}' ORDER BY id"
    accounting_start_query = "INSERT INTO radacct (radacctid, acctsessionid, acctuniqueid, username, nasipaddress, nasportid, nasporttype, acctstarttime, framedipaddress, callingstationid) VALUES (DEFAULT, '%{Acct-Session-Id}', '%{Acct-Unique-Session-Id}', '%{SQL-User-Name}', '%{NAS-IP-Address}', '%{NAS-Port-Id}', '%{NAS-Port-Type}', NOW(), '%{Framed-IP-Address}', '%{Calling-Station-Id}')"
}`
            }
          ]
        }
      ]
    },
    {
      name: 'docker-compose.yml',
      type: 'file',
      path: 'XCLOUD/docker-compose.yml',
      description: 'Production Docker Compose multi-service stack',
      content: `version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: xcloud_db
      POSTGRES_USER: xcloud_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - xcloud_net

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - xcloud_net

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    restart: always
    env_file: .env
    depends_on:
      - db
      - redis
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    networks:
      - xcloud_net

  celery_worker:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    restart: always
    env_file: .env
    depends_on:
      - redis
      - db
    command: celery -A config worker --loglevel=info
    networks:
      - xcloud_net

  freeradius:
    build:
      context: ./radius
      dockerfile: ../docker/freeradius.Dockerfile
    restart: always
    ports:
      - "1812:1812/udp"
      - "1813:1813/udp"
      - "3799:3799/udp"
    depends_on:
      - db
    networks:
      - xcloud_net

  wireguard:
    image: linuxserver/wireguard:latest
    restart: always
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Africa/Dar_es_Salaam
      - SERVERURL=vpn.xcloud-isp.net
      - SERVERPORT=51820
      - PEERS=100
      - PEERDNS=auto
      - INTERNAL_SUBNET=10.99.0.0/24
    ports:
      - "51820:51820/udp"
    volumes:
      - wireguard_config:/config
    networks:
      - xcloud_net

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks:
      - xcloud_net

volumes:
  postgres_data:
  wireguard_config:

networks:
  xcloud_net:
    driver: bridge`
    }
  ]
};
