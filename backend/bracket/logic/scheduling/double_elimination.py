from dataclasses import dataclass
from math import log2

from fastapi import HTTPException
from starlette import status

from bracket.models.db.match import Match, MatchCreateBody
from bracket.models.db.round import BracketPosition, RoundInsertable
from bracket.models.db.stage_item_inputs import StageItemInput
from bracket.models.db.tournament import Tournament
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.matches import sql_create_match
from bracket.sql.rounds import get_rounds_for_stage_item, sql_create_round
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.id_types import MatchId, RoundId, StageItemId, TournamentId
from tests.integration_tests.mocks import MOCK_NOW


def next_power_of_2(n: int) -> int:
    """Return the smallest power of 2 >= n."""
    if n < 1:
        return 1
    return 1 << (n - 1).bit_length()


@dataclass
class BracketSlot:
    """Represents a slot in the bracket that can hold a team or be a bye."""

    team_input: StageItemInput | None = None
    is_bye: bool = False
    winner_from_match_id: MatchId | None = None
    loser_from_match_id: MatchId | None = None


def get_number_of_rounds_double_elimination(team_count: int) -> dict[BracketPosition, int]:
    """
    Calculate the number of rounds needed for each bracket section.

    For N teams (rounded up to next power of 2 for bracket structure):
    - Winners bracket: log2(bracket_size) rounds
    - Losers bracket: 2 * (log2(bracket_size) - 1) rounds
    - Grand finals: 1 round (with potential reset match)
    """
    if team_count < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of teams must be at least 2, got {team_count}",
        )

    bracket_size = next_power_of_2(team_count)
    winners_rounds = int(log2(bracket_size))
    losers_rounds = 2 * (winners_rounds - 1)

    # When byes fill more than a quarter of WR1, the losers bracket resolves
    # one round earlier because the final odd round has only one survivor
    # (nothing to pair). This applies when team_count <= 3/4 of bracket_size.
    if losers_rounds > 0 and team_count <= bracket_size * 3 // 4:
        losers_rounds -= 1

    return {
        BracketPosition.WINNERS: winners_rounds,
        BracketPosition.LOSERS: losers_rounds,
        BracketPosition.GRAND_FINALS: 1,
    }


def get_total_rounds_double_elimination(team_count: int) -> int:
    """Get total number of rounds for double elimination."""
    round_counts = get_number_of_rounds_double_elimination(team_count)
    return sum(round_counts.values())


def generate_seeded_bracket(bracket_size: int) -> list[int]:
    """Generate standard seeded bracket positions.

    Returns list of seed numbers in bracket order.
    For bracket_size=8: [1, 8, 4, 5, 2, 7, 3, 6]

    Ensures top seeds are on opposite sides and face lowest seeds first.
    """
    if bracket_size == 1:
        return [1]

    bracket = [1, 2]
    while len(bracket) < bracket_size:
        total = len(bracket) * 2 + 1
        new_bracket = []
        for seed in bracket:
            new_bracket.append(seed)
            new_bracket.append(total - seed)
        bracket = new_bracket

    return bracket


def create_first_round_slots(
    inputs: list[StageItemInput],
) -> list[BracketSlot]:
    """Assign teams to bracket slots using standard seeding.

    Top seeds get byes when team_count < bracket_size.
    Seeding ensures top seeds are on opposite halves of the bracket.
    """
    team_count = len(inputs)
    bracket_size = next_power_of_2(team_count)
    seeded_positions = generate_seeded_bracket(bracket_size)

    slots: list[BracketSlot] = []
    for seed in seeded_positions:
        if seed > team_count:
            slots.append(BracketSlot(is_bye=True))
        else:
            slots.append(BracketSlot(team_input=inputs[seed - 1]))

    return slots


