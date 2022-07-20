import os

from flask import Flask
import pymysql

# start with some boring database stuff
db = pymysql.connect(
    host="mysql",
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    db=os.environ["MYSQL_DATABASE"],
    cursorclass=pymysql.cursors.DictCursor,
)

# now for the web stuff
app = Flask(__name__)

@app.route("/")
def index():
    return "osu!"

@app.route("/u/<int:user_id>")
def user(user_id):
    with db.cursor() as cursor:
        query = "SELECT name FROM users WHERE id=(%s)"
        cursor.execute(query, (user_id,))

        record = cursor.fetchone()

    return record["name"]

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
