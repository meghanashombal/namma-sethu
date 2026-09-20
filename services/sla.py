from datetime import datetime

import mysql.connector

from config import Config


def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


def check_sla_breaches():
    """
    Check SLA deadlines and create automatic escalations.

    Level 1:
        Routing deadline passed
        -> status becomes SLA_BREACHED
        -> SLA_BREACH escalation created

    Level 2:
        Resolution deadline passed
        -> HIGHER_AUTHORITY escalation created

    Duplicate escalation records are prevented.
    """

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        current_time = datetime.now()

        breached_count = 0
        level1_escalated_count = 0
        level2_escalated_count = 0


        # =====================================================
        # LEVEL 1
        # ROUTING SLA BREACH
        # =====================================================

        cursor.execute(
            """
            SELECT
                complaint_id,
                complaint_code,
                issue_type,
                priority,
                status,
                routing_deadline
            FROM complaints
            WHERE
                routing_deadline IS NOT NULL
                AND routing_deadline < %s
                AND status IN (
                    'SUBMITTED',
                    'CHECKING_LOCATION',
                    'MANUAL_REVIEW'
                )
            """,
            (
                current_time,
            )
        )

        breached_complaints = cursor.fetchall()


        # =====================================================
        # PROCESS LEVEL 1 BREACHES
        # =====================================================

        for complaint in breached_complaints:

            complaint_id = complaint[
                "complaint_id"
            ]

            old_status = complaint[
                "status"
            ]

            issue_type = complaint[
                "issue_type"
            ]

            priority = complaint[
                "priority"
            ]


            # -------------------------------------------------
            # FIND LEVEL 1 SLA BREACH POLICY
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT
                    escalation_policy_id,
                    level_number,
                    action_type,
                    description
                FROM escalation_policies
                WHERE
                    is_active = TRUE
                    AND level_number = 1
                    AND action_type = 'SLA_BREACH'
                    AND (
                        issue_type = %s
                        OR issue_type = 'ALL'
                    )
                    AND (
                        priority = %s
                        OR priority IS NULL
                    )
                ORDER BY
                    CASE
                        WHEN issue_type = %s THEN 0
                        ELSE 1
                    END
                LIMIT 1
                """,
                (
                    issue_type,
                    priority,
                    issue_type
                )
            )

            level1_policy = cursor.fetchone()


            # -------------------------------------------------
            # MARK COMPLAINT AS SLA BREACHED
            # -------------------------------------------------

            cursor.execute(
                """
                UPDATE complaints
                SET
                    status = 'SLA_BREACHED',
                    updated_at = CURRENT_TIMESTAMP
                WHERE complaint_id = %s
                """,
                (
                    complaint_id,
                )
            )


            # -------------------------------------------------
            # SAVE STATUS HISTORY
            # -------------------------------------------------

            cursor.execute(
                """
                INSERT INTO complaint_status_history (
                    complaint_id,
                    old_status,
                    new_status,
                    changed_by,
                    note
                )
                VALUES (
                    %s,
                    %s,
                    'SLA_BREACHED',
                    NULL,
                    %s
                )
                """,
                (
                    complaint_id,
                    old_status,
                    (
                        "Routing SLA breached. "
                        "The complaint was not routed within "
                        "the required 24-hour period."
                    )
                )
            )


            breached_count += 1


            # -------------------------------------------------
            # CREATE LEVEL 1 ESCALATION
            # -------------------------------------------------

            if level1_policy:

                cursor.execute(
                    """
                    SELECT
                        escalation_id
                    FROM complaint_escalations
                    WHERE
                        complaint_id = %s
                        AND escalation_type = 'SLA_BREACH'
                        AND resolved_at IS NULL
                    LIMIT 1
                    """,
                    (
                        complaint_id,
                    )
                )

                existing_level1 = cursor.fetchone()


                if not existing_level1:

                    cursor.execute(
                        """
                        INSERT INTO complaint_escalations (
                            complaint_id,
                            escalation_policy_id,
                            level_number,
                            escalation_type,
                            reason,
                            created_by
                        )
                        VALUES (
                            %s,
                            %s,
                            %s,
                            'SLA_BREACH',
                            %s,
                            NULL
                        )
                        """,
                        (
                            complaint_id,
                            level1_policy[
                                "escalation_policy_id"
                            ],
                            level1_policy[
                                "level_number"
                            ],
                            (
                                "Routing SLA breached. "
                                "Complaint automatically escalated "
                                "according to the active SLA policy."
                            )
                        )
                    )

                    level1_escalated_count += 1


        # =====================================================
        # LEVEL 2
        # RESOLUTION SLA BREACH
        # =====================================================

        cursor.execute(
            """
            SELECT
                complaint_id,
                complaint_code,
                issue_type,
                priority,
                status,
                resolution_deadline
            FROM complaints
            WHERE
                resolution_deadline IS NOT NULL
                AND resolution_deadline < %s
                AND status NOT IN (
                    'RESOLVED',
                    'CLOSED'
                )
            """,
            (
                current_time,
            )
        )

        unresolved_complaints = cursor.fetchall()


        # =====================================================
        # PROCESS LEVEL 2 ESCALATIONS
        # =====================================================

        for complaint in unresolved_complaints:

            complaint_id = complaint[
                "complaint_id"
            ]

            issue_type = complaint[
                "issue_type"
            ]

            priority = complaint[
                "priority"
            ]


            # -------------------------------------------------
            # FIND LEVEL 2 POLICY
            # -------------------------------------------------

            cursor.execute(
                """
                SELECT
                    escalation_policy_id,
                    level_number,
                    action_type,
                    description
                FROM escalation_policies
                WHERE
                    is_active = TRUE
                    AND level_number = 2
                    AND action_type = 'HIGHER_AUTHORITY'
                    AND (
                        issue_type = %s
                        OR issue_type = 'ALL'
                    )
                    AND (
                        priority = %s
                        OR priority IS NULL
                    )
                ORDER BY
                    CASE
                        WHEN issue_type = %s THEN 0
                        ELSE 1
                    END
                LIMIT 1
                """,
                (
                    issue_type,
                    priority,
                    issue_type
                )
            )

            level2_policy = cursor.fetchone()


            # -------------------------------------------------
            # CREATE LEVEL 2 ESCALATION
            # -------------------------------------------------

            if level2_policy:

                cursor.execute(
                    """
                    SELECT
                        escalation_id
                    FROM complaint_escalations
                    WHERE
                        complaint_id = %s
                        AND level_number = 2
                        AND escalation_type = 'HIGHER_AUTHORITY'
                        AND resolved_at IS NULL
                    LIMIT 1
                    """,
                    (
                        complaint_id,
                    )
                )

                existing_level2 = cursor.fetchone()


                if not existing_level2:

                    cursor.execute(
                        """
                        INSERT INTO complaint_escalations (
                            complaint_id,
                            escalation_policy_id,
                            level_number,
                            escalation_type,
                            reason,
                            created_by
                        )
                        VALUES (
                            %s,
                            %s,
                            %s,
                            'HIGHER_AUTHORITY',
                            %s,
                            NULL
                        )
                        """,
                        (
                            complaint_id,
                            level2_policy[
                                "escalation_policy_id"
                            ],
                            level2_policy[
                                "level_number"
                            ],
                            (
                                "Resolution SLA breached. "
                                "The complaint remains unresolved "
                                "after the defined resolution period "
                                "and has been escalated to a higher authority."
                            )
                        )
                    )

                    level2_escalated_count += 1


        # =====================================================
        # SAVE ALL CHANGES
        # =====================================================

        connection.commit()


        # =====================================================
        # RETURN RESULT
        # =====================================================

        return {
            "success": True,
            "breached_count": breached_count,
            "level1_escalated_count": level1_escalated_count,
            "level2_escalated_count": level2_escalated_count
        }


    except mysql.connector.Error as error:

        if connection:
            connection.rollback()

        return {
            "success": False,
            "breached_count": 0,
            "level1_escalated_count": 0,
            "level2_escalated_count": 0,
            "error": str(error)
        }


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()