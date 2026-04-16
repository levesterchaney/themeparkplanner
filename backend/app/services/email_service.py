import logging
from pathlib import Path
from typing import Any, Dict

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str, subject: str, body: Dict[str, Any], template: str
) -> bool:
    """
    Send an email to the specified recipient.

    Args:
        to_email (str): The recipient's email address.
        subject (str): The subject of the email.
        body (Dict[str, Any]): The template variables for the email.
        template (str): The email template to use.

    Returns:
        bool: True if the email was sent successfully, False otherwise.
    """
    # Use centralized settings configuration
    config = ConnectionConfig(
        MAIL_USERNAME=settings.mail_username,
        MAIL_PASSWORD=settings.mail_password,
        MAIL_FROM=settings.mail_from,
        MAIL_PORT=settings.mail_port,
        MAIL_SERVER=settings.mail_server,
        MAIL_FROM_NAME=settings.mail_from_name,
        MAIL_STARTTLS=settings.mail_starttls,
        MAIL_SSL_TLS=settings.mail_ssl_tls,
        USE_CREDENTIALS=settings.use_credentials,
        VALIDATE_CERTS=settings.validate_certs,
        TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email",
    )

    try:
        logger.info(f"Attempting to send email to {to_email} with subject: {subject}")

        mailer = FastMail(config)
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            template_body=body,
            subtype=MessageType.html,
        )
        await mailer.send_message(message, template_name=template)

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}", exc_info=True)
        return False
