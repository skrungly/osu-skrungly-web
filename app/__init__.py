import os

from flask import Flask
import pymysql

app = Flask(__name__)

db = pymysql.connect(
    host="mysql",
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    db=os.environ["MYSQL_DATABASE"],
    cursorclass=pymysql.cursors.DictCursor,
)

from app import routes  # noqa: F401, E402
