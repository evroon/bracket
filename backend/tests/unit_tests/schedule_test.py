import re

import pytest
from fastapi import HTTPException

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
    assert get_number_of_rounds_to_create_single_elimination(16) == 4
    assert get_number_of_rounds_to_create_single_elimination(32) == 5

    err_msg = re.escape("400: Number of teams invalid, should be one of [2, 4, 8, 16, 32]")
    with pytest.raises(HTTPException, match=err_msg):
        get_number_of_rounds_to_create_single_elimination(64)

    with pytest.raises(HTTPException, match=err_msg):
        get_number_of_rounds_to_create_single_elimination(1)
