import json, sys, os, netifaces, re, subprocess
from jsonpath_ng import jsonpath, parse
from os import environ
from multipledispatch import dispatch
from netaddr import *


def main():

    filePath = None
    saveFilePath = None
    jsonValue = None

    PRODUCT = os.environ["PRODUCT"] if environ.get("PRODUCT") else "onlyoffice"
    BASE_DIR =  os.environ["BASE_DIR"] if environ.get("BASE_DIR") else  "/app/" + PRODUCT
    ENV_EXTENSION = os.environ["ENV_EXTENSION"] if environ.get("ENV_EXTENSION") else "none"
    PROXY_HOST = os.environ["PROXY_HOST"] if environ.get("PROXY_HOST") else "proxy"
    SERVICE_PORT = os.environ["SERVICE_PORT"] if environ.get("SERVICE_PORT") else "5050"
    URLS = os.environ["URLS"] if environ.get("URLS") else "http://0.0.0.0:"
    PATH_TO_CONF = os.environ["PATH_TO_CONF"] if environ.get("PATH_TO_CONF") else "/app/" + PRODUCT + "/config"
    LOG_DIR = os.environ["LOG_DIR"] if environ.get("LOG_DIR") else "/var/log/" + PRODUCT
    ROUTER_HOST = os.environ["ROUTER_HOST"] if environ.get("ROUTER_HOST") else "localhost"

    MYSQL_HOST = os.environ["MYSQL_HOST"] if environ.get("MYSQL_HOST") else "localhost"
    MYSQL_DATABASE = os.environ["MYSQL_DATABASE"] if environ.get("MYSQL_DATABASE") else "onlyoffice"
    MYSQL_USER = os.environ["MYSQL_USER"] if environ.get("MYSQL_USER") else "onlyoffice_user"
    MYSQL_PASSWORD = os.environ["MYSQL_PASSWORD"] if environ.get("MYSQL_PASSWORD") else "onlyoffice_pass"

    APP_CORE_BASE_DOMAIN = os.environ["APP_CORE_BASE_DOMAIN"] if environ.get("APP_CORE_BASE_DOMAIN") is not None else "localhost"
    APP_CORE_MACHINEKEY = os.environ["APP_CORE_MACHINEKEY"] if environ.get("APP_CORE_MACHINEKEY") else "your_core_machinekey"
    INSTALLATION_TYPE = os.environ["INSTALLATION_TYPE"].upper() if environ.get("INSTALLATION_TYPE") else "ENTERPRISE"
    APP_URL_PORTAL = os.environ["APP_URL_PORTAL"] if environ.get("APP_URL_PORTAL") else "http://" + ROUTER_HOST + ":8092"
    APP_STORAGE_ROOT = os.environ["APP_STORAGE_ROOT"] if environ.get("APP_STORAGE_ROOT") else BASE_DIR + "/data/"
    APP_KNOWN_PROXIES = os.environ["APP_KNOWN_PROXIES"] if environ.get("APP_KNOWN_PROXIES") is not None else "42"
    APP_KNOWN_NETWORKS = os.environ["APP_KNOWN_NETWORKS"] if environ.get("APP_KNOWN_NETWORKS") is not None else "42"

    DOCUMENT_SERVER_JWT_SECRET = os.environ["DOCUMENT_SERVER_JWT_SECRET"] if environ.get("DOCUMENT_SERVER_JWT_SECRET") else "your_jwt_secret"
    DOCUMENT_SERVER_JWT_HEADER = os.environ["DOCUMENT_SERVER_JWT_HEADER"] if environ.get("DOCUMENT_SERVER_JWT_HEADER") else "AuthorizationJwt"
    DOCUMENT_SERVER_URL_PUBLIC = os.environ["DOCUMENT_SERVER_URL_PUBLIC"] if environ.get("DOCUMENT_SERVER_URL_PUBLIC") else "/ds-vpath/"
    DOCUMENT_SERVER_URL_INTERNAL = os.environ["DOCUMENT_SERVER_URL_INTERNAL"] if environ.get("DOCUMENT_SERVER_URL_INTERNAL") else "http://onlyoffice-document-server/"

    ELK_SHEME = os.environ["ELK_SHEME"] if environ.get("ELK_SHEME") else "http"
    ELK_HOST = os.environ["ELK_HOST"] if environ.get("ELK_HOST") else "onlyoffice-elasticsearch"
    ELK_PORT = os.environ["ELK_PORT"] if environ.get("ELK_PORT") else "9200"
    ELK_THREADS = os.environ["ELK_THREADS"] if environ.get("ELK_THREADS") else "1"

    KAFKA_HOST = os.environ["KAFKA_HOST"] if environ.get("KAFKA_HOST") else "kafka:9092"
    RUN_FILE = sys.argv[2] if (len(sys.argv) > 2) else "none"
    print("RUN_FILE")
    print(RUN_FILE)
    LOG_FILE = sys.argv[3] if (len(sys.argv) > 3) else "none"
    print("LOG_FILE")
    print(LOG_FILE)
    CORE_EVENT_BUS = sys.argv[4] if (len(sys.argv) > 4) else ""
    print("LOG_FILE")
    print(CORE_EVENT_BUS)

    REDIS_HOST = os.environ["REDIS_HOST"] if environ.get("REDIS_HOST") else "onlyoffice-redis"
    REDIS_PORT = os.environ["REDIS_PORT"] if environ.get("REDIS_PORT") else "6379"
    REDIS_USER_NAME = {"User": os.environ["REDIS_USER_NAME"]} if environ.get("REDIS_USER_NAME") else None
    REDIS_PASSWORD = {"Password": os.environ["REDIS_PASSWORD"]} if environ.get("REDIS_PASSWORD") else None

    RABBIT_HOST = os.environ["RABBIT_HOST"] if environ.get("RABBIT_HOST") else "onlyoffice-rabbitmq"
    RABBIT_USER_NAME = os.environ["RABBIT_USER_NAME"] if environ.get("RABBIT_USER_NAME") else "guest"
    RABBIT_PASSWORD = os.environ["RABBIT_PASSWORD"] if environ.get("RABBIT_PASSWORD") else "guest"
    RABBIT_PORT =  os.environ["RABBIT_PORT"] if environ.get("RABBIT_PORT") else "5672"
    RABBIT_VIRTUAL_HOST = os.environ["RABBIT_VIRTUAL_HOST"] if environ.get("RABBIT_VIRTUAL_HOST") else "/"
    RABBIT_URI = {"Uri": os.environ["RABBIT_URI"]} if environ.get("RABBIT_URI") else None



    class RunServices:
        def __init__(self, SERVICE_PORT, PATH_TO_CONF):
            self.SERVICE_PORT = SERVICE_PORT
            self.PATH_TO_CONF = PATH_TO_CONF
        @dispatch(str)    
        def RunService(self, RUN_FILE):
            print("Running node 1")
            os.system("node " + RUN_FILE + " --app.port=" + self.SERVICE_PORT +\
                " --app.appsettings=" + self.PATH_TO_CONF)
            return 1
            
        @dispatch(str, str)
        def RunService(self, RUN_FILE, ENV_EXTENSION):
            if ENV_EXTENSION == "none":
                self.RunService(RUN_FILE)
            print("Running node 2")
            os.system("node " + RUN_FILE + " --app.port=" + self.SERVICE_PORT +\
                " --app.appsettings=" + self.PATH_TO_CONF +\
                    " --app.environment=" + ENV_EXTENSION)
            return 1

        @dispatch(str, str, str)
        def RunService(self, RUN_FILE, ENV_EXTENSION, LOG_FILE):
            data = RUN_FILE.split(".")
            if data[-1] != "dll":
                self.RunService(RUN_FILE, ENV_EXTENSION)
            elif  ENV_EXTENSION == "none":
                print("Running dotnet 1")
                os.system("dotnet " + RUN_FILE + " --urls=" + URLS + self.SERVICE_PORT +\
                    " --\'$STORAGE_ROOT\'=" + APP_STORAGE_ROOT +\
                        " --pathToConf=" + self.PATH_TO_CONF +\
                            " --log:dir=" + LOG_DIR +\
                                " --log:name=" + LOG_FILE +\
                                    " core:products:folder=/var/www/products/" +\
                                        " core:products:subfolder=server" + " " +\
                                            CORE_EVENT_BUS)
            else:
                print("Running dotnet 2")
                os.system("dotnet " + RUN_FILE + " --urls=" + URLS + self.SERVICE_PORT +\
                    " --\'$STORAGE_ROOT\'=" + APP_STORAGE_ROOT +\
                        " --pathToConf=" + self.PATH_TO_CONF +\
                            " --log:dir=" + LOG_DIR +\
                                " --log:name=" + LOG_FILE +\
                                    " --ENVIRONMENT=" + ENV_EXTENSION +\
                                        " core:products:folder=/var/www/products/" +\
                                            " core:products:subfolder=server" + " " +\
                                                CORE_EVENT_BUS)

    def openJsonFile(filePath):
        try:
            with open(filePath, 'r') as f:
                return json.load(f)
        except FileNotFoundError as e:
            return False
        except IOError as e:
            return False

    def parseJsonValue(jsonValue):
        data = jsonValue.split("=")
        data[0] = "$." + data[0].strip()
        data[1] = data[1].replace(" ", "")
        
        return data

    def updateJsonData(jsonData, jsonKey, jsonUpdateValue):
        jsonpath_expr = parse(jsonKey)
        jsonpath_expr.find(jsonData)
        jsonpath_expr.update(jsonData, jsonUpdateValue)
        
        return jsonData

    def writeJsonFile(jsonFile, jsonData, indent=4):
        with open(jsonFile, 'w') as f:
            f.write(json.dumps(jsonData, ensure_ascii=False, indent=indent))
        
        return 1

    #filePath = sys.argv[2]
    saveFilePath = filePath
    #jsonValue = sys.argv[3]

    filePath = "/app/onlyoffice/config/appsettings.json"
    jsonData = openJsonFile(filePath)
    #jsonUpdateValue = parseJsonValue(jsonValue)


    parametrsForUpdate = {
    "$.ConnectionStrings.default.connectionString": "Server="+ MYSQL_HOST +";Port=3306;Database="+ MYSQL_DATABASE +";User ID="+ MYSQL_USER +";Password="+ MYSQL_PASSWORD +";Pooling=true;Character Set=utf8;AutoEnlist=false;SSL Mode=none;ConnectionReset=false;AllowPublicKeyRetrieval=true",
    "$.core.base-domain": APP_CORE_BASE_DOMAIN,
    "$.core.machinekey": APP_CORE_MACHINEKEY,
    "$.core.products.subfolder": "server",
    "$.core.notify.postman": "services",
    "$.web.hub.internal": "http://onlyoffice-socket:"+SERVICE_PORT+"/",
    "$.files.docservice.url.portal": APP_URL_PORTAL,
    "$.files.docservice.url.public": DOCUMENT_SERVER_URL_PUBLIC,
    "$.files.docservice.url.internal": DOCUMENT_SERVER_URL_INTERNAL,
    "$.files.docservice.secret.value":  DOCUMENT_SERVER_JWT_SECRET,
    "$.files.docservice.secret.header": DOCUMENT_SERVER_JWT_HEADER}

    for key, value in parametrsForUpdate.items():
        updateJsonData(jsonData, key, value)

    if INSTALLATION_TYPE == "ENTERPRISE":
        updateJsonData(jsonData, "$.license.file.path", "/app/onlyoffice/data/license.lic")

    ip_address = netifaces.ifaddresses('eth0').get(netifaces.AF_INET)[0].get('addr')
    netmask = netifaces.ifaddresses('eth0').get(netifaces.AF_INET)[0].get('netmask')
    ip_address_netmask = '%s/%s' % (ip_address, netmask)
    interface_cidr = IPNetwork(ip_address_netmask)
    knownNetwork = [str(interface_cidr)]
    knownProxies = ["127.0.0.1"]

    if APP_KNOWN_NETWORKS:
        knownNetwork= knownNetwork + [x.strip() for x in APP_KNOWN_NETWORKS.split(',')]

    if APP_KNOWN_PROXIES:
        knownNetwork= knownNetwork + [x.strip() for x in APP_KNOWN_PROXIES.split(',')]

    updateJsonData(jsonData,"$.core.hosting.forwardedHeadersOptions.knownNetworks", knownNetwork)
    updateJsonData(jsonData,"$.core.hosting.forwardedHeadersOptions.knownProxies", knownProxies)

    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/apisystem.json"
    jsonData = openJsonFile(filePath)
    updateJsonData(jsonData, "$.ConnectionStrings.default.connectionString", "Server="+ MYSQL_HOST +";Port=3306;Database="+ MYSQL_DATABASE +";User ID="+ MYSQL_USER +";Password="+ MYSQL_PASSWORD +";Pooling=true;Character Set=utf8;AutoEnlist=false;SSL Mode=none;ConnectionReset=false;AllowPublicKeyRetrieval=true",)
    updateJsonData(jsonData,"$.core.base-domain", APP_CORE_BASE_DOMAIN)
    updateJsonData(jsonData,"$.core.machinekey", APP_CORE_MACHINEKEY)
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/elastic.json"
    jsonData = openJsonFile(filePath)
    jsonData["elastic"]["Scheme"] = ELK_SHEME
    jsonData["elastic"]["Host"] = ELK_HOST
    jsonData["elastic"]["Port"] = ELK_PORT
    jsonData["elastic"]["Threads"] = ELK_THREADS
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/kafka.json"
    jsonData = openJsonFile(filePath)
    jsonData.update({"kafka": {"BootstrapServers": KAFKA_HOST}})
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/socket.json"
    jsonData = openJsonFile(filePath)
    updateJsonData(jsonData,"$.socket.port", SERVICE_PORT)
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/ssoauth.json"
    jsonData = openJsonFile(filePath)
    updateJsonData(jsonData,"$.ssoauth.port", SERVICE_PORT)
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/rabbitmq.json"
    jsonData = openJsonFile(filePath)
    updateJsonData(jsonData,"$.RabbitMQ.Hostname", RABBIT_HOST)
    updateJsonData(jsonData,"$.RabbitMQ.UserName", RABBIT_USER_NAME)
    updateJsonData(jsonData, "$.RabbitMQ.Password", RABBIT_PASSWORD)
    updateJsonData(jsonData, "$.RabbitMQ.Port", RABBIT_PORT)
    updateJsonData(jsonData, "$.RabbitMQ.VirtualHost", RABBIT_VIRTUAL_HOST)
    jsonData["RabbitMQ"].update(RABBIT_URI) if RABBIT_URI is not None else None
    writeJsonFile(filePath, jsonData)

    filePath = "/app/onlyoffice/config/redis.json"
    jsonData = openJsonFile(filePath)
    updateJsonData(jsonData,"$.Redis.Hosts.[0].Host", REDIS_HOST)
    updateJsonData(jsonData,"$.Redis.Hosts.[0].Port", REDIS_PORT)
    jsonData["Redis"].update(REDIS_USER_NAME) if REDIS_USER_NAME is not None else None
    jsonData["Redis"].update(REDIS_PASSWORD) if REDIS_PASSWORD is not None else None
    writeJsonFile(filePath, jsonData)

    run = RunServices(SERVICE_PORT, PATH_TO_CONF)
    run.RunService(RUN_FILE, ENV_EXTENSION, LOG_FILE)

