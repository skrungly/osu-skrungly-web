import hashlib
import json
import os

from flask import Flask, render_template, request
import bcrypt
import pymysql

# start with some boring database stuff
db = pymysql.connect(
    host="mysql",
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    db=os.environ["MYSQL_DATABASE"],
    cursorclass=pymysql.cursors.DictCursor,
)

web_modes = {0: "osu!", 1: "osu!taiko", 2: "osu!catch", 3: "osu!mania", 4: "osu!relax"}

# now for the web stuff
app = Flask(__name__)


@app.route("/")
def index():
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()

    return render_template("index.html", users=users)


@app.route("/u/<int:user_id>", methods=['GET'])
def user_view(user_id, response=None):
    score_data = {mode_name: {
        "scores": [],
    } for mode_name in web_modes.values()}

    default_mode = web_modes[0]

    with db.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE id=(%s)",
            (user_id,)
        )
        user = cursor.fetchone()

        for mode_id, mode_name in web_modes.items():
            cursor.execute(
                "SELECT pp, plays, rscore, tscore FROM stats "
                "WHERE id=(%s) && mode=(%s)",
                (user_id, mode_id,)
            )

            stats = cursor.fetchone()
            score_data[mode_name].update(stats)

        cursor.execute(
            "SELECT * FROM scores "
            "WHERE userid=(%s) && status=2 "
            "ORDER BY pp DESC",
            (user_id,)
        )
        scores = cursor.fetchall()

        seen_md5s = {mode_id: set() for mode_id in web_modes}
        for score in scores:
            if score["mode"] not in web_modes:
                continue

            map_md5 = score["map_md5"]
            if map_md5 in seen_md5s[score["mode"]]:
                continue

            seen_md5s[score["mode"]].add(map_md5)

            cursor.execute(
                "SELECT * FROM maps WHERE md5=(%s)",
                (map_md5,)
            )
            beatmap = cursor.fetchone()

            if beatmap["status"] != 2:
                continue

            mode_name = web_modes[score["mode"]]
            score_data[mode_name]["scores"].append(
                (beatmap, score)
            )

            if len(score_data[mode_name]["scores"]) >= 100:
                break

        db.commit()

    return render_template(
        "user.html",
        user=user,
        score_data=score_data,
        default_mode=default_mode,
        response=response
    )


@app.route("/u/<int:user_id>", methods=['POST'])
def user_edit(user_id):
    form_data = request.form

    error_reasons = []

    username = form_data["username"]
    message = form_data["message"]
    new_password = form_data["new_password"]
    password = form_data["password"]

    pw_md5 = hashlib.md5(password.encode()).hexdigest().encode()

    with db.cursor() as cursor:
        cursor.execute(
            "SELECT pw_bcrypt FROM users WHERE id=(%s)",
            (user_id,)
        )
        pw_bcrypt, = cursor.fetchone().values()

        cursor.execute(
            "SELECT 1 FROM users WHERE name=(%s)",
            (username,)
        )
        username_taken = bool(cursor.fetchone())

        db.commit()

    # do all of the usual checks.
    if not (username or message or new_password):
        error_reasons.append("you did not change anything.")

    if username_taken:
        error_reasons.append(
            "username is already in use."
        )

    if username and not (3 <= len(username) <= 15):
        error_reasons.append(
            "username must be between 3 and 15 characters."
        )

    if new_password and not (8 <= len(new_password) <= 32):
        error_reasons.append(
            "new password must be between 8 and 32 characters."
        )

    if new_password and len(set(new_password)) < 3:
        error_reasons.append(
            "new password must contain at least 3 unique characters."
        )

    if message and len(message) > 2000:
        error_reasons.append(
            "profile message must not exceed 2000 characters."
        )

    if not bcrypt.checkpw(pw_md5, pw_bcrypt.encode()):
        error_reasons.append("password does not match.")

    # finally, display an error if necessary.
    if error_reasons:
        error = {
            "title": "user profile could not be updated.",
            "message": "\n".join(error_reasons),
            "type": "danger",
        }
        return user_view(user_id, error)

    with db.cursor() as cursor:
        if username:
            safe_name = username.lower().replace(" ", "_")
            cursor.execute(
                "UPDATE users SET name=(%s), safe_name=(%s) WHERE id=(%s)",
                (username, safe_name, user_id)
            )

        if new_password:
            new_pw_md5 = hashlib.md5(new_password.encode()).hexdigest().encode()
            new_pw_bcrypt = bcrypt.hashpw(new_pw_md5, bcrypt.gensalt())

            cursor.execute(
                "UPDATE users SET pw_bcrypt=(%s) WHERE id=(%s)",
                (new_pw_bcrypt, user_id)
            )

        if message:
            cursor.execute(
                "UPDATE users SET userpage_content=(%s) WHERE id=(%s)",
                (message, user_id)
            )

        db.commit()

    response = {
        "title": "user profile was successfully updated.",
        "message": "the changes you've made should already be visible.",
        "type": "success",
    }
    return user_view(user_id, response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
