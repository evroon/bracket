import aiofiles.os


async def get_tournament_logo_path(tournament_id: int) -> str | None:
    from bracket.sql.tournaments import sql_get_tournament

    tournament = await sql_get_tournament(tournament_id)
    logo_path = f"static/{tournament.logo_path}" if tournament.logo_path else None
    return logo_path if logo_path is not None and await aiofiles.os.path.exists(logo_path) else None


async def delete_tournament_logo(tournament_id: int) -> None:
    logo_path = await get_tournament_logo_path(tournament_id)
    if logo_path is not None:
        await aiofiles.os.remove(logo_path)