async def create_rounds_for_double_elimination(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    team_count: int,
) -> dict[BracketPosition, list[RoundId]]:
    """Create all rounds for a double elimination bracket and return their IDs organized by position."""
    round_counts = get_number_of_rounds_double_elimination(team_count)
    round_ids: dict[BracketPosition, list[RoundId]] = {
        BracketPosition.WINNERS: [],
        BracketPosition.LOSERS: [],
        BracketPosition.GRAND_FINALS: [],
    }

    # Create winners bracket rounds
    for i in range(round_counts[BracketPosition.WINNERS]):
        round_id = await sql_create_round(
            RoundInsertable(
                created=MOCK_NOW,
                is_draft=False,
                stage_item_id=stage_item_id,
                name=f"Winners Round {i + 1:02d}",
                bracket_position=BracketPosition.WINNERS,
            ),
        )
        round_ids[BracketPosition.WINNERS].append(round_id)

    # Create losers bracket rounds
    for i in range(round_counts[BracketPosition.LOSERS]):
        round_id = await sql_create_round(
            RoundInsertable(
                created=MOCK_NOW,
                is_draft=False,
                stage_item_id=stage_item_id,
                name=f"Losers Round {i + 1:02d}",
                bracket_position=BracketPosition.LOSERS,
            ),
        )
        round_ids[BracketPosition.LOSERS].append(round_id)

    # Create grand finals round (includes potential reset match)
    round_id = await sql_create_round(
        RoundInsertable(
            created=MOCK_NOW,
            is_draft=False,
            stage_item_id=stage_item_id,
            name="Grand Finals",
            bracket_position=BracketPosition.GRAND_FINALS,
        ),
    )
    round_ids[BracketPosition.GRAND_FINALS].append(round_id)

    return round_ids


def create_match_body(
    round_id: RoundId,
    tournament: Tournament,
    input1_id: int | None = None,
    input2_id: int | None = None,
    winner1_from: MatchId | None = None,
    winner2_from: MatchId | None = None,
    loser1_from: MatchId | None = None,
    loser2_from: MatchId | None = None,
) -> MatchCreateBody:
    """Helper to create a match body with common fields."""
    return MatchCreateBody(
        round_id=round_id,
        court_id=None,
        stage_item_input1_id=input1_id,
        stage_item_input2_id=input2_id,
        stage_item_input1_winner_from_match_id=winner1_from,
        stage_item_input2_winner_from_match_id=winner2_from,
        stage_item_input1_loser_from_match_id=loser1_from,
        stage_item_input2_loser_from_match_id=loser2_from,
        duration_minutes=tournament.duration_minutes,
        margin_minutes=tournament.margin_minutes,
        custom_duration_minutes=None,
        custom_margin_minutes=None,
    )


