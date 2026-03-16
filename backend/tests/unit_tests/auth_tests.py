import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, status
from heliclockter import datetime_utc

from bracket.models.db.account import UserAccountType
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_is_admin
from bracket.logic.subscriptions import Subscription

@pytest.mark.asyncio
async def test_user_is_admin_success():
    mock_user_data = {
        "id": 1,
        "email": "admin@test.com",
        "name": "admin_user",
        "created": datetime_utc.now(),
        "account_type": UserAccountType.ADMIN,
        "subscription": Subscription(
            max_teams=128,
            max_players=256,
            max_clubs=32,
            max_tournaments=64,
            max_courts=32,
            max_stages=16,
            max_stage_items=64,
            max_rounds=64,
            max_rankings=16,
        )
    }
    
    mock_db_user = MagicMock()
    mock_db_user.account_type = UserAccountType.ADMIN
    mock_db_user.model_dump.return_value = mock_user_data
    with patch("bracket.routes.auth.check_jwt_and_get_user", return_value=mock_db_user) as mock_check:
        result = await user_is_admin("fake_token")

    # Assert
    assert isinstance(result, UserPublic)
    assert result.name == "admin_user"
    mock_check.assert_called_once_with("fake_token")

@pytest.mark.asyncio
async def test_user_is_admin_no_user_found():
    with patch("bracket.routes.auth.check_jwt_and_get_user", return_value=None):
        
        with pytest.raises(HTTPException) as exc_info:
            await user_is_admin("invalid_token")
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_user_is_admin_forbidden():
    mock_db_user = MagicMock()
    mock_db_user.account_type = UserAccountType.REGULAR
    
    with patch("bracket.routes.auth.check_jwt_and_get_user", return_value=mock_db_user):
        
        with pytest.raises(HTTPException) as exc_info:
            await user_is_admin("user_token")
            
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN