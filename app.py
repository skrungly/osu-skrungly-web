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

modes = ["osu!", "osu!taiko", "osu!catch", "osu!mania"]

# now for the web stuff
app = Flask(__name__)

@app.route("/")
def index():
    return "osu!"

@app.route("/u/<int:user_id>")
def user(user_id):
    score_data = {mode_name: {
        "pp": 0.0,
        "scores": [],
        "plays": 0,
        "score": 0,
    } for mode_name in modes}

    mode_order = []

    with db.cursor() as cursor:
        query = "SELECT * FROM users WHERE id=(%s)"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()

        for mode_id, mode_name in enumerate(modes):
            query = "SELECT COUNT(*), SUM(score) FROM scores WHERE userid=(%s) && mode=(%s)"
            cursor.execute(query, (user_id, mode_id,))
            amount = cursor.fetchone()

            score_data[mode_name]["plays"] = amount["COUNT(*)"] or 0
            score_data[mode_name]["score"] = int(amount["SUM(score)"] or 0)

            mode_order.append(
                (mode_name, amount["COUNT(*)"])
            )

        query = "SELECT * FROM scores WHERE userid=(%s) && status!=0 ORDER BY pp DESC"
        cursor.execute(query, (user_id,))
        scores = cursor.fetchall()

        seen_md5s = set()
        for score in scores:
            map_md5 = score["map_md5"]
            if map_md5 in seen_md5s:
                continue

            seen_md5s.add(map_md5)

            query = "SELECT * FROM maps WHERE md5=(%s)"
            cursor.execute(query, (map_md5,))
            beatmap = cursor.fetchone()

            mode_name = modes[beatmap["mode"]]
            mode_data = score_data[mode_name]

            place = len(mode_data["scores"])
            mode_data["pp"] += score["pp"] * (0.95 ** place)
            mode_data["scores"].append(
                (beatmap, score)
            )

            if place >= 99:
                break

        db.commit()

    mode_order.sort(key=lambda mode: mode[1], reverse=True)

    return render_template("user.html", user=user, score_data=score_data, mode_order=mode_order)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