async def build_double_elimination_stage_item(
    tournament_id: TournamentId, stage_item: StageItemWithRounds
) -> None:
    """
    Build the complete double elimination bracket structure with bye support.

    Handles any team count >= 2 by:
    1. Calculating bracket size (next power of 2)
    2. Distributing byes to spread them out
    3. Building winners bracket with byes advancing automatically
    4. Building losers bracket with losers byes when needed
    5. Creating grand finals with potential reset match
    """
    tournament = await sql_get_tournament(tournament_id)
    team_count = len(stage_item.inputs)

    # Get rounds organized by bracket position
    rounds = await get_rounds_for_stage_item(tournament_id, stage_item.id)

    winners_rounds = sorted(
        [r for r in rounds if r.bracket_position == BracketPosition.WINNERS],
        key=lambda r: r.id,
    )
    losers_rounds = sorted(
        [r for r in rounds if r.bracket_position == BracketPosition.LOSERS],
        key=lambda r: r.id,
    )
    grand_finals_rounds = [r for r in rounds if r.bracket_position == BracketPosition.GRAND_FINALS]

    if not winners_rounds or not grand_finals_rounds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing bracket rounds for double elimination",
        )

    # Calculate bracket structure
    bracket_size = next_power_of_2(team_count)
    first_round_slots = create_first_round_slots(stage_item.inputs)

    # Track matches and slots for building connections
    winners_matches_by_round: list[list[Match]] = []
    winners_slots_by_round: list[list[BracketSlot]] = [first_round_slots]

    # ========== BUILD WINNERS BRACKET ==========

    for round_idx, winners_round in enumerate(winners_rounds):
        current_slots = winners_slots_by_round[round_idx]
        next_slots: list[BracketSlot] = []
        round_matches: list[Match] = []

        # Process slots in pairs
        for i in range(0, len(current_slots), 2):
            slot1 = current_slots[i]
            slot2 = current_slots[i + 1] if i + 1 < len(current_slots) else BracketSlot(is_bye=True)

            # Determine what happens with this pairing
            if slot1.is_bye and slot2.is_bye:
                # Both byes - next slot is a bye (shouldn't happen with proper bye distribution)
                next_slots.append(BracketSlot(is_bye=True))
            elif slot1.is_bye:
                # Slot 1 is bye - slot 2 advances automatically
                next_slots.append(
                    BracketSlot(
                        team_input=slot2.team_input,
                        winner_from_match_id=slot2.winner_from_match_id,
                    )
                )
            elif slot2.is_bye:
                # Slot 2 is bye - slot 1 advances automatically
                next_slots.append(
                    BracketSlot(
                        team_input=slot1.team_input,
                        winner_from_match_id=slot1.winner_from_match_id,
                    )
                )
            else:
                # Both slots have teams/match winners - create a match
                match = await sql_create_match(
                    create_match_body(
                        round_id=winners_round.id,
                        tournament=tournament,
                        input1_id=slot1.team_input.id if slot1.team_input else None,
                        input2_id=slot2.team_input.id if slot2.team_input else None,
                        winner1_from=slot1.winner_from_match_id,
                        winner2_from=slot2.winner_from_match_id,
                    )
                )
                round_matches.append(match)
                next_slots.append(BracketSlot(winner_from_match_id=match.id))

        winners_matches_by_round.append(round_matches)
        if round_idx + 1 < len(winners_rounds):
            winners_slots_by_round.append(next_slots)

    # ========== BUILD LOSERS BRACKET ==========

    if not losers_rounds:
        # No losers bracket (shouldn't happen for double elimination)
        return

    losers_matches_by_round: list[list[Match]] = []
    losers_slots: list[BracketSlot] = []

    # Track which winners round's losers feed into losers bracket
    # LR1 absorbs both WR1 and WR2 losers, subsequent rounds start from WR3
    winners_round_for_losers = 2

    for losers_round_idx, losers_round in enumerate(losers_rounds):
        round_matches: list[Match] = []

        if losers_round_idx == 0:
            # First losers round: WR1 losers play WR2 losers (not each other)
            w_r1_matches = winners_matches_by_round[0]
            w_r2_matches = (
                winners_matches_by_round[1] if len(winners_matches_by_round) > 1 else []
            )

            if len(w_r1_matches) == 0 and len(w_r2_matches) == 0:
                losers_matches_by_round.append([])
                continue

            # Pair WR1 losers with WR2 losers (cross-matched to avoid rematches)
            # WR1[i] loser plays WR2[n-1-i] loser so losers from the same branch
            # don't meet in the losers bracket
            paired_count = min(len(w_r1_matches), len(w_r2_matches))
            for i in range(paired_count):
                match = await sql_create_match(
                    create_match_body(
                        round_id=losers_round.id,
                        tournament=tournament,
                        loser1_from=w_r1_matches[i].id,
                        loser2_from=w_r2_matches[paired_count - 1 - i].id,
                    )
                )
                round_matches.append(match)
                losers_slots.append(BracketSlot(winner_from_match_id=match.id))

            # Extra WR1 losers (when WR1 has more matches than WR2) pair together
            extra_wr1 = w_r1_matches[paired_count:]
            for i in range(0, len(extra_wr1), 2):
                match1 = extra_wr1[i]
                match2 = extra_wr1[i + 1] if i + 1 < len(extra_wr1) else None
                if match2:
                    match = await sql_create_match(
                        create_match_body(
                            round_id=losers_round.id,
                            tournament=tournament,
                            loser1_from=match1.id,
                            loser2_from=match2.id,
                        )
                    )
                    round_matches.append(match)
                    losers_slots.append(BracketSlot(winner_from_match_id=match.id))
                else:
                    losers_slots.append(BracketSlot(loser_from_match_id=match1.id))

            # Extra WR2 losers (when WR2 has more) get byes
            for i in range(paired_count, len(w_r2_matches)):
                losers_slots.append(BracketSlot(loser_from_match_id=w_r2_matches[i].id))

        elif losers_round_idx % 2 == 1:
            # Odd losers round (after LR1): survivors pair with each other
            new_losers_slots: list[BracketSlot] = []

            for i in range(0, len(losers_slots), 2):
                slot1 = losers_slots[i]
                slot2 = losers_slots[i + 1] if i + 1 < len(losers_slots) else None

                if slot2:
                    match = await sql_create_match(
                        create_match_body(
                            round_id=losers_round.id,
                            tournament=tournament,
                            winner1_from=slot1.winner_from_match_id,
                            winner2_from=slot2.winner_from_match_id,
                            loser1_from=slot1.loser_from_match_id,
                            loser2_from=slot2.loser_from_match_id,
                        )
                    )
                    round_matches.append(match)
                    new_losers_slots.append(BracketSlot(winner_from_match_id=match.id))
                else:
                    new_losers_slots.append(slot1)

            losers_slots = new_losers_slots

        else:
            # Even losers round (after LR1): survivors meet new losers from winners
            new_loser_matches = (
                winners_matches_by_round[winners_round_for_losers]
                if winners_round_for_losers < len(winners_matches_by_round)
                else []
            )

            new_losers_slots: list[BracketSlot] = []

            for i, survivor_slot in enumerate(losers_slots):
                if i < len(new_loser_matches):
                    new_loser_match = new_loser_matches[i]

                    if survivor_slot.winner_from_match_id:
                        match = await sql_create_match(
                            create_match_body(
                                round_id=losers_round.id,
                                tournament=tournament,
                                winner1_from=survivor_slot.winner_from_match_id,
                                loser2_from=new_loser_match.id,
                            )
                        )
                    elif survivor_slot.loser_from_match_id:
                        match = await sql_create_match(
                            create_match_body(
                                round_id=losers_round.id,
                                tournament=tournament,
                                loser1_from=survivor_slot.loser_from_match_id,
                                loser2_from=new_loser_match.id,
                            )
                        )
                    else:
                        continue

                    round_matches.append(match)
                    new_losers_slots.append(BracketSlot(winner_from_match_id=match.id))
                else:
                    new_losers_slots.append(survivor_slot)

            for i in range(len(losers_slots), len(new_loser_matches)):
                new_losers_slots.append(BracketSlot(loser_from_match_id=new_loser_matches[i].id))

            losers_slots = new_losers_slots
            winners_round_for_losers += 1

        losers_matches_by_round.append(round_matches)

    # ========== BUILD GRAND FINALS ==========

    # Winners bracket final match (the actual last match played)
    winners_final_match = winners_matches_by_round[-1][0] if winners_matches_by_round[-1] else None

    # Losers bracket champion (winner of last losers round)
    losers_final_slot = losers_slots[0] if losers_slots else None

    if grand_finals_rounds and winners_final_match and losers_final_slot:
        grand_finals_round = grand_finals_rounds[0]

        # Grand finals match 1: WB champion vs LB champion
        gf_match = await sql_create_match(
            create_match_body(
                round_id=grand_finals_round.id,
                tournament=tournament,
                winner1_from=winners_final_match.id,
                winner2_from=losers_final_slot.winner_from_match_id,
                loser2_from=losers_final_slot.loser_from_match_id,
            )
        )

        # Bracket reset match (played only if LB champion wins GF match 1)
        # Winner of GF1 in position 1, loser of GF1 in position 2
        await sql_create_match(
            create_match_body(
                round_id=grand_finals_round.id,
                tournament=tournament,
                winner1_from=gf_match.id,
                loser2_from=gf_match.id,
            )
        )
