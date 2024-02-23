from bracket.database import database
from bracket.logic.tournaments import sql_delete_tournament_completely
from bracket.models.db.account import UserAccountType
from bracket.models.db.user import User, UserInDB, UserPublic, UserToUpdate
from bracket.schema import users
from bracket.sql.clubs import get_clubs_for_user_id, sql_delete_club
from bracket.sql.tournaments import sql_get_tournaments
from bracket.utils.db import fetch_one_parsed
from bracket.utils.id_types import ClubId, TournamentId, UserId
from bracket.utils.types import assert_some


async def get_user_access_to_tournament(tournament_id: TournamentId, user_id: UserId) -> bool:
    query = """
        SELECT DISTINCT t.id
        FROM users_x_clubs
        JOIN tournaments t ON t.club_id = users_x_clubs.club_id
        WHERE user_id = :user_id
        """
    result = await database.fetch_all(query=query, values={"user_id": user_id})
    return tournament_id in {tournament.id for tournament in result}  # type: ignore[attr-defined]


async def get_which_clubs_has_user_access_to(user_id: UserId) -> set[ClubId]:
    query = """
        SELECT club_id
        FROM users_x_clubs
        WHERE user_id = :user_id
        """
    result = await database.fetch_all(query=query, values={"user_id": user_id})
    return {club.club_id for club in result}  # type: ignore[attr-defined]


async def get_user_access_to_club(club_id: ClubId, user_id: UserId) -> bool:
    return club_id in await get_which_clubs_has_user_access_to(user_id)


async def update_user(user_id: UserId, user: UserToUpdate) -> None:
    query = """
        UPDATE users
        SET name = :name, email = :email
        WHERE id = :user_id
        """
    await database.execute(
        query=query, values={"user_id": user_id, "name": user.name, "email": user.email}
    )


async def update_user_account_type(user_id: UserId, account_type: UserAccountType) -> None:
    query = """
        UPDATE users
        SET account_type = :account_type
        WHERE id = :user_id
        """
    await database.execute(
        query=query, values={"user_id": user_id, "account_type": account_type.value}
    )


async def update_user_password(user_id: UserId, password_hash: str) -> None:
    query = """
        UPDATE users
        SET password_hash = :password_hash
        WHERE id = :user_id
        """
    await database.execute(query=query, values={"user_id": user_id, "password_hash": password_hash})


async def get_user_by_id(user_id: UserId) -> UserPublic | None:
    query = """
        SELECT *
        FROM users
        WHERE id = :user_id
        """
    result = await database.fetch_one(query=query, values={"user_id": user_id})
    return UserPublic.model_validate(dict(result._mapping)) if result is not None else None


async def get_expired_demo_users() -> list[UserPublic]:
    query = """
        SELECT *
        FROM users
        WHERE account_type='DEMO'
        AND created <= NOW() - INTERVAL '30 minutes'
        """
    result = await database.fetch_all(query=query)
    return [UserPublic.model_validate(demo_user) for demo_user in result]


async def create_user(user: User) -> User:
    query = """
        INSERT INTO users (email, name, password_hash, created, account_type)
        VALUES (:email, :name, :password_hash, :created, :account_type)
        RETURNING *
        """
    result = await database.fetch_one(
        query=query,
        values={
            "password_hash": user.password_hash,
            "name": user.name,
            "email": user.email,
            "created": user.created,
            "account_type": user.account_type.value,
        },
    )
    return User.model_validate(dict(assert_some(result)._mapping))


async def delete_user(user_id: UserId) -> None:
    query = """
        DELETE FROM users
        WHERE id = :user_id
        """
    await database.fetch_one(query=query, values={"user_id": user_id})


async def check_whether_email_is_in_use(email: str) -> bool:
    query = """
        SELECT id
        FROM users
        WHERE email = :email
        """
    result = await database.fetch_one(query=query, values={"email": email})
    return result is not None


async def get_user(email: str) -> UserInDB | None:
    return await fetch_one_parsed(database, UserInDB, users.select().where(users.c.email == email))


async def delete_user_and_owned_clubs(user_id: UserId) -> None:
    for club in await get_clubs_for_user_id(user_id):
        club_id = assert_some(club.id)

        for tournament in await sql_get_tournaments((club_id,), None):
            tournament_id = assert_some(tournament.id)
            await sql_delete_tournament_completely(tournament_id)

        await sql_delete_club(club_id)

    await delete_user(user_id)
