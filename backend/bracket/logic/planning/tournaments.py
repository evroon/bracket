import aiofiles


async def delete_tournament_logo(tournament_id: int) -> None:
    from bracket.sql.tournaments import sql_get_tournament

    tournament = await sql_get_tournament(tournament_id)
    if tournament.logo_path is not None and await aiofiles.os.path.exists(tournament.logo_path):
        await aiofiles.os.remove(tournament.logo_path)
