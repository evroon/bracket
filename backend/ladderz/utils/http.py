from enum import auto

from ladderz.utils.types import EnumAutoStr


class HTTPMethod(EnumAutoStr):
    GET = auto()
    HEAD = auto()
    POST = auto()
    PUT = auto()
    DELETE = auto()
    CONNECT = auto()
    OPTIONS = auto()
    TRACE = auto()
    PATCH = auto()
