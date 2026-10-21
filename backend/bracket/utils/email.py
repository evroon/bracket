import logging
from email.message import EmailMessage

import aiosmtplib

from bracket.config import config

logger = logging.getLogger(__name__)


def is_email_configured() -> bool:
    return config.smtp_host is not None


async def send_email(to_address: str, subject: str, body: str) -> bool:
    """Send a plain-text email. Returns True only if the SMTP server accepted the email."""
    if config.smtp_host is None:
        logger.info(f"SMTP not configured, skipping email to {to_address} (subject: {subject})")
        return False

    message = EmailMessage()
    message["From"] = config.smtp_from_address or config.smtp_username
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=config.smtp_host,
            port=config.smtp_port,
            username=config.smtp_username,
            password=config.smtp_password,
            start_tls=config.smtp_use_tls,
        )
    except Exception:
        logger.exception(f"Failed to send email to {to_address}")
        return False

    return True