from __future__ import annotations

import logging
import os
import smtplib
from dataclasses import dataclass
from datetime import datetime
from email.message import EmailMessage
from typing import Dict, Optional

from sqlalchemy.orm import Session

import sql_models as models

logger = logging.getLogger("email_service")


@dataclass
class EmailProviderConfig:
    provider: str = "noop"
    sender_name: str = "VOKASI"
    sender_email: str = "noreply@localhost"
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True


class EmailProvider:
    def send(self, to_email: str, subject: str, html: str, text: str) -> None:
        raise NotImplementedError

    def healthcheck(self) -> Dict[str, str]:
        raise NotImplementedError


class NoopProvider(EmailProvider):
    def send(self, to_email: str, subject: str, html: str, text: str) -> None:
        logger.info("NOOP email send to=%s subject=%s", to_email, subject)

    def healthcheck(self) -> Dict[str, str]:
        return {"status": "ok", "message": "Noop provider active"}


class SmtpProvider(EmailProvider):
    def __init__(self, config: EmailProviderConfig) -> None:
        self.config = config

    def send(self, to_email: str, subject: str, html: str, text: str) -> None:
        if not self.config.smtp_host:
            raise RuntimeError("SMTP host missing")
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"{self.config.sender_name} <{self.config.sender_email}>"
        msg["To"] = to_email
        msg.set_content(text)
        msg.add_alternative(html, subtype="html")

        with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port, timeout=15) as smtp:
            if self.config.smtp_use_tls:
                smtp.starttls()
            if self.config.smtp_username and self.config.smtp_password:
                smtp.login(self.config.smtp_username, self.config.smtp_password)
            smtp.send_message(msg)

    def healthcheck(self) -> Dict[str, str]:
        if not self.config.smtp_host:
            return {"status": "error", "message": "SMTP host not configured"}
        return {"status": "ok", "message": "SMTP appears configured"}


EMAIL_TEMPLATES = {
    "registration_received": {
        "subject": "Pendaftaran VOKASI diterima",
        "text": "Pendaftaran kamu sudah kami terima. Lanjutkan setup awal untuk melanjutkan ke pembayaran.",
    },
    "payment_initiated": {
        "subject": "Pembayaran sedang diproses",
        "text": "Pembayaran kamu sudah dibuat. Selesaikan pembayaran agar akses belajar aktif.",
    },
    "payment_success": {
        "subject": "Pembayaran berhasil",
        "text": "Pembayaran kamu berhasil. Silakan lanjutkan onboarding pasca pembayaran.",
    },
    "payment_pending": {
        "subject": "Pembayaran masih tertunda",
        "text": "Pembayaran kamu masih tertunda. Kamu bisa melanjutkan dari halaman pembayaran.",
    },
    "payment_expired": {
        "subject": "Pembayaran kadaluarsa",
        "text": "Sesi pembayaran kadaluarsa. Silakan buat sesi pembayaran baru.",
    },
    "onboarding_reminder": {
        "subject": "Lanjutkan onboarding VOKASI",
        "text": "Akses belajar aktif, tapi onboarding belum selesai. Lanjutkan onboarding untuk aktivasi penuh.",
    },
    "onboarding_completed": {
        "subject": "Onboarding selesai",
        "text": "Selamat, onboarding kamu selesai. Kamu siap memulai perjalanan belajar.",
    },
}


def _read_admin_secret(db: Session, key_name: str) -> Optional[str]:
    try:
        from routers.admin_settings import AdminSecret, _decrypt
    except Exception:
        return None
    row = db.query(AdminSecret).filter(AdminSecret.key_name == key_name).first()
    if not row:
        return None
    try:
        return _decrypt(row.encrypted_value)
    except Exception:
        return None


def load_email_config(db: Session) -> EmailProviderConfig:
    provider = (
        _read_admin_secret(db, "EMAIL_PROVIDER")
        or os.getenv("EMAIL_PROVIDER", "noop")
    ).strip().lower()
    return EmailProviderConfig(
        provider=provider,
        sender_name=_read_admin_secret(db, "EMAIL_SENDER_NAME") or os.getenv("EMAIL_SENDER_NAME", "VOKASI"),
        sender_email=_read_admin_secret(db, "EMAIL_SENDER_ADDRESS") or os.getenv("EMAIL_SENDER_ADDRESS", "noreply@localhost"),
        smtp_host=_read_admin_secret(db, "SMTP_HOST") or os.getenv("SMTP_HOST"),
        smtp_port=int(_read_admin_secret(db, "SMTP_PORT") or os.getenv("SMTP_PORT", "587")),
        smtp_username=_read_admin_secret(db, "SMTP_USERNAME") or os.getenv("SMTP_USERNAME"),
        smtp_password=_read_admin_secret(db, "SMTP_PASSWORD") or os.getenv("SMTP_PASSWORD"),
        smtp_use_tls=(_read_admin_secret(db, "SMTP_USE_TLS") or os.getenv("SMTP_USE_TLS", "true")).lower() != "false",
    )


def build_provider(config: EmailProviderConfig) -> EmailProvider:
    if config.provider == "smtp":
        return SmtpProvider(config)
    return NoopProvider()


def send_transactional_email(
    db: Session,
    *,
    template_key: str,
    to_email: str,
    context: Optional[Dict[str, str]] = None,
) -> None:
    context = context or {}
    tpl = EMAIL_TEMPLATES.get(template_key)
    if not tpl:
        raise ValueError(f"Unknown email template: {template_key}")
    text = tpl["text"].format(**context)
    html = f"<p>{text}</p>"
    provider = build_provider(load_email_config(db))
    last_error = None
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            provider.send(to_email=to_email, subject=tpl["subject"], html=html, text=text)
            db.add(
                models.EmailDeliveryLog(
                    template_key=template_key,
                    to_email=to_email,
                    status="sent",
                    attempts=attempt,
                    created_at=datetime.utcnow(),
                )
            )
            db.commit()
            return
        except Exception as exc:
            last_error = str(exc)
            logger.warning("Email attempt %s failed for %s: %s", attempt, to_email, exc)
    db.add(
        models.EmailDeliveryLog(
            template_key=template_key,
            to_email=to_email,
            status="failed",
            attempts=max_attempts,
            error_message=last_error,
            created_at=datetime.utcnow(),
        )
    )
    db.commit()
    raise RuntimeError(last_error or "Email delivery failed")
