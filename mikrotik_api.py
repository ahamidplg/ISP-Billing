import routeros_api
import logging

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MikrotikManager:
    """
    Manager untuk mengelola otomasi Mikrotik NAS (Network Access Server)
    Khusus untuk manajemen pelanggan FTTH (PPPoE).
    """
    def __init__(self, host, username, password, port=8728):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.connection = None
        self.api = None

    def connect(self):
        try:
            self.connection = routeros_api.RouterOsApiPool(
                self.host,
                username=self.username,
                password=self.password,
                port=self.port,
                plaintext_login=True
            )
            self.api = self.connection.get_api()
            logger.info(f"Connected to Mikrotik: {self.host}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Mikrotik {self.host}: {str(e)}")
            return False

    def disconnect(self):
        if self.connection:
            self.connection.disconnect()
            logger.info(f"Disconnected from Mikrotik: {self.host}")

    def create_pppoe_user(self, name, password, profile="default", remote_address=None):
        """
        Membuat Secret PPPoE baru di Mikrotik.
        """
        try:
            resource = self.api.get_resource('/ppp/secret')
            params = {
                'name': name,
                'password': password,
                'service': 'pppoe',
                'profile': profile
            }
            if remote_address:
                params['remote-address'] = remote_address
            
            resource.add(**params)
            logger.info(f"PPPoE User Created: {name} on {self.host}")
            return {"status": "success", "message": f"User {name} created successfully"}
        except Exception as e:
            logger.error(f"Error creating PPPoE user: {str(e)}")
            return {"status": "error", "message": str(e)}

    def sync_profile(self, name, profile):
        """
        Mengubah profile user dan memutuskan koneksi aktif agar user login ulang 
        dengan profile baru (digunakan untuk isolir/resume).
        """
        try:
            # 1. Update Profile di Secret
            secrets = self.api.get_resource('/ppp/secret')
            user_data = secrets.get(name=name)
            
            if not user_data:
                return {"status": "error", "message": "User not found on NAS"}
            
            secrets.set(id=user_data[0]['id'], profile=profile)
            
            # 2. Putuskan koneksi aktif (Kick) agar profile baru langsung aktif
            active_resource = self.api.get_resource('/ppp/active')
            active_sessions = active_resource.get(name=name)
            
            for session in active_sessions:
                active_resource.remove(id=session['id'])
                logger.info(f"Active session for {name} terminated to apply profile: {profile}")
            
            return {"status": "success", "message": f"Profile {name} updated to {profile}"}
        except Exception as e:
            logger.error(f"Error syncing profile for {name}: {str(e)}")
            return {"status": "error", "message": str(e)}

    def isolate_user(self, name, isolir_profile="ISOLIR_PLAN"):
        """Fungsi pembantu untuk isolir (karena telat bayar)"""
        return self.sync_profile(name, isolir_profile)

    def resume_user(self, name, normal_profile="NORMAL_PLAN"):
        """Fungsi pembantu untuk resume (setelah bayar lunas)"""
        return self.sync_profile(name, normal_profile)

    def set_concurrent_limit(self, name, limit="yes"):
        """
        Enforce concurrent session limits for PPPoE users.
        limit: "yes" (only one session), "no" (unlimited), or "default" (from profile)
        """
        try:
            secrets = self.api.get_resource('/ppp/secret')
            user_data = secrets.get(name=name)
            
            if not user_data:
                return {"status": "error", "message": "User not found"}
            
            # Setting 'limit-only-one' property on the secret
            secrets.set(id=user_data[0]['id'], **{'limit-only-one': limit})
            
            logger.info(f"Concurrent limit for {name} set to {limit}")
            return {"status": "success", "message": f"Concurrent limit set to {limit} for user {name}"}
        except Exception as e:
            logger.error(f"Error setting concurrent limit for {name}: {str(e)}")
            return {"status": "error", "message": str(e)}

# Contoh Penggunaan:
# mt = MikrotikManager('10.255.0.1', 'admin', 'password')
# if mt.connect():
#     mt.isolate_user('pppoe_user_01')
#     mt.disconnect()
