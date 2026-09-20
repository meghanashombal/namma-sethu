from flask import Blueprint, render_template, request, redirect, url_for, flash
import mysql.connector
from config import Config

tracking_bp = Blueprint("tracking", __name__)


def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


@tracking_bp.route("/track", methods=["GET", "POST"])
def track():

    complaint = None
    status_history = []

    if request.method == "POST":

        complaint_code = request.form.get(
            "complaint_code",
            ""
        ).strip().upper()

        if not complaint_code:
            flash(
                "Please enter a complaint tracking ID.",
                "danger"
            )
            return redirect(url_for("tracking.track"))

        try:

            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)

            # Get complaint details
            cursor.execute(
                """
                SELECT
                    complaint_id,
                    complaint_code,
                    issue_type,
                    description,
                    location_text,
                    priority,
                    status,
                    created_at,
                    updated_at
                FROM complaints
                WHERE complaint_code = %s
                """,
                (complaint_code,)
            )

            complaint = cursor.fetchone()

            # Get complaint status history
            if complaint:

                cursor.execute(
                    """
                    SELECT
                        old_status,
                        new_status,
                        changed_at,
                        note
                    FROM complaint_status_history
                    WHERE complaint_id = %s
                    ORDER BY changed_at ASC
                    """,
                    (complaint["complaint_id"],)
                )

                status_history = cursor.fetchall()

            cursor.close()
            connection.close()

            if not complaint:
                flash(
                    "No complaint found with that tracking ID.",
                    "warning"
                )

        except mysql.connector.Error:

            flash(
                "There was a database error while tracking "
                "your complaint.",
                "danger"
            )

    return render_template(
        "tracking.html",
        complaint=complaint,
        status_history=status_history
    )