def migration():
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "onlyoffice")
    MYSQL_USER = os.environ.get("MYSQL_USER", "onlyoffice_user")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "onlyoffice_pass")
    MIGRATION_TYPE = os.environ.get("MIGRATION_TYPE", "STANDALONE")
    PARAMETERS = "standalone=true"

    # Обновляем значение в файле appsettings.runner.json
    connection_string = f"Server={MYSQL_HOST};Database={MYSQL_DATABASE};User ID={MYSQL_USER};Password={MYSQL_PASSWORD}"
    with open("./appsettings.runner.json", "r") as file:
        data = file.read()

    data = re.sub("\"ConnectionString\".*", f"\"ConnectionString\": \"{connection_string}\",", data)

    with open("./appsettings.runner.json", "w") as file:
        file.write(data)

    # Проверяем тип миграции
    if MIGRATION_TYPE == "SAAS":
        PARAMETERS = ""

    # Запускаем приложение с помощью dotnet
    command = f"dotnet ASC.Migration.Runner.dll {PARAMETERS}"
    subprocess.run(command, shell=True)

def healthchecks():


    RUN_DLL = sys.argv[2]
    NAME_SERVICE = sys.argv[3]

    print(f"Executing -- {NAME_SERVICE}")

    PRODUCT = os.environ.get("PRODUCT", "onlyoffice")
    CONTAINER_PREFIX = f"{PRODUCT}-"
    SERVICE_PORT = os.environ.get("SERVICE_PORT", "5050")
    SHEME = os.environ.get("SHEME", "http")
    URLS = os.environ.get("URLS", f"{SHEME}://0.0.0.0:{SERVICE_PORT}")
    PATH_TO_CONF = os.environ.get("/var/www/services/ASC.Web.HealthChecks.UI/service")

    API_SYSTEM_HOST = os.environ.get("API_SYSTEM_HOST", f"{CONTAINER_PREFIX}api-system:{SERVICE_PORT}")
    BACKUP_HOST = os.environ.get("BACKUP_HOST", f"{CONTAINER_PREFIX}backup:{SERVICE_PORT}")
    BACKUP_BACKGRUOND_TASKS_HOST = os.environ.get("BACKUP_BACKGRUOND_TASKS_HOST", f"{CONTAINER_PREFIX}backup-background-tasks:{SERVICE_PORT}")
    CLEAR_EVENTS_HOST = os.environ.get("CLEAR_EVENTS_HOST", f"{CONTAINER_PREFIX}clear-events:{SERVICE_PORT}")
    FILES_HOST = os.environ.get("FILES_HOST", f"{CONTAINER_PREFIX}files:{SERVICE_PORT}")
    FILES_SERVICES_HOST = os.environ.get("FILES_SERVICES_HOST", f"{CONTAINER_PREFIX}files-services:{SERVICE_PORT}")
    NOTIFY_HOST = os.environ.get("NOTIFY_HOST", f"{CONTAINER_PREFIX}notify:{SERVICE_PORT}")
    PEOPLE_SERVER_HOST = os.environ.get("PEOPLE_SERVER_HOST", f"{CONTAINER_PREFIX}people-server:{SERVICE_PORT}")
    STUDIO_NOTIFY_HOST = os.environ.get("STUDIO_NOTIFY_HOST", f"{CONTAINER_PREFIX}studio-notify:{SERVICE_PORT}")
    API_HOST = os.environ.get("API_HOST", f"{CONTAINER_PREFIX}api:{SERVICE_PORT}")
    STUDIO_HOST = os.environ.get("STUDIO_HOST", f"{CONTAINER_PREFIX}studio:{SERVICE_PORT}")

    with open(f"{PATH_TO_CONF}/appsettings.json", "r") as f:
        appsettings_content = f.read()

    appsettings_content = appsettings_content.replace("localhost:5010", API_SYSTEM_HOST)
    appsettings_content = appsettings_content.replace("localhost:5012", BACKUP_HOST)
    appsettings_content = appsettings_content.replace("localhost:5032", BACKUP_BACKGRUOND_TASKS_HOST)
    appsettings_content = appsettings_content.replace("localhost:5027", CLEAR_EVENTS_HOST)
    appsettings_content = appsettings_content.replace("localhost:5007", FILES_HOST)
    appsettings_content = appsettings_content.replace("localhost:5009", FILES_SERVICES_HOST)
    appsettings_content = appsettings_content.replace("localhost:5005", NOTIFY_HOST)
    appsettings_content = appsettings_content.replace("localhost:5004", PEOPLE_SERVER_HOST)
    appsettings_content = appsettings_content.replace("localhost:5000", API_HOST)
    appsettings_content = appsettings_content.replace("localhost:5006", STUDIO_NOTIFY_HOST)
    appsettings_content = appsettings_content.replace("localhost:5003", STUDIO_HOST)

    with open(f"{PATH_TO_CONF}/appsettings.json", "w") as f:
        f.write(appsettings_content)

    os.system(f"dotnet {RUN_DLL} --urls={URLS}")




args = sys.argv[1:]

if len(args) == 0:
    print("You must specify the function name in the command line arguments")
else:
    function_name = args[0]
    if function_name == 'main':
        main()
    elif function_name=='healthchecks':
        healthchecks()
    elif function_name=='migration':
        migration()
    else:
        print("Wrong func name")

