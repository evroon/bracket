from bracket.logic.scheduling.elimination import get_number_of_rounds_to_create_single_elimination
from bracket.logic.scheduling.round_robin import get_number_of_rounds_to_create_round_robin


def test_number_of_rounds_round_robin() -> None:
    assert get_number_of_rounds_to_create_round_robin(0) == 0
    assert get_number_of_rounds_to_create_round_robin(2) == 1
    assert get_number_of_rounds_to_create_round_robin(4) == 3
    assert get_number_of_rounds_to_create_round_robin(6) == 5


def test_number_of_rounds_single_elimination() -> None:
    assert get_number_of_rounds_to_create_single_elimination(0) == 0
    assert get_number_of_rounds_to_create_single_elimination(2) == 1
    assert get_number_of_rounds_to_create_single_elimination(4) == 2
    assert get_number_of_rounds_to_create_single_elimination(8) == 3
