from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from config import Config

auth_bp = Blueprint("auth", __name__)


def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


@auth_bp.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "GET":
        return render_template("login.html")

    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")

    if not email or not password:
        flash(
            "Please enter your email and password.",
            "danger"
        )
        return redirect(url_for("auth.login"))

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                password_hash,
                role
            FROM users
            WHERE email = %s
            AND is_active = TRUE
            """,
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user and check_password_hash(
            user["password_hash"],
            password
        ):
            session["user_id"] = user["user_id"]
            session["user_name"] = user["name"]
            session["user_role"] = user["role"]

            return redirect(url_for("home"))

        flash(
            "Invalid email or password.",
            "danger"
        )
        return redirect(url_for("auth.login"))

    except mysql.connector.Error:
        flash(
            "Database connection is not available yet. "
            "Please try again after the database is configured.",
            "danger"
        )
        return redirect(url_for("auth.login"))


@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():

    if request.method == "GET":
        return render_template("signup.html")

    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    phone = request.form.get("phone", "").strip()
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")

    if not name or not email or not password:
        flash(
            "Name, email and password are required.",
            "danger"
        )
        return redirect(url_for("auth.signup"))

    if password != confirm_password:
        flash(
            "Passwords do not match.",
            "danger"
        )
        return redirect(url_for("auth.signup"))

    if len(password) < 8:
        flash(
            "Password must contain at least 8 characters.",
            "danger"
        )
        return redirect(url_for("auth.signup"))

    password_hash = generate_password_hash(password)

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO users
                (name, email, password_hash, role, phone)
            VALUES
                (%s, %s, %s, 'CITIZEN', %s)
            """,
            (
                name,
                email,
                password_hash,
                phone
            )
        )

        connection.commit()

        cursor.close()
        connection.close()

        flash(
            "Account created successfully. Please log in.",
            "success"
        )

        return redirect(url_for("auth.login"))

    except mysql.connector.IntegrityError:
        flash(
            "An account with this email already exists.",
            "danger"
        )
        return redirect(url_for("auth.signup"))

    except mysql.connector.Error:
        flash(
            "Database connection is not available yet. "
            "Please try again after the database is configured.",
            "danger"
        )
        return redirect(url_for("auth.signup"))


@auth_bp.route("/logout")
def logout():

    session.clear()

    flash(
        "You have been logged out successfully.",
        "success"
    )

    return redirect(url_for("home"))