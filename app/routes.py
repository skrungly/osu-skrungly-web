from datetime import datetime, timedelta
import hashlib
import os

from flask import redirect, render_template, request, send_from_directory, url_for
import bcrypt

from app import app, db
from app.utils import Mods

RECENT_SCORE_AGE = timedelta(days=1)

# TODO: maybe turn these into enums?
WEB_MODES = {0: "osu!", 1: "osu!taiko", 2: "osu!catch", 3: "osu!mania", 4: "osu!relax"}

USER_STATS = {
    "pp": "pp",
    "total_hits": "circles clicked",
    "plays": "plays",
    "tscore": "total score"
}

RANKED_MODES = [2, 3]


@app.route("/")
def index():
    global_stats = {}

    db.ping()
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM users u "
            "INNER JOIN ( "
            "    SELECT id, SUM(plays) _plays "
            "    FROM stats "
            "    GROUP BY id "
            ") p ON u.id = p.id "
            "ORDER BY p._plays DESC "
        )

        users = cursor.fetchall()

        for stat_name, stat_desc in USER_STATS.items():
            cursor.execute(f"SELECT SUM({stat_name}) FROM stats")
            stats = cursor.fetchone()
            global_stats[stat_desc] = int(list(stats.values())[0])

    return render_template("index.html", users=users, stats=global_stats)


# @app.route("/u/<int:user_id>", methods=['GET'])
def user_view_id(user_id, response=None):
    db.ping()
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT safe_name FROM users WHERE id=(%s)",
            (user_id,)
        )
        safe_name = cursor.fetchone()["safe_name"]

    return redirect(url_for("user_view_name", safe_name=safe_name))


# @app.route("/u/<safe_name>", methods=['GET'])
def user_view_name(safe_name, response=None):
    score_data = {mode_name: {
        "scores": [],
    } for mode_name in WEB_MODES.values()}

    overall_stats = {stat_name: 0 for stat_name in USER_STATS.values()}

    default_mode = WEB_MODES[0]
    most_pp = 0

    db.ping()
    with db.cursor() as cursor:
        cursor.execute(
            # i don't know if this could clash at all, but it's
            # not going to be an issue on a server like this!
            "SELECT * FROM users WHERE safe_name=(%s)",
            (safe_name,)
        )
        user = cursor.fetchone()

        for mode_id, mode_name in WEB_MODES.items():
            cursor.execute(
                "SELECT * FROM stats WHERE id=(%s) && mode=(%s)",
                (user["id"], mode_id,)
            )

            stats = cursor.fetchone()

            for stat_name, stat_desc in USER_STATS.items():
                score_data[mode_name][stat_desc] = stats[stat_name]
                overall_stats[stat_desc] += stats[stat_name]

            # make your best gamemode the default
            if score_data[mode_name]["pp"] > most_pp:
                default_mode = WEB_MODES[mode_id]
                most_pp = score_data[mode_name]["pp"]

        cursor.execute(
            "SELECT * FROM scores "
            "WHERE userid=(%s) && status=2 "
            "ORDER BY pp DESC",
            (user["id"],)
        )
        scores = cursor.fetchall()
        last_scores = {mode: None for mode in WEB_MODES.values()}
        recent_scores = []

        # filter for top 100 pp-yielding scores in each mode
        seen_md5s = {mode_id: set() for mode_id in WEB_MODES}
        for score in scores:
            mode = score["mode"]
            if mode not in WEB_MODES:
                continue

            mode_name = WEB_MODES[mode]
            if len(score_data[mode_name]["scores"]) >= 100:
                continue

            map_md5 = score["map_md5"]
            if map_md5 in seen_md5s[mode]:
                continue

            seen_md5s[mode].add(map_md5)

            # no need to show +RX on relax page
            shown_mods = Mods(score["mods"]) & ~Mods.RX
            score["mods_str"] = str(shown_mods)

            cursor.execute(
                "SELECT * FROM maps WHERE md5=(%s)",
                (map_md5,)
            )
            beatmap = cursor.fetchone()

            if not beatmap or beatmap["status"] not in RANKED_MODES:
                continue

            score_data[mode_name]["scores"].append(
                (beatmap, score)
            )

            last_score = last_scores[mode_name]
            if not last_score or score["play_time"] > last_score["play_time"]:
                last_scores[mode_name] = score

            if datetime.now() - score["play_time"] < RECENT_SCORE_AGE:
                recent_scores.append(score["id"])

        db.commit()

    return render_template(
        "user.html",
        user=user,
        score_data=score_data,
        last_scores=last_scores,
        recent_scores=recent_scores,
        default_mode=default_mode,
        overall_stats=overall_stats,
        response=response
    )


# @app.route("/u/<safe_name>", methods=['POST'])
def user_edit_name(safe_name):
    db.ping()
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM users WHERE safe_name=(%s)",
            (safe_name,)
        )

        user_id = cursor.fetchone()['id']

    form_data = request.form

    error_reasons = []

    username = form_data["username"]
    message = form_data["message"]
    new_password = form_data["new_password"]
    password = form_data["password"]

    pw_md5 = hashlib.md5(password.encode()).hexdigest().encode()

    db.ping()
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
        return user_view_name(safe_name, error)

    db.ping()
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

    return user_view_name(safe_name, response)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico'
    )
