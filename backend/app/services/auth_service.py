from hashlib import sha256

from app.schemas.user import UserPublic


class AuthService:
    def __init__(self) -> None:
        self._users = {
            "student@vokasi.dev": {
                "id": "u_student",
                "name": "Demo Student",
                "email": "student@vokasi.dev",
                "password_hash": self._hash_password("student123"),
                "role": "student",
            },
            "instructor@vokasi.dev": {
                "id": "u_instructor",
                "name": "Demo Instructor",
                "email": "instructor@vokasi.dev",
                "password_hash": self._hash_password("instructor123"),
                "role": "instructor",
            },
        }

    @staticmethod
    def _hash_password(password: str) -> str:
        return sha256(password.encode("utf-8")).hexdigest()

    def authenticate(self, email: str, password: str) -> UserPublic | None:
        record = self._users.get(email.lower())
        if not record:
            return None
        if record["password_hash"] != self._hash_password(password):
            return None
        return UserPublic(
            id=record["id"],
            name=record["name"],
            email=record["email"],
            role=record["role"],
        )

    def issue_access_token(self, user: UserPublic) -> str:
        return f"devtoken:{user.id}:{user.role}"

    def resolve_from_token(self, token: str) -> UserPublic | None:
        if not token.startswith("devtoken:"):
            return None
        parts = token.split(":")
        if len(parts) != 3:
            return None

        user_id, role = parts[1], parts[2]
        for value in self._users.values():
            if value["id"] == user_id:
                return UserPublic(
                    id=value["id"],
                    name=value["name"],
                    email=value["email"],
                    role=role,
                )
        return None


auth_service = AuthService()
