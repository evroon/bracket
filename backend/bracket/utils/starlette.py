from starlette.requests import Request
from starlette.routing import Match, Route


def _get_route_for_request(request: Request) -> Route | None:
    """
    Determine FastAPI route for a starlette Request

    Based on: https://stackoverflow.com/a/76203889
    """

    route: Route | None = getattr(request.state, "__route_cached__", None)
    if route is not None:
        return route

    for r in request.app.routes:
        if not isinstance(r, Route):
            continue
        match, _ = r.matches(request.scope)
        if match is Match.FULL:
            request.state.__route_cached__ = r
            return r

    return None


def get_route_path(request: Request) -> str:
    if (route := _get_route_for_request(request)) is not None:
        msg = f"Expected `str` for `route.path`, got: {type(route.path).__name__}"
        assert isinstance(route.path, str), msg
        return route.path

    return f"unhandled:{request.url.path}"
