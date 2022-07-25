import os
import json

from flask import Flask, render_template
import pymysql

# start with some boring database stuff
db = pymysql.connect(
    host="mysql",
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    db=os.environ["MYSQL_DATABASE"],
    cursorclass=pymysql.cursors.DictCursor,
)

mode_map = ["osu!", "osu!taiko", "osu!catch", "osu!mania", "osu!relax"]

# now for the web stuff
app = Flask(__name__)

@app.route("/")
def index():
    return "osu!"

@app.route("/u/<int:user_id>")
def user(user_id):
    top_plays = {mode: [] for mode in mode_map}

    with db.cursor() as cursor:
        query = "SELECT * FROM users WHERE id=(%s)"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()

        query = "SELECT * FROM scores WHERE userid=(%s) && status!=0 ORDER BY pp DESC"
        cursor.execute(query, (user_id,))
        scores = cursor.fetchall()

        for score in scores:
            query = "SELECT * FROM maps WHERE md5=(%s)"
            cursor.execute(query, (score["map_md5"],))
            beatmap = cursor.fetchone()

            mode = mode_map[beatmap["mode"]]
            top_plays[mode].append(
                (beatmap, score)
            )

        db.commit()

    return render_template("user.html", user=user, modes=top_plays)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
