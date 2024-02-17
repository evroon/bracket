from typing import Annotated

from pydantic import PlainValidator


def accept_none_and_empty_str(value: str | None) -> None:
    if value is None or value == "":
        return None

    raise ValueError("Not an empty str or None")


EmptyStrToNone = Annotated[None, PlainValidator(accept_none_and_empty_str)]
